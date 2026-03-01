import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import type ClippingsPptPlugin from "./main";
import { ModeSelectionModal } from "./mode-modal";
import { MODES } from "./prompts";

export const VIEW_TYPE_SIDEBAR = "clippings-notebooklm-sidebar";

export interface HistoryItem {
	title: string;
	mode: string;
	modeIcon: string;
	status: "success" | "error" | "running";
	date: Date;
	pptPath?: string;
	errorMsg?: string;
	log?: string[];
}

export class ClippingsSidebarView extends ItemView {
	private plugin: ClippingsPptPlugin;
	private historyListEl: HTMLElement | null = null;
	private generateBtn: HTMLButtonElement | null = null;
	private hintEl: HTMLElement | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: ClippingsPptPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_SIDEBAR;
	}

	getDisplayText(): string {
		return "Clippings NotebookLM";
	}

	getIcon(): string {
		return "notebooklm";
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		// nothing
	}

	render(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("clippings-sidebar");

		// 헤더
		const header = contentEl.createEl("div", { cls: "clippings-sidebar-header" });
		header.createEl("span", { cls: "clippings-sidebar-title", text: "📓 NotebookLM" });

		// 생성 버튼
		const btnArea = contentEl.createEl("div", { cls: "clippings-sidebar-btn-area" });
		const btn = btnArea.createEl("button", {
			cls: "clippings-sidebar-generate-btn",
			text: "NotebookLM으로 요약하기",
		});
		this.generateBtn = btn;

		btn.addEventListener("click", async () => {
			if (this.plugin.isRunning) return;
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (!activeFile) {
				return;
			}
			if (!activeFile.path.startsWith(this.plugin.settings.clippingsFolder + "/")) {
				this.showHint("Clippings 폴더의 노트를 먼저 열어주세요.");
				return;
			}

			const modal = new ModeSelectionModal(this.plugin.app);
			const mode = await modal.open();
			if (mode) {
				await this.plugin.handleGeneratePpt(activeFile as TFile, mode);
			}
		});

		// 현재 파일 표시
		const hintEl = contentEl.createEl("div", { cls: "clippings-sidebar-hint" });
		this.hintEl = hintEl;
		this.updateActiveFileHint(hintEl);

		this.registerEvent(
			this.plugin.app.workspace.on("active-leaf-change", () => {
				if (!this.plugin.isRunning) this.updateActiveFileHint(hintEl);
			})
		);

		// 초기 버튼 상태 설정
		this.refreshBtn();

		// 구분선
		contentEl.createEl("hr", { cls: "clippings-sidebar-divider" });

		// 작업 내역
		contentEl.createEl("div", { cls: "clippings-sidebar-section-title", text: "작업 내역" });

		this.historyListEl = contentEl.createEl("div", { cls: "clippings-sidebar-history" });
		this.renderHistory();
	}

	/** isRunning 상태에 따라 버튼과 힌트를 갱신한다. */
	private refreshBtn(): void {
		if (!this.generateBtn) return;
		if (this.plugin.isRunning) {
			this.generateBtn.disabled = true;
			this.generateBtn.textContent = "⏳ 작업 진행 중...";
			this.generateBtn.addClass("clippings-sidebar-generate-btn--running");
			if (this.hintEl) {
				this.hintEl.textContent = "완료 후 사용 가능합니다";
				this.hintEl.removeClass("clippings-sidebar-hint-active");
			}
		} else {
			this.generateBtn.disabled = false;
			this.generateBtn.textContent = "NotebookLM으로 요약하기";
			this.generateBtn.removeClass("clippings-sidebar-generate-btn--running");
			if (this.hintEl) this.updateActiveFileHint(this.hintEl);
		}
	}

	private showHint(msg: string): void {
		const existing = this.contentEl.querySelector(".clippings-sidebar-toast");
		if (existing) existing.remove();

		const toast = this.contentEl.createEl("div", {
			cls: "clippings-sidebar-toast",
			text: msg,
		});
		setTimeout(() => toast.remove(), 3000);
	}

	private updateActiveFileHint(el: HTMLElement): void {
		const file = this.plugin.app.workspace.getActiveFile();
		if (!file) {
			el.setText("활성 노트 없음");
			el.removeClass("clippings-sidebar-hint-active");
			return;
		}
		const isClippings = file.path.startsWith(this.plugin.settings.clippingsFolder + "/")
			&& !file.path.slice(this.plugin.settings.clippingsFolder.length + 1).includes("/");

		if (isClippings) {
			el.setText(`✓ ${file.basename}`);
			el.addClass("clippings-sidebar-hint-active");
		} else {
			el.setText("Clippings 폴더 노트를 열어주세요");
			el.removeClass("clippings-sidebar-hint-active");
		}
	}

	renderHistory(): void {
		if (!this.historyListEl) return;
		this.refreshBtn();
		this.historyListEl.empty();

		const history = this.plugin.history;
		if (history.length === 0) {
			this.historyListEl.createEl("div", {
				cls: "clippings-sidebar-empty",
				text: "아직 생성 내역이 없습니다.",
			});
			return;
		}

		for (const item of [...history].reverse()) {
			const card = this.historyListEl.createEl("div", { cls: "clippings-sidebar-history-card" });

			// 상태 아이콘 + 제목
			const cardTop = card.createEl("div", { cls: "clippings-sidebar-card-top" });
			const statusIcon = item.status === "success" ? "✓"
				: item.status === "running" ? "⏳"
				: "✗";
			cardTop.createEl("span", {
				cls: `clippings-sidebar-status clippings-sidebar-status-${item.status}`,
				text: statusIcon,
			});
			cardTop.createEl("span", {
				cls: "clippings-sidebar-card-title",
				text: item.title,
			});

			// 모드 + 날짜
			const cardMeta = card.createEl("div", { cls: "clippings-sidebar-card-meta" });
			cardMeta.createEl("span", { text: `${item.modeIcon} ${item.mode}` });
			cardMeta.createEl("span", { text: this.formatDate(item.date) });

			// 진행 로그
			if (item.log && item.log.length > 0) {
				const logEl = card.createEl("div", { cls: "clippings-sidebar-card-log" });
				const entries = item.status === "error"
					? item.log
					: item.status === "success"
					? item.log.slice(-1)
					: item.log.slice(-3);
				for (const entry of entries) {
					logEl.createEl("div", {
						cls: "clippings-sidebar-card-log-entry",
						text: entry,
					});
				}
			}

			// 복사 버튼 (error일 때 로그 아래에 독립 배치)
			if (item.status === "error") {
				const copyBtn = card.createEl("button", {
					cls: "clippings-sidebar-card-copy-btn",
					text: "로그 복사",
				});
				copyBtn.addEventListener("click", () => {
					const logText = (item.log ?? []).join("\n");
					const full = logText
						? logText + "\n" + (item.errorMsg ?? "")
						: item.errorMsg ?? "";
					navigator.clipboard.writeText(full).then(() => {
						copyBtn.textContent = "✓ 복사됨";
						setTimeout(() => { copyBtn.textContent = "로그 복사"; }, 2000);
					});
				});
			}

			// 오류 메시지 (빨간 텍스트)
			if (item.status === "error" && item.errorMsg) {
				card.createEl("div", {
					cls: "clippings-sidebar-card-error",
					text: item.errorMsg,
				});
			}

			// PPT 경로 링크
			if (item.status === "success" && item.pptPath) {
				const link = card.createEl("div", {
					cls: "clippings-sidebar-card-link",
					text: `📎 ${item.pptPath.split("/").pop()}`,
				});
				link.addEventListener("click", () => {
					const file = this.plugin.app.vault.getAbstractFileByPath(item.pptPath!);
					if (file instanceof TFile) {
						this.plugin.app.workspace.getLeaf().openFile(file);
					}
				});
			}
		}
	}

	private formatDate(date: Date): string {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		if (diff < 60000) return "방금 전";
		if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}
}
