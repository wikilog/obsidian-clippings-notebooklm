import { App, PluginSettingTab, Setting } from "obsidian";
import type ClippingsPptPlugin from "./main";

export interface ClippingsPptSettings {
	nlmPath: string;
	clippingsFolder: string;
	outputSubfolder: string;
	exportPdfSubfolder: string;
}

export const DEFAULT_SETTINGS: ClippingsPptSettings = {
	nlmPath: "nlm",
	clippingsFolder: "Clippings",
	outputSubfolder: "PDF",
	exportPdfSubfolder: "exportPDF",
};

const isKorean = typeof navigator !== "undefined" && navigator.language?.startsWith("ko");
const t = (ko: string, en: string): string => isKorean ? ko : en;

export class ClippingsPptSettingTab extends PluginSettingTab {
	plugin: ClippingsPptPlugin;

	constructor(app: App, plugin: ClippingsPptPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: `Clippings NotebookLM v${this.plugin.manifest.version}` });

		// NotebookLM 연동 섹션
		containerEl.createEl("h3", { text: t("NotebookLM 연동", "NotebookLM Integration") });

		const loginSetting = new Setting(containerEl)
			.setName(t("NotebookLM 로그인", "NotebookLM Login"))
			.setDesc(t(
				"Google 계정으로 NotebookLM에 로그인합니다.",
				"Sign in to NotebookLM with your Google account."
			));

		const statusEl = loginSetting.descEl.createEl("div", {
			cls: "clippings-ppt-login-status",
		});

		this.checkLoginStatus(statusEl);

		loginSetting.addButton((button) =>
			button.setButtonText(t("🌐 브라우저로 로그인", "🌐 Login via Browser")).onClick(async () => {
				button.setDisabled(true);
				await this.plugin.nlmClient.launchLogin();
				button.setDisabled(false);
			})
		);

		loginSetting.addButton((button) =>
			button.setButtonText(t("계정 변경", "Switch Account")).onClick(async () => {
				button.setDisabled(true);
				await this.plugin.nlmClient.launchAccountSwitch();
				button.setDisabled(false);
			})
		);

		loginSetting.addButton((button) =>
			button.setButtonText(t("상태 확인", "Check Status")).onClick(async () => {
				button.setDisabled(true);
				button.setButtonText(t("확인 중...", "Checking..."));
				await this.checkLoginStatus(statusEl);
				button.setDisabled(false);
				button.setButtonText(t("상태 확인", "Check Status"));
			})
		);

		new Setting(containerEl)
			.setName(t("nlm CLI 경로", "nlm CLI Path"))
			.setDesc(t(
				"notebooklm-mcp-cli의 nlm 실행 파일 경로. " +
				"기본값 'nlm'으로 찾지 못할 경우 절대 경로를 입력하세요. " +
				"예: /Users/yourname/.local/bin/nlm",
				"Path to the nlm executable. " +
				"If 'nlm' is not found in PATH, enter the full path. " +
				"e.g. /Users/yourname/.local/bin/nlm"
			))
			.addText((text) =>
				text
					.setPlaceholder("nlm")
					.setValue(this.plugin.settings.nlmPath)
					.onChange(async (value) => {
						this.plugin.settings.nlmPath = value || "nlm";
						this.plugin.nlmClient.setPath(this.plugin.settings.nlmPath);
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: t("폴더 설정", "Folder Settings") });

		new Setting(containerEl)
			.setName(t("Clippings 폴더", "Clippings Folder"))
			.setDesc(t("웹 클리핑이 저장되는 폴더 경로", "Folder path where web clips are stored"))
			.addText((text) =>
				text
					.setPlaceholder("Clippings")
					.setValue(this.plugin.settings.clippingsFolder)
					.onChange(async (value) => {
						this.plugin.settings.clippingsFolder = value || "Clippings";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("PDF 저장 하위 폴더", "PDF Output Subfolder"))
			.setDesc(t(
				"Clippings 폴더 안에 PDF가 저장될 하위 폴더명",
				"Subfolder inside Clippings where generated PDFs are saved"
			))
			.addText((text) =>
				text
					.setPlaceholder("PDF")
					.setValue(this.plugin.settings.outputSubfolder)
					.onChange(async (value) => {
						this.plugin.settings.outputSubfolder = value || "PDF";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("PDF 내보내기 임시 저장 폴더", "PDF Export Temp Folder"))
			.setDesc(t(
				"NotebookLM 업로드용 PDF가 임시 저장될 하위 폴더명 (업로드 후 자동 삭제)",
				"Subfolder for temporary PDF storage before upload (auto-deleted after upload)"
			))
			.addText((text) =>
				text
					.setPlaceholder("exportPDF")
					.setValue(this.plugin.settings.exportPdfSubfolder)
					.onChange(async (value) => {
						this.plugin.settings.exportPdfSubfolder = value || "exportPDF";
						await this.plugin.saveSettings();
					})
			);

		// 후원 섹션
		containerEl.createEl("h3", { text: t("후원", "Support") });

		new Setting(containerEl)
			.setName(t("개발자 후원하기 ☕", "Support the Developer ☕"))
			.setDesc(t(
				"이 플러그인이 유용하다면 커피 한 잔으로 응원해주세요. 개발을 계속하는 데 큰 힘이 됩니다!",
				"If you find this plugin useful, consider buying me a coffee. It helps keep the project alive!"
			))
			.addButton((button) =>
				button
					.setButtonText("☕ Buy Me a Coffee")
					.onClick(() => {
						window.open("https://buymeacoffee.com/wikilog", "_blank");
					})
			);
	}

	private async checkLoginStatus(statusEl: HTMLElement): Promise<void> {
		statusEl.empty();
		statusEl.setText(t("확인 중...", "Checking..."));
		statusEl.removeClass("clippings-ppt-status-ok", "clippings-ppt-status-error");

		const installed = await this.plugin.nlmClient.isInstalled();
		if (!installed) {
			statusEl.setText(t(
				"⚠ nlm CLI 미설치 — 터미널에서: uv tool install notebooklm-mcp-cli",
				"⚠ nlm CLI not installed — run: uv tool install notebooklm-mcp-cli"
			));
			statusEl.addClass("clippings-ppt-status-error");
			return;
		}

		const loggedIn = await this.plugin.nlmClient.isLoggedIn();
		if (loggedIn) {
			statusEl.setText(t("✓ 로그인됨", "✓ Logged in"));
			statusEl.addClass("clippings-ppt-status-ok");
		} else {
			statusEl.setText(t(
				"✗ 로그인 필요 — '브라우저로 로그인' 버튼을 클릭하세요",
				"✗ Not logged in — click 'Login via Browser'"
			));
			statusEl.addClass("clippings-ppt-status-error");
		}
	}
}
