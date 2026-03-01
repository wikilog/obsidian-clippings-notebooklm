import { App, Modal } from "obsidian";
import type { ReportMode } from "./prompts";
import { MODES } from "./prompts";

export class ModeSelectionModal extends Modal {
	private resolve: ((mode: ReportMode | null) => void) | null = null;

	constructor(app: App) {
		super(app);
	}

	open(): Promise<ReportMode | null> {
		return new Promise((resolve) => {
			this.resolve = resolve;
			super.open();
		});
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("clippings-ppt-modal");

		contentEl.createEl("h2", { text: "리포트 모드 선택" });
		contentEl.createEl("p", {
			text: "어떤 스타일의 PDF를 생성할까요?",
			cls: "clippings-ppt-modal-desc",
		});

		const modesContainer = contentEl.createDiv({
			cls: "clippings-ppt-modes",
		});

		const modeEntries: [ReportMode, typeof MODES[ReportMode]][] = [
			["detailed", MODES.detailed],
			["executive", MODES.executive],
			["easy", MODES.easy],
		];

		for (const [key, config] of modeEntries) {
			const card = modesContainer.createDiv({
				cls: "clippings-ppt-mode-card",
			});

			card.createDiv({
				cls: "clippings-ppt-mode-icon",
				text: config.icon,
			});

			const textContainer = card.createDiv({
				cls: "clippings-ppt-mode-text",
			});

			textContainer.createEl("strong", { text: config.label });
			textContainer.createEl("small", { text: config.description });

			card.addEventListener("click", () => {
				if (this.resolve) {
					this.resolve(key);
					this.resolve = null;
				}
				this.close();
			});
		}

	}

	onClose(): void {
		if (this.resolve) {
			this.resolve(null);
			this.resolve = null;
		}
		this.contentEl.empty();
	}
}
