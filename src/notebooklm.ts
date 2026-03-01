import { Notice } from "obsidian";
import { execFile } from "child_process";
import { promisify } from "util";
import type { ReportMode } from "./prompts";
import { MODES } from "./prompts";

const execFileAsync = promisify(execFile);

export interface SlideContent {
	title: string;
	bullets: string[];
}

export interface NotebookLMResult {
	summary: string;
	slides: SlideContent[];
	mode: ReportMode;
}

export class NotebookLMClient {
	private nlmPath: string;

	constructor(nlmPath: string = "nlm") {
		this.nlmPath = nlmPath;
	}

	setPath(path: string): void {
		this.nlmPath = path;
	}

	async isInstalled(): Promise<boolean> {
		try {
			await execFileAsync(this.nlmPath, ["--version"]);
			return true;
		} catch {
			return false;
		}
	}

	async isLoggedIn(): Promise<boolean> {
		try {
			const { stdout } = await execFileAsync(this.nlmPath, ["notebook", "list"]);
			return !stdout.includes("not logged in") && !stdout.includes("login");
		} catch {
			return false;
		}
	}

	async login(): Promise<boolean> {
		try {
			const installed = await this.isInstalled();
			if (!installed) {
				new Notice(
					"nlm CLI가 설치되어 있지 않습니다.\n" +
					"터미널에서 다음 명령을 실행하세요:\n" +
					"uv tool install notebooklm-mcp-cli",
					10000
				);
				return false;
			}

			await execFileAsync(this.nlmPath, ["login"]);
			new Notice("NotebookLM 로그인 성공!");
			return true;
		} catch (error) {
			new Notice("NotebookLM 로그인 실패: " + String(error));
			return false;
		}
	}

	async generateContent(
		title: string,
		content: string,
		mode: ReportMode
	): Promise<NotebookLMResult> {
		const installed = await this.isInstalled();
		if (!installed) {
			throw new Error("nlm CLI가 설치되어 있지 않습니다.");
		}

		const loggedIn = await this.isLoggedIn();
		if (!loggedIn) {
			throw new Error("NotebookLM에 로그인되어 있지 않습니다. 설정에서 로그인하세요.");
		}

		const modeConfig = MODES[mode];

		// 1. 노트북 생성
		const notebookName = `ppt-${Date.now()}`;
		let notebookId: string;

		try {
			const { stdout } = await execFileAsync(this.nlmPath, [
				"notebook", "create", notebookName
			]);
			notebookId = this.extractId(stdout);
		} catch (error) {
			throw new Error("노트북 생성 실패: " + String(error));
		}

		// 2. 소스 추가
		try {
			await execFileAsync(this.nlmPath, [
				"source", "add", notebookId, "--text", content
			]);
		} catch (error) {
			throw new Error("소스 추가 실패: " + String(error));
		}

		// 3. 요약 요청
		let summary: string;
		try {
			const { stdout } = await execFileAsync(this.nlmPath, [
				"query", notebookId, modeConfig.summaryPrompt
			]);
			summary = stdout.trim();
		} catch (error) {
			summary = "요약을 생성할 수 없습니다.";
		}

		// 4. 슬라이드 구조 요청
		let slides: SlideContent[];
		try {
			const { stdout } = await execFileAsync(this.nlmPath, [
				"query", notebookId, modeConfig.slidePrompt
			]);
			slides = this.parseSlides(stdout);
		} catch (error) {
			slides = this.fallbackSlides(title, content);
		}

		// 5. 노트북 정리
		try {
			await execFileAsync(this.nlmPath, ["notebook", "delete", notebookId]);
		} catch {
			// 삭제 실패해도 무시
		}

		return { summary, slides, mode };
	}

	private extractId(output: string): string {
		const match = output.match(/([a-zA-Z0-9_-]{10,})/);
		if (match) return match[1];
		return output.trim().split("\n").pop()?.trim() || output.trim();
	}

	private parseSlides(output: string): SlideContent[] {
		try {
			const jsonMatch = output.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]);
				if (Array.isArray(parsed) && parsed.length > 0) {
					return parsed.map((s: { title?: string; bullets?: string[] }) => ({
						title: s.title || "슬라이드",
						bullets: Array.isArray(s.bullets) ? s.bullets : []
					}));
				}
			}
		} catch {
			// JSON 파싱 실패
		}
		return [];
	}

	private fallbackSlides(title: string, content: string): SlideContent[] {
		const paragraphs = content
			.split(/\n\n+/)
			.filter(p => p.trim().length > 20)
			.slice(0, 7);

		const slides: SlideContent[] = [];
		for (const para of paragraphs) {
			const lines = para.split("\n").filter(l => l.trim());
			const slideTitle = lines[0]?.replace(/^#+\s*/, "").substring(0, 60) || title;
			const bullets = lines.slice(1).map(l => l.replace(/^[-*]\s*/, "").substring(0, 100));
			if (bullets.length === 0) {
				bullets.push(lines[0]?.substring(0, 100) || "");
			}
			slides.push({ title: slideTitle, bullets });
		}
		return slides;
	}
}
