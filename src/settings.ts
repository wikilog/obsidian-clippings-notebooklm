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
		containerEl.createEl("h3", { text: "NotebookLM 연동" });

		const loginSetting = new Setting(containerEl)
			.setName("NotebookLM 로그인")
			.setDesc("Google 계정으로 NotebookLM에 로그인합니다.");

		const statusEl = loginSetting.descEl.createEl("div", {
			cls: "clippings-ppt-login-status",
		});

		this.checkLoginStatus(statusEl);

		// 브라우저 로그인 버튼 (비차단 — OAuth 흐름을 별도 프로세스로 실행)
		loginSetting.addButton((button) =>
			button.setButtonText("🌐 브라우저로 로그인").onClick(async () => {
				button.setDisabled(true);
				await this.plugin.nlmClient.launchLogin();
				button.setDisabled(false);
			})
		);

		// 계정 변경 버튼 (기존 인증 삭제 후 새 계정으로 재로그인)
		loginSetting.addButton((button) =>
			button.setButtonText("계정 변경").onClick(async () => {
				button.setDisabled(true);
				await this.plugin.nlmClient.launchAccountSwitch();
				button.setDisabled(false);
			})
		);

		// 상태 확인 버튼 (로그인 완료 후 클릭)
		loginSetting.addButton((button) =>
			button.setButtonText("상태 확인").onClick(async () => {
				button.setDisabled(true);
				button.setButtonText("확인 중...");
				await this.checkLoginStatus(statusEl);
				button.setDisabled(false);
				button.setButtonText("상태 확인");
			})
		);

		new Setting(containerEl)
			.setName("nlm CLI 경로")
			.setDesc(
				"notebooklm-mcp-cli의 nlm 실행 파일 경로. " +
				"기본값 'nlm'으로 찾지 못할 경우 절대 경로를 입력하세요. " +
				"예: /Users/yourname/.local/bin/nlm"
			)
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

		// 폴더 설정
		containerEl.createEl("h3", { text: "폴더 설정" });

		new Setting(containerEl)
			.setName("Clippings 폴더")
			.setDesc("웹 클리핑이 저장되는 폴더 경로")
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
			.setName("PDF 저장 하위 폴더")
			.setDesc("Clippings 폴더 안에 PDF가 저장될 하위 폴더명")
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
			.setName("PDF 내보내기 임시 저장 폴더")
			.setDesc("NotebookLM 업로드용 PDF가 임시 저장될 하위 폴더명 (업로드 후 자동 삭제)")
			.addText((text) =>
				text
					.setPlaceholder("exportPDF")
					.setValue(this.plugin.settings.exportPdfSubfolder)
					.onChange(async (value) => {
						this.plugin.settings.exportPdfSubfolder = value || "exportPDF";
						await this.plugin.saveSettings();
					})
			);
	}

	private async checkLoginStatus(statusEl: HTMLElement): Promise<void> {
		statusEl.empty();
		statusEl.setText("확인 중...");
		statusEl.removeClass("clippings-ppt-status-ok", "clippings-ppt-status-error");

		const installed = await this.plugin.nlmClient.isInstalled();
		if (!installed) {
			statusEl.setText("⚠ nlm CLI 미설치 — 터미널에서: uv tool install notebooklm-mcp-cli");
			statusEl.addClass("clippings-ppt-status-error");
			return;
		}

		const loggedIn = await this.plugin.nlmClient.isLoggedIn();
		if (loggedIn) {
			statusEl.setText("✓ 로그인됨");
			statusEl.addClass("clippings-ppt-status-ok");
		} else {
			statusEl.setText("✗ 로그인 필요 — '브라우저로 로그인' 버튼을 클릭하세요");
			statusEl.addClass("clippings-ppt-status-error");
		}
	}
}
