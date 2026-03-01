import { Notice } from "obsidian";
import { execFile, spawn } from "child_process";
import { promisify } from "util";
import { homedir, tmpdir } from "os";
import { join } from "path";
import { access, constants, readFile, unlink, writeFile } from "fs/promises";
import type { ReportMode } from "./prompts";
import { MODES } from "./prompts";

const execFileAsync = promisify(execFile);

/** execFile 에러에서 실제 stderr/stdout 메시지를 추출한다. */
function execDetail(error: unknown): string {
	const e = error as Record<string, unknown>;
	// 타임아웃으로 프로세스가 강제 종료된 경우
	if (e.killed === true) {
		const secs = typeof e.timeout === "number" ? Math.round(e.timeout / 1000) : "?";
		return `처리 시간 초과 (${secs}초 — nlm 처리 지연)`;
	}
	const stderr = typeof e.stderr === "string" ? e.stderr.trim() : "";
	const stdout = typeof e.stdout === "string" ? e.stdout.trim() : "";
	return stderr || stdout || String(error);
}

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
	} catch (error: unknown) {
		const code = (error as NodeJS.ErrnoException).code;
		if (code !== "ENOENT") return configured; // Binary found, non-zero exit is OK
		// ENOENT: not in PATH — search common locations below
	}

	const binaryName = configured.split("/").pop() || configured;

	// Try login shell `which` — inherits user's PATH from ~/.zshrc / ~/.bash_profile
	// This is needed when Obsidian is launched from Finder/Spotlight without shell PATH.
	try {
		const shell = process.env.SHELL || "/bin/zsh";
		const { stdout } = await execFileAsync(
			shell, ["-l", "-c", `which ${binaryName}`],
			{ timeout: 8000 }
		);
		const found = stdout.trim();
		if (found) return found;
	} catch {
		// Shell lookup failed — fall through to directory scan
	}

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
		} catch (error: unknown) {
			// ENOENT = binary not found; non-zero exit code = binary exists but --version unsupported
			const code = (error as NodeJS.ErrnoException).code;
			return code !== "ENOENT";
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

	/**
	 * 기존 인증 정보(Chrome 프로필)를 삭제하고 새 Google 계정으로 재로그인한다.
	 * nlm login --clear 를 사용하여 계정을 완전히 전환한다.
	 */
	async launchAccountSwitch(): Promise<boolean> {
		const installed = await this.isInstalled();
		if (!installed) {
			new Notice("nlm CLI를 찾을 수 없습니다.", 6000);
			return false;
		}

		try {
			const path = await this.getPath();
			const proc = spawn(path, ["login", "--clear"], {
				detached: true,
				stdio: "ignore",
			});
			proc.unref();

			new Notice(
				"🔄 기존 계정 정보를 삭제하고 브라우저를 엽니다.\n" +
				"새 Google 계정으로 로그인하세요.\n" +
				"완료 후 '상태 확인' 버튼을 눌러 확인하세요.",
				10000
			);
			return true;
		} catch (error) {
			new Notice("계정 변경 실행 실패: " + String(error), 8000);
			return false;
		}
	}

	async generateContent(
		title: string,
		content: string,
		mode: ReportMode,
		sourceUrl?: string,
		onProgress?: (message: string) => void,
		pdfProvider?: () => Promise<string | null>
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
		// 옵시디언 title 속성을 노트북 이름으로 사용 (특수문자 제거, 80자 제한)
		const notebookName = title
			.replace(/[^\w\s가-힣\-_.]/g, "")
			.trim()
			.slice(0, 80)
			|| `ppt-${Date.now()}`;
		let notebookId: string;

		try {
			const { stdout: createOut } = await execFileAsync(
				path, ["notebook", "create", notebookName],
				{ timeout: 30000 }
			);
			// UUID 또는 20자+ ID가 있으면 사용, 없으면 이름으로 참조
			const uuidMatch = createOut.match(
				/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
			);
			const longIdMatch = createOut.match(/[a-zA-Z0-9_-]{20,}/);
			notebookId = uuidMatch?.[0] ?? longIdMatch?.[0] ?? notebookName;
			onProgress?.("↳ 노트북 생성 완료\nID: " + notebookId + "\ncreate 출력: " + (createOut.trim() || "(없음)"));
			// 노트북이 소스를 받을 준비가 될 때까지 잠시 대기
			await new Promise(r => setTimeout(r, 3000));
		} catch (error) {
			throw new Error("노트북 생성 실패: " + execDetail(error));
		}

		let exportedPdfPath: string | null = null;
		let uploadSucceeded = false;
		try {
			// 2. 소스 추가
			const truncated = content.length > 30000
				? content.slice(0, 30000) + "\n...(내용 생략)"
				: content;
			let sourceAdded = false;

			// 2a. URL 소스 시도
			if (sourceUrl) {
				onProgress?.("2/5  URL 소스 업로드 중...\n(NotebookLM AI 인덱싱 — 최대 1분 소요)");
				try {
					await execFileAsync(
						path, ["source", "add", notebookId, "--url", sourceUrl, "--wait"],
						{ timeout: 300000 }
					);
					sourceAdded = true;
					uploadSucceeded = true;
					onProgress?.("↳ URL 업로드 완료");
				} catch {
					onProgress?.("↳ URL 크롤링 실패 → PDF 변환으로 전환");
				}
			} else {
				onProgress?.("2/5  소스 업로드 준비 중...\n(URL 없음 → PDF 변환 시도)");
			}

			// 2b. PDF 변환 후 --file 시도
			if (!sourceAdded) {
				onProgress?.("2b/5  PDF 변환 중...\n(Obsidian 내보내기 — 최대 30초 소요)");
				const tmpPdfPath = pdfProvider
					? await pdfProvider()
					: await this.convertMarkdownToPdf(title, truncated);
				if (tmpPdfPath) {
					exportedPdfPath = tmpPdfPath;
					onProgress?.("↳ PDF 변환 성공: " + tmpPdfPath);
					try {
						await execFileAsync(
							path, ["source", "add", notebookId, "--file", tmpPdfPath, "--wait"],
							{ timeout: 300000 }
						);
						sourceAdded = true;
						uploadSucceeded = true;
						onProgress?.("↳ PDF 업로드 완료");
					} catch (pdfErr) {
						onProgress?.("↳ PDF 업로드 실패\n" + execDetail(pdfErr) + "\n→ 텍스트 파일로 전환");
					}
				} else {
					onProgress?.("↳ PDF 변환 불가 → 텍스트로 전환");
				}
			}

			// 2c. 정제된 텍스트를 .txt 파일로 저장 후 --file 업로드 (최종 폴백)
			if (!sourceAdded) {
				onProgress?.("2c/5  텍스트 파일 업로드 중...\n(마크다운 정제 후 .txt 저장)");
				const cleanedText = this.cleanTextForSource(truncated);
				if (!cleanedText) {
					throw new Error("소스 추가 실패: 노트 본문이 비어 있습니다.");
				}
				const tmpTxtPath = join(tmpdir(), `nlm-src-${Date.now()}.txt`);
				try {
					await writeFile(tmpTxtPath, cleanedText, "utf-8");
					await execFileAsync(
						path, ["source", "add", notebookId, "--file", tmpTxtPath, "--wait"],
						{ timeout: 300000 }
					);
					onProgress?.("↳ txt 업로드 완료");
				} catch (txtErr) {
					// .txt --file 실패 시 --text 직접 전달로 최후 시도
					onProgress?.("↳ txt 업로드 실패\n" + execDetail(txtErr) + "\n→ --text 직접 전달 시도");
					try {
						await execFileAsync(
							path, ["source", "add", notebookId, "--text", cleanedText],
							{ timeout: 300000 }
						);
						onProgress?.("↳ 텍스트 추가 완료");
					} catch (error) {
						throw new Error("소스 추가 실패: " + execDetail(error));
					}
				} finally {
					unlink(tmpTxtPath).catch(() => {});
				}
			}

			// 3. 노트북 개요 가져오기 (NotebookLM 자동 생성 요약)
			onProgress?.("3/5  AI 요약 생성 중...\n(NotebookLM 노트북 개요 — 최대 30초 소요)");
			let summary: string;
			try {
				const { stdout } = await execFileAsync(
					path, ["notebook", "describe", notebookId, "--json"],
					{ timeout: 60000 }
				);
				try {
					const parsed = JSON.parse(stdout.trim()) as { value?: { summary?: string[] } };
					const lines: string[] = parsed?.value?.summary ?? [];
					summary = lines.join("\n\n").trim() || stdout.trim();
				} catch {
					summary = stdout.trim();
				}
			} catch (describeErr) {
				onProgress?.("↳ 요약 실패: " + execDetail(describeErr));
				summary = "요약을 생성할 수 없습니다.";
			}

			// 4. 슬라이드 생성 및 완료 대기 (NotebookLM Studio — 최대 3회 재시도)
			onProgress?.("4/5  슬라이드 생성 시작 중...\n(1분마다 상태 확인, 최대 20분 대기)");
			let artifactId = "";
			{
				const maxRetries = 3;
				let lastErr: unknown;
				for (let attempt = 1; attempt <= maxRetries; attempt++) {
					if (attempt > 1) {
						onProgress?.(`↳ 재시도 ${attempt}/${maxRetries} — 30초 대기 중...`);
						await new Promise(r => setTimeout(r, 30000));
					}
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
							{ timeout: 60000 }
						);
						const id = this.extractArtifactId(stdout);
						if (!id) throw new Error("Artifact ID를 찾을 수 없습니다");
						onProgress?.("↳ 슬라이드 생성 시작됨 (ID: " + id + ")");
						await this.waitForArtifact(path, notebookId, id, onProgress);
						artifactId = id;
						onProgress?.("↳ 슬라이드 생성 완료!");
						lastErr = null;
						break;
					} catch (error) {
						lastErr = error;
						onProgress?.(`↳ 시도 ${attempt} 실패: ` + execDetail(error));
					}
				}
				if (lastErr) throw new Error("슬라이드 생성 실패: " + execDetail(lastErr));
			}

			// 5. PDF 다운로드
			onProgress?.("5/5  PDF 다운로드 중...");
			const tmpPath = join(tmpdir(), `nlm-${Date.now()}.pdf`);
			try {
				await execFileAsync(
					path, [
						"download", "slide-deck", notebookId,
						"--id", artifactId,
						"--format", "pdf",
						"--output", tmpPath,
						"--no-progress",
					],
					{ timeout: 120000 }
				);
			} catch (error) {
				throw new Error("PDF 다운로드 실패: " + execDetail(error));
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
			// PDF 정리 — 업로드 성공 시에만 삭제, 실패 시 exportPDF 폴더에 보존
			if (exportedPdfPath && uploadSucceeded) unlink(exportedPdfPath).catch(() => {});
		}
	}

	/**
	 * 마크다운 텍스트를 PDF로 변환한다.
	 * Electron BrowserWindow → pandoc 순으로 시도하며, 모두 실패하면 null을 반환한다.
	 */
	private async convertMarkdownToPdf(title: string, text: string): Promise<string | null> {
		const tmpPdfPath = join(tmpdir(), `nlm-src-${Date.now()}.pdf`);
		const escaped = text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
		const html =
			`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>` +
			`<style>body{font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;` +
			`font-size:11pt;line-height:1.6;padding:50px;white-space:pre-wrap;word-wrap:break-word;}</style>` +
			`</head><body>${escaped}</body></html>`;

		// 1. Electron BrowserWindow 시도 (Obsidian 렌더러 환경)
		try {
			let BrowserWindow: any = null;
			for (const mod of ["@electron/remote", "electron"]) {
				try {
					const m = (globalThis as any).require?.(mod);
					const remote = mod === "electron" ? m?.remote : m;
					if (remote?.BrowserWindow) { BrowserWindow = remote.BrowserWindow; break; }
				} catch { /* 모듈 없음 */ }
			}
			if (BrowserWindow) {
				const win = new BrowserWindow({
					show: false,
					webPreferences: { nodeIntegration: false, contextIsolation: true },
				});
				await new Promise<void>((resolve, reject) => {
					win.webContents.once("did-finish-load", resolve);
					win.webContents.once("did-fail-load", (_: unknown, code: number) => reject(new Error(String(code))));
					win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
				});
				const pdfBuffer: Buffer = await win.webContents.printToPDF({ pageSize: "A4" });
				win.destroy();
				await writeFile(tmpPdfPath, pdfBuffer);
				return tmpPdfPath;
			}
		} catch { /* Electron API 없음 — 다음 방법으로 */ }

		// 2. pandoc 시도 (brew install pandoc 등으로 설치된 경우)
		const tmpMdPath = join(tmpdir(), `nlm-src-${Date.now()}.md`);
		try {
			await writeFile(tmpMdPath, `# ${title}\n\n${text}`, "utf-8");
			for (const pandoc of ["pandoc", "/opt/homebrew/bin/pandoc", "/usr/local/bin/pandoc"]) {
				try {
					await execFileAsync(pandoc, [tmpMdPath, "-o", tmpPdfPath], { timeout: 30000 });
					return tmpPdfPath;
				} catch { /* 이 경로에 없음 */ }
			}
		} finally {
			unlink(tmpMdPath).catch(() => {});
		}

		return null; // PDF 변환 불가 — .txt 폴백 사용
	}

	/** NotebookLM --text 소스 추가를 위해 마크다운 문법을 제거하고 순수 텍스트로 정제 */
	private cleanTextForSource(text: string): string {
		return text
			.replace(/!\[.*?\]\(.*?\)/g, "")             // 이미지 제거
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")    // 링크 → 텍스트
			.replace(/^#{1,6}\s+/gm, "")                   // 헤더 마크 제거
			.replace(/\*\*([^*]+)\*\*/g, "$1")           // 볼드 → 텍스트
			.replace(/\*([^*]+)\*/g, "$1")                 // 이탤릭 → 텍스트
			.replace(/`{3}[\s\S]*?`{3}/g, "")              // 코드 블록 제거
			.replace(/`[^`]+`/g, "")                         // 인라인 코드 제거
			.replace(/^\s*\|.*\|\s*$/gm, "")             // 테이블 행 제거
			.replace(/^\s*[-|:=]{3,}\s*$/gm, "")           // 테이블 구분선 제거
			.replace(/^\s*[-*+]\s+/gm, "")                 // 리스트 마커 제거
			.replace(/^\s*\d+\.\s+/gm, "")               // 번호 리스트 마커 제거
			.replace(/^>\s*/gm, "")                         // 인용구 마커 제거
			.replace(/\n{3,}/g, "\n\n")                   // 연속 빈줄 정리
			.trim();
	}

	/**
	 * Studio artifact가 "completed" 상태가 될 때까지 폴링한다.
	 * - 1분 간격으로 studio status --json 호출
	 * - 1초마다 사이드바에 경과 시간 표시
	 * - "failed" 또는 3회 연속 "unknown" 시 재시도 가능 에러를 throw
	 * - 최대 20분 대기 후 타임아웃
	 */
	private async waitForArtifact(
		path: string,
		notebookId: string,
		artifactId: string,
		onProgress?: (message: string) => void
	): Promise<void> {
		const pollIntervalMs = 60 * 1000;          // 1분마다 API 폴링
		const maxWaitMs = 20 * 60 * 1000;          // 최대 20분 대기
		const tickMs = 1000;                        // 1초마다 사이드바 업데이트
		const startTime = Date.now();
		let lastPollTime = Date.now() - pollIntervalMs; // 즉시 첫 폴링
		let unknownCount = 0;

		while (true) {
			await new Promise(r => setTimeout(r, tickMs));

			const elapsed = Date.now() - startTime;
			const mins = Math.floor(elapsed / 60000);
			const secs = Math.floor((elapsed % 60000) / 1000);
			const timeStr = `${mins}분 ${String(secs).padStart(2, "0")}초 경과`;

			if (Date.now() - lastPollTime >= pollIntervalMs) {
				// 1분마다 API 폴링
				try {
					const { stdout: statusOut } = await execFileAsync(
						path, ["studio", "status", notebookId, "--json"],
						{ timeout: 15000 }
					);
					let status = "unknown";
					try {
						const artifacts = JSON.parse(statusOut) as Array<{ id: string; status: string }>;
						status = artifacts.find(a => a.id === artifactId)?.status ?? "unknown";
					} catch { /* JSON 파싱 실패 */ }
					lastPollTime = Date.now();

					if (status === "completed") return;
					if (status === "failed") {
						throw new Error("슬라이드 생성 실패 (failed 상태)");
					}
					if (status === "unknown") {
						unknownCount++;
						if (unknownCount >= 3) {
							throw new Error(`슬라이드 상태 확인 불가 (${unknownCount}회 연속 unknown)`);
						}
					} else {
						unknownCount = 0; // "generating" 등 정상 상태면 초기화
					}
				} catch (error) {
					const msg = String(error);
					if (msg.includes("실패") || msg.includes("확인 불가")) throw error;
					lastPollTime = Date.now();
				}
			}

			onProgress?.(`↳ 슬라이드 생성 중... | ${timeStr}`);

			if (elapsed >= maxWaitMs) {
				throw new Error("슬라이드 생성 시간 초과 (20분 초과)");
			}
		}
	}

	private extractId(output: string): string {
		// 마지막 줄 우선 (대부분의 CLI는 생성된 ID를 마지막에 출력)
		const lines = output.trim().split("\n").map(l => l.trim()).filter(Boolean);
		for (let i = lines.length - 1; i >= 0; i--) {
			const m = lines[i].match(/^([a-zA-Z0-9_-]{6,})$/);
			if (m) return m[1];
		}
		// fallback: 첫 번째 긴 토큰
		const match = output.match(/([a-zA-Z0-9_-]{10,})/);
		if (match) return match[1];
		return lines[lines.length - 1] || output.trim();
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
