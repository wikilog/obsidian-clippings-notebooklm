import { Plugin, TFile, MarkdownView, addIcon } from "obsidian";
import { access, constants } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const NOTEBOOKLM_ICON_ID = "notebooklm";
const NOTEBOOKLM_ICON_SVG = `
<rect x="8" y="5" width="78" height="90" rx="8" fill="none" stroke="currentColor" stroke-width="6"/>
<line x1="26" y1="5" x2="26" y2="95" stroke="currentColor" stroke-width="6"/>
<path d="M70 13 L75 24 L86 29 L75 34 L70 45 L65 34 L54 29 L65 24 Z" fill="currentColor"/>
<line x1="36" y1="60" x2="78" y2="60" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
<line x1="36" y1="75" x2="78" y2="75" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
`;
import { NotebookLMClient } from "./notebooklm";
import { ModeSelectionModal } from "./mode-modal";
import { MODES } from "./prompts";
import type { ReportMode } from "./prompts";
import {
	ClippingsPptSettingTab,
	ClippingsPptSettings,
	DEFAULT_SETTINGS,
} from "./settings";
import {
	ClippingsSidebarView,
	VIEW_TYPE_SIDEBAR,
	HistoryItem,
} from "./sidebar";


export default class ClippingsPptPlugin extends Plugin {
	settings: ClippingsPptSettings = DEFAULT_SETTINGS;
	nlmClient: NotebookLMClient = new NotebookLMClient();
	history: HistoryItem[] = [];
	isRunning = false;

