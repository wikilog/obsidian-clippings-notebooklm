import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import type ClippingsPptPlugin from "./main";

export interface ClippingsPptSettings {
	nlmPath: string;
	clippingsFolder: string;
	outputSubfolder: string;
}

export const DEFAULT_SETTINGS: ClippingsPptSettings = {
	nlmPath: "nlm",
	clippingsFolder: "Clippings",
	outputSubfolder: "PDF",
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

		containerEl.createEl("h2", { text: "Clippings PPT Generator" });

		// NotebookLM 로그인 섹션
		containerEl.createEl("h3", { text: "NotebookLM 연동" });

		const loginSetting = new Setting(containerEl)
			.setName("NotebookLM 로그인")
			.setDesc("Google 계정으로 NotebookLM에 로그인합니다.");

		const statusEl = loginSetting.descEl.createEl("div", {
			cls: "clippings-ppt-login-status",
		});

		this.checkLoginStatus(statusEl);

		loginSetting.addButton((button) =>
			button.setButtonText("로그인").onClick(async () => {
				button.setDisabled(true);
				button.setButtonText("로그인 중...");
				const success = await this.plugin.nlmClient.login();
				button.setDisabled(false);
				button.setButtonText("로그인");
				this.checkLoginStatus(statusEl);
				if (!success) {
					new Notice("로그인에 실패했습니다. nlm CLI 설치를 확인하세요.");
				}
			})
		);

		new Setting(containerEl)
			.setName("nlm CLI 경로")
			.setDesc("notebooklm-mcp-cli의 nlm 실행 파일 경로")
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
			.setName("PPT 저장 하위 폴더")
			.setDesc("Clippings 폴더 안에 PPT가 저장될 하위 폴더명")
			.addText((text) =>
				text
					.setPlaceholder("PDF")
					.setValue(this.plugin.settings.outputSubfolder)
					.onChange(async (value) => {
						this.plugin.settings.outputSubfolder = value || "PDF";
						await this.plugin.saveSettings();
					})
			);
	}

	private async checkLoginStatus(statusEl: HTMLElement): Promise<void> {
		statusEl.empty();
		statusEl.setText("확인 중...");

		const installed = await this.plugin.nlmClient.isInstalled();
		if (!installed) {
			statusEl.setText("nlm CLI 미설치");
			statusEl.addClass("clippings-ppt-status-error");
			return;
		}

		const loggedIn = await this.plugin.nlmClient.isLoggedIn();
		statusEl.empty();
		if (loggedIn) {
			statusEl.setText("로그인됨");
			statusEl.addClass("clippings-ppt-status-ok");
			statusEl.removeClass("clippings-ppt-status-error");
		} else {
			statusEl.setText("로그인 필요");
			statusEl.addClass("clippings-ppt-status-error");
			statusEl.removeClass("clippings-ppt-status-ok");
		}
	}
}
