import { Notice } from "obsidian";
import { execFile, spawn } from "child_process";
import { promisify } from "util";
import { homedir, tmpdir } from "os";
import { join } from "path";
import { access, constants, readFile, unlink, writeFile } from "fs/promises";
import type { ReportMode } from "./prompts";
import { MODES } from "./prompts";

const execFileAsync = promisify(execFile);

// Common binary installation paths that GUI apps may not inherit via $PATH.
// When Obsidian is launched from Finder/Spotlight, it does not inherit the
// terminal $PATH, so binaries installed via uv/brew/cargo won't be found.
const NLM_SEARCH_DIRS = [
	join(homedir(), ".local", "bin"),    // uv tool install (default)
	join(homedir(), ".cargo", "bin"),    // cargo install
	"/opt/homebrew/bin",                 // macOS Homebrew (Apple Silicon)
	"/usr/local/bin",                    // macOS Homebrew (Intel) / manual
	"/usr/bin",
];

/**
 * Resolve the actual binary path for the configured name/path.
 * Falls back to searching common installation directories when the binary
 * is not found in the current process PATH.
 */
async function findNlmBinary(configured: string): Promise<string> {
	// Absolute path — use as-is
	if (configured.startsWith("/") || configured.startsWith("~")) {
		return configured;
	}

	// Try configured value first (works when $PATH is correct)
	try {
		await execFileAsync(configured, ["--version"], { timeout: 5000 });
		return configured;
	} catch {
		// Not in PATH — search common locations below
	}

	const binaryName = configured.split("/").pop() || configured;
	for (const dir of NLM_SEARCH_DIRS) {
		const candidate = join(dir, binaryName);
		try {
			await access(candidate, constants.X_OK);
			return candidate;
		} catch {
			// Not found or not executable in this dir
		}
	}

	return configured; // Fall back; isInstalled() will surface the error
}

export interface NotebookLMResult {
	summary: string;
	pptxBuffer: ArrayBuffer;
	mode: ReportMode;
}

export class NotebookLMClient {
	private nlmPath: string;
	private resolvedPath: string | null = null;

	constructor(nlmPath: string = "nlm") {
		this.nlmPath = nlmPath;
	}

	setPath(path: string): void {
		this.nlmPath = path;
		this.resolvedPath = null; // Reset cache when config changes
	}

	/** Returns the resolved binary path, searching common locations if needed. */
	private async getPath(): Promise<string> {
		if (!this.resolvedPath) {
			this.resolvedPath = await findNlmBinary(this.nlmPath);
		}
		return this.resolvedPath;
	}

	async isInstalled(): Promise<boolean> {
		try {
			const path = await this.getPath();
			await execFileAsync(path, ["--version"], { timeout: 5000 });
			return true;
		} catch {
			return false;
		}
	}

	async isLoggedIn(): Promise<boolean> {
		try {
			const path = await this.getPath();
			const { stdout } = await execFileAsync(
				path, ["notebook", "list"],
				{ timeout: 15000 }
			);
			return (
				!stdout.includes("not logged in") &&
				!stdout.includes("login")
			);
		} catch {
			return false;
		}
	}

	/**
	 * Launch the nlm OAuth browser login flow without blocking Obsidian.
	 * The process is spawned detached so the browser opens and the OAuth
	 * callback server runs independently. Returns true if the launch succeeded.
	 */
	async launchLogin(): Promise<boolean> {
		const installed = await this.isInstalled();
		if (!installed) {
			new Notice(
				"nlm CLI를 찾을 수 없습니다.\n" +
				"터미널에서 먼저 설치하세요:\n\n" +
				"  uv tool install notebooklm-mcp-cli\n\n" +
				"설치 후 설정에서 경로를 확인하거나\n" +
				"절대 경로(예: /Users/you/.local/bin/nlm)를 직접 입력하세요.",
				12000
			);
			return false;
		}

		try {
			const path = await this.getPath();
			const proc = spawn(path, ["login"], {
				detached: true,
				stdio: "ignore",
			});
			proc.unref();

			new Notice(
				"🌐 브라우저가 열립니다. Google 계정으로 로그인하세요.\n" +
				"완료 후 '상태 확인' 버튼을 눌러 확인하세요.",
				8000
			);
			return true;
		} catch (error) {
			new Notice("로그인 실행 실패: " + String(error), 8000);
			return false;
		}
	}