	async onload(): Promise<void> {
		addIcon(NOTEBOOKLM_ICON_ID, NOTEBOOKLM_ICON_SVG);
		await this.loadSettings();
		this.nlmClient = new NotebookLMClient(this.settings.nlmPath);

		this.addSettingTab(new ClippingsPptSettingTab(this.app, this));

		// 사이드바 뷰 등록
		this.registerView(
			VIEW_TYPE_SIDEBAR,
			(leaf) => new ClippingsSidebarView(leaf, this)
		);

		// 리본 아이콘으로 사이드바 토글
		this.addRibbonIcon(NOTEBOOKLM_ICON_ID, "Clippings NotebookLM", () => {
			this.toggleSidebar();
		});

		// Command Palette 커맨드
		this.addCommand({
			id: "generate-ppt-notebooklm",
			name: "NotebookLM으로 PPT 만들기",
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view?.file) return false;
				if (!view.file.path.startsWith(this.settings.clippingsFolder + "/")) {
					return false;
				}
				if (!checking) {
					const modal = new ModeSelectionModal(this.app);
					modal.open().then((mode) => {
						if (mode && view.file) {
							this.handleGeneratePpt(view.file, mode);
						}
					});
				}
				return true;
			},
		});
	}

	async toggleSidebar(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_SIDEBAR);
		if (existing.length > 0) {
			this.app.workspace.detachLeavesOfType(VIEW_TYPE_SIDEBAR);
			return;
		}
		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({ type: VIEW_TYPE_SIDEBAR, active: true });
			this.app.workspace.revealLeaf(leaf);
		}
	}

	private refreshSidebar(): void {
		this.app.workspace.getLeavesOfType(VIEW_TYPE_SIDEBAR).forEach((leaf) => {
			if (leaf.view instanceof ClippingsSidebarView) {
				leaf.view.renderHistory();
			}
		});
	}

	async handleGeneratePpt(
		file: TFile,
		mode: ReportMode
	): Promise<void> {
		const modeConfig = MODES[mode];

		// 동시 실행 방지
		if (this.isRunning) return;
		this.isRunning = true;

		// 히스토리에 진행 중 항목 추가
		const historyItem: HistoryItem = {
			title: file.basename,
			mode: modeConfig.label,
			modeIcon: modeConfig.icon,
			status: "running",
			date: new Date(),
			log: ["연결 중..."],
		};
		this.history.push(historyItem);
		this.refreshSidebar();

		try {
			const content = await this.app.vault.read(file);
			const { frontmatter, body } = this.parseFrontmatter(content);

			const title = frontmatter.title || file.basename;
			const source = frontmatter.source || "";

			const result = await this.nlmClient.generateContent(
				title,
				body,
				mode,
				this.settings.removeBranding,
				source || undefined,
				(step) => {
					historyItem.log = historyItem.log ?? [];
					historyItem.log.push(step.split("\n")[0]);
					this.refreshSidebar();
				},
				() => this.exportFileToPdf(file)
			);

			// 출력 경로: Clippings/PDF/
			const outputFolder = `${this.settings.clippingsFolder}/${this.settings.outputSubfolder}`;
			const pptFileName = `${file.basename}.pptx`;
			const pptPath = `${outputFolder}/${pptFileName}`;

			// 폴더 생성
			if (!this.app.vault.getAbstractFileByPath(outputFolder)) {
				await this.app.vault.createFolder(outputFolder);
			}

			// PPTX 저장
			const existingFile = this.app.vault.getAbstractFileByPath(pptPath);
			if (existingFile instanceof TFile) {
				await this.app.vault.modifyBinary(existingFile, result.pptxBuffer);
			} else {
				await this.app.vault.createBinary(pptPath, result.pptxBuffer);
			}

			// md 파일에 요약 + 링크 삽입
			await this.insertSummaryAndLink(
				file, content, result.summary, pptPath, modeConfig
			);

			// 히스토리 성공 업데이트
			historyItem.status = "success";
			historyItem.pptPath = pptPath;
			historyItem.log?.push(`✓ 완료: ${pptFileName}`);
			this.refreshSidebar();
		} catch (error) {
			// 히스토리 실패 업데이트
			const rawMsg = String(error);
			historyItem.status = "error";
			historyItem.errorMsg = this.classifyError(rawMsg);
			// 원시 에러 전체를 로그에 기록 (pre-wrap으로 줄바꿈 표시)
			historyItem.log?.push("✗ 오류: " + rawMsg);
			this.refreshSidebar();
			console.error("[Clippings NotebookLM] PPT 생성 오류:", error);
		} finally {
			this.isRunning = false;
		}
	}

	/**
	 * Obsidian 내장 "PDF로 내보내기" 명령을 트리거하여 임시 PDF 파일 경로를 반환한다.
	 * Electron remote 모듈이 없거나 내보내기 실패 시 null 반환.
	 */
	private async exportFileToPdf(file: TFile): Promise<string | null> {
		const tmpPdfPath = join(tmpdir(), `nlm-src-${Date.now()}.pdf`);
		try {
			// 파일을 활성 리프에서 열기
			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(file);

			// Electron remote를 통해 save dialog를 임시 경로로 패치
			let remote: Record<string, unknown> | null = null;
			for (const mod of ["@electron/remote", "electron"]) {
				try {
					const m = (globalThis as any).require?.(mod);
					const r = mod === "electron" ? (m as any)?.remote : m;
					if ((r as any)?.dialog) { remote = r as Record<string, unknown>; break; }
				} catch { /* 모듈 없음 */ }
			}
			if (!remote) return null;

			const dialog = (remote as any).dialog;
			const origSync = dialog.showSaveDialogSync;
			const origAsync = dialog.showSaveDialog;
			dialog.showSaveDialogSync = () => tmpPdfPath;
			dialog.showSaveDialog = async () => ({ canceled: false, filePath: tmpPdfPath });

			try {
				(this.app as any).commands.executeCommandById("workspace:export-pdf");
				// PDF 파일이 생성될 때까지 폴링 (최대 30초)
				const deadline = Date.now() + 30000;
				while (Date.now() < deadline) {
					await new Promise(r => setTimeout(r, 500));
					try {
						await access(tmpPdfPath, constants.F_OK);
						return tmpPdfPath; // 파일 생성 확인
					} catch { /* 아직 없음 */ }
				}
			} finally {
				dialog.showSaveDialogSync = origSync;
				dialog.showSaveDialog = origAsync;
			}
		} catch { /* Electron API 없음 또는 실패 */ }
		return null;
	}

	private classifyError(msg: string): string {
		if (msg.includes("소스 추가 실패")) {
			return "📄 소스 업로드 실패.\n노트의 source URL을 확인하거나 잠시 후 다시 시도하세요.";
		} else if (msg.includes("슬라이드 생성 실패")) {
			return "🎨 슬라이드 생성 실패.\n잠시 후 다시 시도하세요.";
		} else if (msg.includes("다운로드 실패")) {
			return "⬇️ PPTX 다운로드 실패.\n잠시 후 다시 시도하세요.";
		} else if (msg.includes("로그인") || msg.includes("login")) {
			return "🔐 NotebookLM 로그인이 필요합니다.\n설정 → 브라우저로 로그인";
		} else if (msg.includes("찾을 수 없습니다") || msg.includes("not found") || msg.includes("ENOENT")) {
			return "⚠️ nlm CLI를 찾을 수 없습니다.\n설정에서 경로를 확인하세요.";
		}
		return "❌ PPT 생성 실패.\n개발자 도구 콘솔(Ctrl+Shift+I)에서 자세한 오류를 확인하세요.";
	}

	private async insertSummaryAndLink(
		file: TFile,
		originalContent: string,
		summary: string,
		pptPath: string,
		modeConfig: { icon: string; label: string }
	): Promise<void> {
		const { raw: rawFrontmatter, body } = this.parseFrontmatter(originalContent);

		const summaryBlock =
			`> [!summary] ${modeConfig.icon} ${modeConfig.label}\n` +
			summary
				.split("\n")
				.map((line) => `> ${line}`)
				.join("\n") +
			`\n>\n> 📎 **PPT:** [[${pptPath}]]`;

		let newBody: string;
		if (body.includes("> [!summary]")) {
			newBody = body.replace(
				/> \[!summary\][\s\S]*?(?=\n[^>]|\n\n[^>]|$)/,
				summaryBlock
			);
		} else {
			newBody = summaryBlock + "\n\n" + body;
		}

		const newContent = rawFrontmatter
			? rawFrontmatter + "\n" + newBody
			: newBody;

		await this.app.vault.modify(file, newContent);
	}

	private parseFrontmatter(content: string): {
		frontmatter: Record<string, string>;
		body: string;
		raw: string;
	} {
		const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
		if (!fmMatch) {
			return { frontmatter: {}, body: content, raw: "" };
		}

		const raw = fmMatch[0].trimEnd();
		const body = content.slice(fmMatch[0].length);
		const frontmatter: Record<string, string> = {};

		for (const line of fmMatch[1].split("\n")) {
			const colonIdx = line.indexOf(":");
			if (colonIdx > 0) {
				const key = line.slice(0, colonIdx).trim();
				const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
				frontmatter[key] = value;
			}
		}

		return { frontmatter, body, raw };
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
