import { Plugin, Notice, TFile, MarkdownView } from "obsidian";
import { NotebookLMClient } from "./notebooklm";
import { generatePptx } from "./ppt-generator";
import { ModeSelectionModal } from "./mode-modal";
import { MODES } from "./prompts";
import type { ReportMode } from "./prompts";
import {
	ClippingsPptSettingTab,
	ClippingsPptSettings,
	DEFAULT_SETTINGS,
} from "./settings";

function setButtonContent(btn: HTMLButtonElement, icon: string, text: string): void {
	btn.empty();
	const iconSpan = document.createElement("span");
	iconSpan.className = "clippings-ppt-btn-icon";
	iconSpan.textContent = icon;
	btn.appendChild(iconSpan);
	btn.appendText(" " + text);
}

function setButtonLoading(btn: HTMLButtonElement, modeLabel: string): void {
	btn.empty();
	const spinner = document.createElement("span");
	spinner.className = "clippings-ppt-spinner";
	btn.appendChild(spinner);
	btn.appendText(` ${modeLabel} 생성 중...`);
}

export default class ClippingsPptPlugin extends Plugin {
	settings: ClippingsPptSettings = DEFAULT_SETTINGS;
	nlmClient: NotebookLMClient = new NotebookLMClient();

	async onload(): Promise<void> {
		await this.loadSettings();
		this.nlmClient = new NotebookLMClient(this.settings.nlmPath);

		this.addSettingTab(new ClippingsPptSettingTab(this.app, this));

		// Clippings 파일에 버튼 주입
		this.registerMarkdownPostProcessor((el, ctx) => {
			const filePath = ctx.sourcePath;
			if (!filePath.startsWith(this.settings.clippingsFolder + "/")) {
				return;
			}

			// 하위 폴더(PDF 등)는 제외
			const relativePath = filePath.slice(this.settings.clippingsFolder.length + 1);
			if (relativePath.includes("/")) {
				return;
			}

			if (el.querySelector(".clippings-ppt-btn-container")) {
				return;
			}

			const firstChild = el.firstElementChild;
			if (!firstChild) return;

			const container = document.createElement("div");
			container.className = "clippings-ppt-btn-container";

			const btn = document.createElement("button");
			btn.className = "clippings-ppt-btn";
			setButtonContent(btn, "\uD83D\uDCD3", "NotebookLM으로 PPT 만들기");

			btn.addEventListener("click", async () => {
				const file = this.app.vault.getAbstractFileByPath(filePath);
				if (file instanceof TFile) {
					// 모드 선택 모달 표시
					const modal = new ModeSelectionModal(this.app);
					const mode = await modal.open();
					if (mode) {
						await this.handleGeneratePpt(file, btn, mode);
					}
				}
			});

			container.appendChild(btn);
			el.insertBefore(container, firstChild);
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
							this.handleGeneratePpt(view.file, null, mode);
						}
					});
				}
				return true;
			},
		});
	}

	async handleGeneratePpt(
		file: TFile,
		btn: HTMLButtonElement | null,
		mode: ReportMode
	): Promise<void> {
		const modeConfig = MODES[mode];

		if (btn) {
			btn.disabled = true;
			setButtonLoading(btn, modeConfig.label);
			btn.addClass("clippings-ppt-btn-loading");
		}

		const notice = new Notice(
			`${modeConfig.icon} ${modeConfig.label} 생성 중...\nNotebookLM에 요청하고 있습니다.`,
			0
		);

		try {
			const content = await this.app.vault.read(file);
			const { frontmatter, body } = this.parseFrontmatter(content);

			const title = frontmatter.title || file.basename;
			const source = frontmatter.source || "";

			// NotebookLM 호출
			const result = await this.nlmClient.generateContent(title, body, mode);

			// 출력 경로: Clippings/PDF/
			const outputFolder = `${this.settings.clippingsFolder}/${this.settings.outputSubfolder}`;
			const pptFileName = `${file.basename}.pptx`;
			const pptPath = `${outputFolder}/${pptFileName}`;

			// 폴더 생성
			if (!this.app.vault.getAbstractFileByPath(outputFolder)) {
				await this.app.vault.createFolder(outputFolder);
			}

			const pptBuffer = await generatePptx(
				title,
				source,
				result.summary,
				result.slides,
				mode
			);

			// PPTX 저장
			const existingFile = this.app.vault.getAbstractFileByPath(pptPath);
			if (existingFile instanceof TFile) {
				await this.app.vault.modifyBinary(existingFile, pptBuffer);
			} else {
				await this.app.vault.createBinary(pptPath, pptBuffer);
			}

			// md 파일에 요약 + 링크 삽입
			await this.insertSummaryAndLink(
				file, content, result.summary, pptPath, modeConfig
			);

			notice.hide();
			new Notice(
				`${modeConfig.icon} ${modeConfig.label} 생성 완료!\n${pptPath}`,
				5000
			);
		} catch (error) {
			notice.hide();
			new Notice("PPT 생성 실패: " + String(error), 8000);
			console.error("Clippings PPT Generator error:", error);
		} finally {
			if (btn) {
				btn.disabled = false;
				setButtonContent(btn, "\uD83D\uDCD3", "NotebookLM으로 PPT 만들기");
				btn.removeClass("clippings-ppt-btn-loading");
			}
		}
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