	async generateContent(
		title: string,
		content: string,
		mode: ReportMode,
		removeBranding: boolean = true,
		onProgress?: (message: string) => void
	): Promise<NotebookLMResult> {
		const path = await this.getPath();

		const installed = await this.isInstalled();
		if (!installed) {
			throw new Error(
				"nlm CLI를 찾을 수 없습니다.\n" +
				"터미널에서 'uv tool install notebooklm-mcp-cli'를 실행하거나,\n" +
				"설정에서 nlm 경로를 절대 경로로 지정하세요.\n" +
				"예: /Users/yourname/.local/bin/nlm"
			);
		}

		const loggedIn = await this.isLoggedIn();
		if (!loggedIn) {
			throw new Error(
				"NotebookLM에 로그인되어 있지 않습니다.\n" +
				"설정 탭에서 '브라우저로 로그인' 버튼을 클릭하거나,\n" +
				"터미널에서 'nlm login'을 실행하세요."
			);
		}

		const modeConfig = MODES[mode];

		// 1. 노트북 생성
		onProgress?.("1/5  노트북 생성 중...");
		const notebookName = `ppt-${Date.now()}`;
		let notebookId: string;

		try {
			const { stdout } = await execFileAsync(
				path, ["notebook", "create", notebookName],
				{ timeout: 30000 }
			);
			notebookId = this.extractId(stdout);
		} catch (error) {
			throw new Error("노트북 생성 실패: " + String(error));
		}

		try {
			// 2. 소스 추가 (임시 파일 경유 — CLI 인자 길이 제한 우회)
			onProgress?.("2/5  소스 업로드 중...\n(NotebookLM AI 인덱싱 — 최대 1분 소요)");
			const tmpSourcePath = join(tmpdir(), `nlm-source-${Date.now()}.md`);
			try {
				await writeFile(tmpSourcePath, content, "utf8");
				await execFileAsync(
					path, ["source", "add", notebookId, "--file", tmpSourcePath],
					{ timeout: 60000 }
				);
			} catch (error) {
				throw new Error("소스 추가 실패: " + String(error));
			} finally {
				unlink(tmpSourcePath).catch(() => {});
			}

			// 3. 요약 요청
			onProgress?.("3/5  AI 요약 생성 중...\n(NotebookLM 응답 대기 — 최대 2분 소요)");
			let summary: string;
			try {
				const { stdout } = await execFileAsync(
					path, ["query", notebookId, modeConfig.summaryPrompt],
					{ timeout: 120000 }
				);
				summary = stdout.trim();
			} catch {
				summary = "요약을 생성할 수 없습니다.";
			}

			// 4. 슬라이드 생성 (NotebookLM Studio)
			onProgress?.("4/5  슬라이드 생성 중...\n(NotebookLM Studio — 최대 3분 소요)");
			let artifactId: string;
			try {
				const { stdout } = await execFileAsync(
					path, [
						"slides", "create", notebookId,
						"--format", modeConfig.slidesFormat,
						"--length", modeConfig.slidesLength,
						"--focus", modeConfig.focusPrompt,
						"--language", "ko",
						"--confirm",
					],
					{ timeout: 300000 }
				);
				artifactId = this.extractArtifactId(stdout);
			} catch (error) {
				throw new Error("슬라이드 생성 실패: " + String(error));
			}

			// 4b. NotebookLM 브랜딩 제거 (선택사항)
			if (removeBranding && artifactId) {
				try {
					const { stdout } = await execFileAsync(
						path, [
							"slides", "revise", artifactId,
							"--slide", "1 표지 슬라이드에서 NotebookLM 로고와 워터마크를 모두 제거하세요",
							"--confirm",
						],
						{ timeout: 180000 }
					);
					const revisedId = this.extractArtifactId(stdout);
					if (revisedId) {
						artifactId = revisedId;
					}
				} catch {
					// 브랜딩 제거 실패 시 원본 사용
				}
			}

			// 5. PPTX 다운로드
			onProgress?.("5/5  PPTX 다운로드 중...");
			const tmpPath = join(tmpdir(), `nlm-${Date.now()}.pptx`);
			try {
				await execFileAsync(
					path, [
						"download", "slide-deck", notebookId,
						"--id", artifactId,
						"--format", "pptx",
						"--output", tmpPath,
						"--no-progress",
					],
					{ timeout: 120000 }
				);
			} catch (error) {
				throw new Error("PPTX 다운로드 실패: " + String(error));
			}

			// 파일 읽기 → ArrayBuffer
			const fileBuffer = await readFile(tmpPath);
			const pptxBuffer = fileBuffer.buffer.slice(
				fileBuffer.byteOffset,
				fileBuffer.byteOffset + fileBuffer.byteLength
			) as ArrayBuffer;

			// 임시 파일 정리
			unlink(tmpPath).catch(() => {});

			return { summary, pptxBuffer, mode };
		} finally {
			// 노트북 정리 — 실패해도 무시
			execFileAsync(path, ["notebook", "delete", notebookId], { timeout: 10000 })
				.catch(() => {});
		}
	}

	private extractId(output: string): string {
		const match = output.match(/([a-zA-Z0-9_-]{10,})/);
		if (match) return match[1];
		return output.trim().split("\n").pop()?.trim() || output.trim();
	}

	private extractArtifactId(output: string): string {
		// UUID 형태 (예: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
		const uuidMatch = output.match(
			/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
		);
		if (uuidMatch) return uuidMatch[0];

		// 긴 alphanumeric ID (20자 이상)
		const longMatch = output.match(/[a-zA-Z0-9_-]{20,}/);
		if (longMatch) return longMatch[0];

		// 마지막 줄 fallback
		return output.trim().split("\n").pop()?.trim() || "";
	}
}
