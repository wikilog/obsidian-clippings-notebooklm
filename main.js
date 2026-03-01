var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ClippingsPptPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");
var import_promises2 = require("fs/promises");
var import_path2 = require("path");
var import_os2 = require("os");

// src/notebooklm.ts
var import_obsidian = require("obsidian");
var import_child_process = require("child_process");
var import_util = require("util");
var import_os = require("os");
var import_path = require("path");
var import_promises = require("fs/promises");

// src/prompts.ts
var MODES = {
  detailed: {
    label: "\uC790\uC138\uD55C \uB9AC\uD3EC\uD2B8",
    description: "\uC815\uCC45 \uACB0\uC815\uAD8C\uC790, \uD559\uACC4 \uC804\uBB38\uAC00, \uC5C5\uACC4 \uBCA0\uD14C\uB791 \uB300\uC0C1",
    icon: "\u{1F4CB}",
    summaryPrompt: [
      "\uC774 \uB0B4\uC6A9\uC744 \uC815\uCC45 \uACB0\uC815\uAD8C\uC790\uC640 15\uB144 \uC774\uC0C1 \uACBD\uB825 \uC804\uBB38\uAC00\uB97C \uC704\uD574 \uC694\uC57D\uD558\uC138\uC694.",
      "\uC804\uBB38 \uC6A9\uC5B4\uB97C \uC790\uC720\uB86D\uAC8C \uC0AC\uC6A9\uD558\uB418, \uAC01 \uD575\uC2EC \uAC1C\uB150\uC5D0 '\uC65C \uC774\uAC8C \uC911\uC694\uD55C\uAC00'\uB97C \uBA85\uC2DC\uD558\uC138\uC694.",
      "\uC778\uACFC\uAD00\uACC4\uB97C \uBA85\uD655\uD788 \uC11C\uC220\uD558\uACE0, \uC218\uB3D9\uD0DC\uC640 \uBAA8\uD638\uD55C \uD45C\uD604\uC744 \uBC30\uC81C\uD558\uC138\uC694.",
      "\uC8FC\uC694 \uADFC\uAC70(\uB370\uC774\uD130, \uC0AC\uB840, \uC778\uC6A9)\uB97C \uD3EC\uD568\uD558\uACE0,",
      "\uB9AC\uB354\uAC00 \uB0B4\uC77C \uC2E4\uD589\uD560 \uC218 \uC788\uB294 Action Item 3\uAC00\uC9C0\uB85C \uB9C8\uBB34\uB9AC\uD558\uC138\uC694.",
      "\uD55C\uAD6D\uC5B4, \uC804\uBB38 \uBE44\uC988\uB2C8\uC2A4 \uC6A9\uC5B4\uB97C \uC0AC\uC6A9\uD558\uC138\uC694."
    ].join("\n"),
    slidesFormat: "detailed_deck",
    slidesLength: "default",
    focusPrompt: "\uC804\uBB38\uAC00(15\uB144 \uC774\uC0C1 \uACBD\uB825) \uB300\uC0C1 \uC2EC\uCE35 \uBD84\uC11D \uB9AC\uD3EC\uD2B8. \uC804\uBB38 \uC6A9\uC5B4 \uC790\uC720 \uC0AC\uC6A9, \uAC01 \uC139\uC158 \uC2DC\uC791\uC5D0 '\uC65C \uC911\uC694\uD55C\uAC00' \uB9E5\uB77D \uC2AC\uB77C\uC774\uB4DC 1\uC7A5 \uD3EC\uD568. \uC778\uACFC\uAD00\uACC4 \uBA85\uD655\uD788 \uC11C\uC220, \uC218\uB3D9\uD0DC\xB7\uBAA8\uD638\uD55C \uD45C\uD604 \uAE08\uC9C0. \uB370\uC774\uD130\xB7\uC0AC\uB840\xB7\uC778\uC6A9\uC73C\uB85C \uC8FC\uC7A5 \uB4B7\uBC1B\uCE68. \uD45C\uC9C0\uB294 \uB0B4\uC6A9\uC758 \uD575\uC2EC \uC8FC\uC7A5\uC744 \uB2F4\uC740 \uC81C\uBAA9\uC73C\uB85C \uAD6C\uC131 (\uD0C0\uAC9F \uB3C5\uC790\xB7\uB300\uC0C1 \uC5B8\uAE09 \uC808\uB300 \uAE08\uC9C0). \uB9C8\uBB34\uB9AC \uC9C1\uC804 \uC2AC\uB77C\uC774\uB4DC\uC5D0 \uB9AC\uB354\uAC00 \uB0B4\uC77C \uC2E4\uD589\uD560 Action Item 3\uAC00\uC9C0. \uB9C8\uC9C0\uB9C9 \uC2AC\uB77C\uC774\uB4DC\uB294 \uBC18\uB4DC\uC2DC '\uAC10\uC0AC\uD569\uB2C8\uB2E4' \uBB38\uAD6C \uD3EC\uD568. \uBAA8\uB4E0 \uC2AC\uB77C\uC774\uB4DC\uC5D0 NotebookLM \uB85C\uACE0\xB7\uC6CC\uD130\uB9C8\uD06C\xB7\uBE0C\uB79C\uB529 \uC694\uC18C \uD3EC\uD568 \uAE08\uC9C0. \uAD8C\uC704 \uC788\uACE0 \uBD84\uC11D\uC801\uC778 \uC5B4\uC870. 8~12\uC2AC\uB77C\uC774\uB4DC \uAD6C\uC131."
  },
  executive: {
    label: "\uD575\uC2EC \uB9AC\uD3EC\uD2B8",
    description: "\uBC14\uC05C C-\uB808\uBCA8 \uC784\uC6D0, \uC758\uC0AC\uACB0\uC815\uC790 \uB300\uC0C1",
    icon: "\u26A1",
    summaryPrompt: [
      "\uC774 \uB0B4\uC6A9\uC744 C-\uB808\uBCA8 \uC784\uC6D0\uC744 \uC704\uD574 \uD575\uC2EC\uB9CC 3\uC904\uB85C \uC694\uC57D\uD558\uC138\uC694.",
      "\uACB0\uB860\uC744 \uBA3C\uC800 \uC81C\uC2DC\uD558\uACE0, \uAC01 \uC904\uC5D0 \uC218\uCE58\uB098 \uC0AC\uB840\uB97C 1\uAC1C \uC774\uC0C1 \uD3EC\uD568\uD558\uC138\uC694.",
      "5\uCD08 \uC548\uC5D0 \uD30C\uC545 \uAC00\uB2A5\uD55C \uB2E8\uB3C4\uC9C1\uC785\uC801 \uBB38\uC7A5\uC73C\uB85C \uC791\uC131\uD558\uC138\uC694.",
      "\uBD88\uD544\uC694\uD55C \uC218\uC2DD\uC5B4, \uAE34 \uBB38\uB2E8 \uC644\uC804 \uAE08\uC9C0.",
      "\uB9C8\uC9C0\uB9C9\uC5D0 Yes/No\uB85C \uB2F5\uD560 \uC218 \uC788\uB294 \uC758\uC0AC\uACB0\uC815 \uC9C8\uBB38 1\uAC1C\uB97C \uCD94\uAC00\uD558\uC138\uC694.",
      "\uD55C\uAD6D\uC5B4, \uAC04\uACB0\uD55C \uBE44\uC988\uB2C8\uC2A4 \uC5B8\uC5B4\uB97C \uC0AC\uC6A9\uD558\uC138\uC694."
    ].join("\n"),
    slidesFormat: "presenter_slides",
    slidesLength: "short",
    focusPrompt: "\uD558\uB8E8 \uC218\uC2ED \uAC1C \uBCF4\uACE0\uB97C \uBC1B\uB294 C\uB808\uBCA8 \uC784\uC6D0 \uB300\uC0C1. \uACB0\uB860\uC744 \uC2AC\uB77C\uC774\uB4DC \uC81C\uBAA9\uC73C\uB85C \uBC14\uB85C \uC81C\uC2DC. \uC2AC\uB77C\uC774\uB4DC 1\uC7A5\uC744 5\uCD08 \uC548\uC5D0 \uD30C\uC545 \uAC00\uB2A5\uD574\uC57C \uD568. \uC218\uCE58\xB7\uC0AC\uB840 \uBC18\uB4DC\uC2DC 1\uAC1C \uC774\uC0C1 \uD3EC\uD568. \uBD88\uD544\uC694\uD55C \uC218\uC2DD\uC5B4\xB7\uAE34 \uBB38\uB2E8 \uAE08\uC9C0. \uD45C\uC9C0\uB294 \uACB0\uB860 \uADF8\uB300\uB85C \uC81C\uBAA9(\uC608: '\uD575\uC2EC\uC740 \uADDC\uCE59\uC774\uB2E4') \u2014 \uD0C0\uAC9F \uB3C5\uC790\xB7\uB300\uC0C1 \uC5B8\uAE09 \uC808\uB300 \uAE08\uC9C0. \uB9C8\uBB34\uB9AC \uC9C1\uC804 \uC2AC\uB77C\uC774\uB4DC\uB294 Yes/No \uC758\uC0AC\uACB0\uC815 \uC9C8\uBB38 1\uAC1C. \uB9C8\uC9C0\uB9C9 \uC2AC\uB77C\uC774\uB4DC\uB294 \uBC18\uB4DC\uC2DC '\uAC10\uC0AC\uD569\uB2C8\uB2E4' \uBB38\uAD6C \uD3EC\uD568. \uBAA8\uB4E0 \uC2AC\uB77C\uC774\uB4DC\uC5D0 NotebookLM \uB85C\uACE0\xB7\uC6CC\uD130\uB9C8\uD06C\xB7\uBE0C\uB79C\uB529 \uC694\uC18C \uD3EC\uD568 \uAE08\uC9C0. \uB2E8\uB3C4\uC9C1\uC785\uC801 \uC5B4\uC870. 5~8\uC2AC\uB77C\uC774\uB4DC \uAD6C\uC131."
  },
  easy: {
    label: "\uC26C\uC6B4 \uB9AC\uD3EC\uD2B8",
    description: "\uB2E4\uC591\uD55C \uBC30\uACBD\uC758 \uD63C\uD569 \uCCAD\uC911, \uBE44\uC804\uBB38\uAC00 \uD3EC\uD568",
    icon: "\u{1F331}",
    summaryPrompt: [
      "\uC774 \uB0B4\uC6A9\uC744 \uBE44\uC804\uBB38\uAC00\uB3C4 \uC774\uD574\uD560 \uC218 \uC788\uB3C4\uB85D \uC27D\uAC8C \uC694\uC57D\uD558\uC138\uC694.",
      "\uC804\uBB38 \uC6A9\uC5B4\uB97C \uC0AC\uC6A9\uD560 \uACBD\uC6B0 \uC989\uC2DC 1~2\uBB38\uC7A5\uC73C\uB85C \uD480\uC5B4 \uC124\uBA85\uD558\uC138\uC694.",
      "\uC77C\uC0C1\uC801 \uBE44\uC720\uB098 \uC2A4\uD1A0\uB9AC\uB97C \uD65C\uC6A9\uD574 \uD575\uC2EC\uC744 \uC804\uB2EC\uD558\uC138\uC694.",
      "\uBCF5\uC7A1\uD55C \uD504\uB808\uC784\uC6CC\uD06C\uBCF4\uB2E4 \uC2A4\uD1A0\uB9AC\uD154\uB9C1\uC744 \uC6B0\uC120\uD558\uC138\uC694.",
      "\uB9C8\uC9C0\uB9C9\uC5D0 \uB2F9\uC7A5 \uB0B4\uC77C \uD574\uBCFC \uC218 \uC788\uB294 \uAC04\uB2E8\uD55C \uC2E4\uCC9C 1\uAC00\uC9C0\uB97C \uC81C\uC548\uD558\uC138\uC694.",
      "\uD55C\uAD6D\uC5B4, \uC26C\uC6B4 \uC77C\uC0C1 \uC5B8\uC5B4\uB97C \uC0AC\uC6A9\uD558\uC138\uC694."
    ].join("\n"),
    slidesFormat: "detailed_deck",
    slidesLength: "short",
    focusPrompt: "\uBE44\uC804\uBB38\uAC00\uAC00 \uD3EC\uD568\uB41C \uD63C\uD569 \uCCAD\uC911 \uB300\uC0C1. \uD45C\uC9C0\uB294 \uB204\uAD6C\uB098 \uACF5\uAC10\uD560 \uC218 \uC788\uB294 \uC9C8\uBB38\uD615 \uC81C\uBAA9 \u2014 \uD0C0\uAC9F \uB3C5\uC790\xB7\uB300\uC0C1 \uC5B8\uAE09 \uC808\uB300 \uAE08\uC9C0. \uB3C4\uC785\uC740 \uC77C\uC0C1\uC801 \uBE44\uC720\xB7\uC2A4\uD1A0\uB9AC\uB85C \uC2DC\uC791. \uC804\uBB38 \uC6A9\uC5B4 \uCD5C\uC18C\uD654, \uC0AC\uC6A9 \uC2DC \uC989\uC2DC 1~2\uBB38\uC7A5\uC73C\uB85C \uD480\uC5B4 \uC124\uBA85. \uCD94\uC0C1 \uAC1C\uB150\uB9C8\uB2E4 \uAD6C\uCCB4\uC801 \uC0C1\uD669 \uC608\uC2DC 1\uAC1C \uD544\uC218. \uB9C8\uBB34\uB9AC \uC9C1\uC804 \uC2AC\uB77C\uC774\uB4DC\uB294 \uB0B4\uC77C \uBC14\uB85C \uD574\uBCFC \uC218 \uC788\uB294 \uAC04\uB2E8\uD55C \uC2E4\uCC9C 1\uAC00\uC9C0. \uB9C8\uC9C0\uB9C9 \uC2AC\uB77C\uC774\uB4DC\uB294 \uBC18\uB4DC\uC2DC '\uAC10\uC0AC\uD569\uB2C8\uB2E4' \uBB38\uAD6C \uD3EC\uD568. \uBAA8\uB4E0 \uC2AC\uB77C\uC774\uB4DC\uC5D0 NotebookLM \uB85C\uACE0\xB7\uC6CC\uD130\uB9C8\uD06C\xB7\uBE0C\uB79C\uB529 \uC694\uC18C \uD3EC\uD568 \uAE08\uC9C0. \uCE5C\uADFC\uD558\uACE0 \uACA9\uB824\uD558\uB294 \uC5B4\uC870. 5~8\uC2AC\uB77C\uC774\uB4DC \uAD6C\uC131."
  }
};

// src/notebooklm.ts
var execFileAsync = (0, import_util.promisify)(import_child_process.execFile);
function execDetail(error) {
  const e = error;
  if (e.killed === true) {
    const secs = typeof e.timeout === "number" ? Math.round(e.timeout / 1e3) : "?";
    return `\uCC98\uB9AC \uC2DC\uAC04 \uCD08\uACFC (${secs}\uCD08 \u2014 nlm \uCC98\uB9AC \uC9C0\uC5F0)`;
  }
  const stderr = typeof e.stderr === "string" ? e.stderr.trim() : "";
  const stdout = typeof e.stdout === "string" ? e.stdout.trim() : "";
  return stderr || stdout || String(error);
}
var NLM_SEARCH_DIRS = [
  (0, import_path.join)((0, import_os.homedir)(), ".local", "bin"),
  // uv tool install (default)
  (0, import_path.join)((0, import_os.homedir)(), ".cargo", "bin"),
  // cargo install
  "/opt/homebrew/bin",
  // macOS Homebrew (Apple Silicon)
  "/usr/local/bin",
  // macOS Homebrew (Intel) / manual
  "/usr/bin"
];
async function findNlmBinary(configured) {
  if (configured.startsWith("/") || configured.startsWith("~")) {
    return configured;
  }
  try {
    await execFileAsync(configured, ["--version"], { timeout: 5e3 });
    return configured;
  } catch (error) {
    const code = error.code;
    if (code !== "ENOENT") return configured;
  }
  const binaryName = configured.split("/").pop() || configured;
  try {
    const shell = process.env.SHELL || "/bin/zsh";
    const { stdout } = await execFileAsync(
      shell,
      ["-l", "-c", `which ${binaryName}`],
      { timeout: 8e3 }
    );
    const found = stdout.trim();
    if (found) return found;
  } catch {
  }
  for (const dir of NLM_SEARCH_DIRS) {
    const candidate = (0, import_path.join)(dir, binaryName);
    try {
      await (0, import_promises.access)(candidate, import_promises.constants.X_OK);
      return candidate;
    } catch {
    }
  }
  return configured;
}
var NotebookLMClient = class {
  constructor(nlmPath = "nlm") {
    this.resolvedPath = null;
    this.nlmPath = nlmPath;
  }
  setPath(path) {
    this.nlmPath = path;
    this.resolvedPath = null;
  }
  /** Returns the resolved binary path, searching common locations if needed. */
  async getPath() {
    if (!this.resolvedPath) {
      this.resolvedPath = await findNlmBinary(this.nlmPath);
    }
    return this.resolvedPath;
  }
  async isInstalled() {
    try {
      const path = await this.getPath();
      await execFileAsync(path, ["--version"], { timeout: 5e3 });
      return true;
    } catch (error) {
      const code = error.code;
      return code !== "ENOENT";
    }
  }
  async isLoggedIn() {
    try {
      const path = await this.getPath();
      const { stdout } = await execFileAsync(
        path,
        ["notebook", "list"],
        { timeout: 15e3 }
      );
      return !stdout.includes("not logged in") && !stdout.includes("login");
    } catch {
      return false;
    }
  }
  /**
   * Launch the nlm OAuth browser login flow without blocking Obsidian.
   * The process is spawned detached so the browser opens and the OAuth
   * callback server runs independently. Returns true if the launch succeeded.
   */
  async launchLogin() {
    const installed = await this.isInstalled();
    if (!installed) {
      new import_obsidian.Notice(
        "nlm CLI\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.\n\uD130\uBBF8\uB110\uC5D0\uC11C \uBA3C\uC800 \uC124\uCE58\uD558\uC138\uC694:\n\n  uv tool install notebooklm-mcp-cli\n\n\uC124\uCE58 \uD6C4 \uC124\uC815\uC5D0\uC11C \uACBD\uB85C\uB97C \uD655\uC778\uD558\uAC70\uB098\n\uC808\uB300 \uACBD\uB85C(\uC608: /Users/you/.local/bin/nlm)\uB97C \uC9C1\uC811 \uC785\uB825\uD558\uC138\uC694.",
        12e3
      );
      return false;
    }
    try {
      const path = await this.getPath();
      const proc = (0, import_child_process.spawn)(path, ["login"], {
        detached: true,
        stdio: "ignore"
      });
      proc.unref();
      new import_obsidian.Notice(
        "\u{1F310} \uBE0C\uB77C\uC6B0\uC800\uAC00 \uC5F4\uB9BD\uB2C8\uB2E4. Google \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778\uD558\uC138\uC694.\n\uC644\uB8CC \uD6C4 '\uC0C1\uD0DC \uD655\uC778' \uBC84\uD2BC\uC744 \uB20C\uB7EC \uD655\uC778\uD558\uC138\uC694.",
        8e3
      );
      return true;
    } catch (error) {
      new import_obsidian.Notice("\uB85C\uADF8\uC778 \uC2E4\uD589 \uC2E4\uD328: " + String(error), 8e3);
      return false;
    }
  }
  /**
   * 기존 인증 정보(Chrome 프로필)를 삭제하고 새 Google 계정으로 재로그인한다.
   * nlm login --clear 를 사용하여 계정을 완전히 전환한다.
   */
  async launchAccountSwitch() {
    const installed = await this.isInstalled();
    if (!installed) {
      new import_obsidian.Notice("nlm CLI\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 6e3);
      return false;
    }
    try {
      const path = await this.getPath();
      const proc = (0, import_child_process.spawn)(path, ["login", "--clear"], {
        detached: true,
        stdio: "ignore"
      });
      proc.unref();
      new import_obsidian.Notice(
        "\u{1F504} \uAE30\uC874 \uACC4\uC815 \uC815\uBCF4\uB97C \uC0AD\uC81C\uD558\uACE0 \uBE0C\uB77C\uC6B0\uC800\uB97C \uC5FD\uB2C8\uB2E4.\n\uC0C8 Google \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778\uD558\uC138\uC694.\n\uC644\uB8CC \uD6C4 '\uC0C1\uD0DC \uD655\uC778' \uBC84\uD2BC\uC744 \uB20C\uB7EC \uD655\uC778\uD558\uC138\uC694.",
        1e4
      );
      return true;
    } catch (error) {
      new import_obsidian.Notice("\uACC4\uC815 \uBCC0\uACBD \uC2E4\uD589 \uC2E4\uD328: " + String(error), 8e3);
      return false;
    }
  }
  async generateContent(title, content, mode, sourceUrl, onProgress, pdfProvider) {
    const path = await this.getPath();
    const installed = await this.isInstalled();
    if (!installed) {
      throw new Error(
        "nlm CLI\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.\n\uD130\uBBF8\uB110\uC5D0\uC11C 'uv tool install notebooklm-mcp-cli'\uB97C \uC2E4\uD589\uD558\uAC70\uB098,\n\uC124\uC815\uC5D0\uC11C nlm \uACBD\uB85C\uB97C \uC808\uB300 \uACBD\uB85C\uB85C \uC9C0\uC815\uD558\uC138\uC694.\n\uC608: /Users/yourname/.local/bin/nlm"
      );
    }
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) {
      throw new Error(
        "NotebookLM\uC5D0 \uB85C\uADF8\uC778\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.\n\uC124\uC815 \uD0ED\uC5D0\uC11C '\uBE0C\uB77C\uC6B0\uC800\uB85C \uB85C\uADF8\uC778' \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uAC70\uB098,\n\uD130\uBBF8\uB110\uC5D0\uC11C 'nlm login'\uC744 \uC2E4\uD589\uD558\uC138\uC694."
      );
    }
    const modeConfig = MODES[mode];
    onProgress?.("1/5  \uB178\uD2B8\uBD81 \uC0DD\uC131 \uC911...");
    const notebookName = title.replace(/[^\w\s가-힣\-_.]/g, "").trim().slice(0, 80) || `ppt-${Date.now()}`;
    let notebookId;
    try {
      const { stdout: createOut } = await execFileAsync(
        path,
        ["notebook", "create", notebookName],
        { timeout: 3e4 }
      );
      const uuidMatch = createOut.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      );
      const longIdMatch = createOut.match(/[a-zA-Z0-9_-]{20,}/);
      notebookId = uuidMatch?.[0] ?? longIdMatch?.[0] ?? notebookName;
      onProgress?.("\u21B3 \uB178\uD2B8\uBD81 \uC0DD\uC131 \uC644\uB8CC\nID: " + notebookId + "\ncreate \uCD9C\uB825: " + (createOut.trim() || "(\uC5C6\uC74C)"));
      await new Promise((r) => setTimeout(r, 3e3));
    } catch (error) {
      throw new Error("\uB178\uD2B8\uBD81 \uC0DD\uC131 \uC2E4\uD328: " + execDetail(error));
    }
    let exportedPdfPath = null;
    let uploadSucceeded = false;
    try {
      const truncated = content.length > 3e4 ? content.slice(0, 3e4) + "\n...(\uB0B4\uC6A9 \uC0DD\uB7B5)" : content;
      let sourceAdded = false;
      if (sourceUrl) {
        onProgress?.("2/5  URL \uC18C\uC2A4 \uC5C5\uB85C\uB4DC \uC911...\n(NotebookLM AI \uC778\uB371\uC2F1 \u2014 \uCD5C\uB300 1\uBD84 \uC18C\uC694)");
        try {
          await execFileAsync(
            path,
            ["source", "add", notebookId, "--url", sourceUrl, "--wait"],
            { timeout: 3e5 }
          );
          sourceAdded = true;
          uploadSucceeded = true;
          onProgress?.("\u21B3 URL \uC5C5\uB85C\uB4DC \uC644\uB8CC");
        } catch {
          onProgress?.("\u21B3 URL \uD06C\uB864\uB9C1 \uC2E4\uD328 \u2192 PDF \uBCC0\uD658\uC73C\uB85C \uC804\uD658");
        }
      } else {
        onProgress?.("2/5  \uC18C\uC2A4 \uC5C5\uB85C\uB4DC \uC900\uBE44 \uC911...\n(URL \uC5C6\uC74C \u2192 PDF \uBCC0\uD658 \uC2DC\uB3C4)");
      }
      if (!sourceAdded) {
        onProgress?.("2b/5  PDF \uBCC0\uD658 \uC911...\n(Obsidian \uB0B4\uBCF4\uB0B4\uAE30 \u2014 \uCD5C\uB300 30\uCD08 \uC18C\uC694)");
        const tmpPdfPath = pdfProvider ? await pdfProvider() : await this.convertMarkdownToPdf(title, truncated);
        if (tmpPdfPath) {
          exportedPdfPath = tmpPdfPath;
          onProgress?.("\u21B3 PDF \uBCC0\uD658 \uC131\uACF5: " + tmpPdfPath);
          try {
            await execFileAsync(
              path,
              ["source", "add", notebookId, "--file", tmpPdfPath, "--wait"],
              { timeout: 3e5 }
            );
            sourceAdded = true;
            uploadSucceeded = true;
            onProgress?.("\u21B3 PDF \uC5C5\uB85C\uB4DC \uC644\uB8CC");
          } catch (pdfErr) {
            onProgress?.("\u21B3 PDF \uC5C5\uB85C\uB4DC \uC2E4\uD328\n" + execDetail(pdfErr) + "\n\u2192 \uD14D\uC2A4\uD2B8 \uD30C\uC77C\uB85C \uC804\uD658");
          }
        } else {
          onProgress?.("\u21B3 PDF \uBCC0\uD658 \uBD88\uAC00 \u2192 \uD14D\uC2A4\uD2B8\uB85C \uC804\uD658");
        }
      }
      if (!sourceAdded) {
        onProgress?.("2c/5  \uD14D\uC2A4\uD2B8 \uD30C\uC77C \uC5C5\uB85C\uB4DC \uC911...\n(\uB9C8\uD06C\uB2E4\uC6B4 \uC815\uC81C \uD6C4 .txt \uC800\uC7A5)");
        const cleanedText = this.cleanTextForSource(truncated);
        if (!cleanedText) {
          throw new Error("\uC18C\uC2A4 \uCD94\uAC00 \uC2E4\uD328: \uB178\uD2B8 \uBCF8\uBB38\uC774 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.");
        }
        const tmpTxtPath = (0, import_path.join)((0, import_os.tmpdir)(), `nlm-src-${Date.now()}.txt`);
        try {
          await (0, import_promises.writeFile)(tmpTxtPath, cleanedText, "utf-8");
          await execFileAsync(
            path,
            ["source", "add", notebookId, "--file", tmpTxtPath, "--wait"],
            { timeout: 3e5 }
          );
          onProgress?.("\u21B3 txt \uC5C5\uB85C\uB4DC \uC644\uB8CC");
        } catch (txtErr) {
          onProgress?.("\u21B3 txt \uC5C5\uB85C\uB4DC \uC2E4\uD328\n" + execDetail(txtErr) + "\n\u2192 --text \uC9C1\uC811 \uC804\uB2EC \uC2DC\uB3C4");
          try {
            await execFileAsync(
              path,
              ["source", "add", notebookId, "--text", cleanedText],
              { timeout: 3e5 }
            );
            onProgress?.("\u21B3 \uD14D\uC2A4\uD2B8 \uCD94\uAC00 \uC644\uB8CC");
          } catch (error) {
            throw new Error("\uC18C\uC2A4 \uCD94\uAC00 \uC2E4\uD328: " + execDetail(error));
          }
        } finally {
          (0, import_promises.unlink)(tmpTxtPath).catch(() => {
          });
        }
      }
      onProgress?.("3/5  AI \uC694\uC57D \uC0DD\uC131 \uC911...\n(NotebookLM \uC751\uB2F5 \uB300\uAE30 \u2014 \uCD5C\uB300 2\uBD84 \uC18C\uC694)");
      let summary;
      try {
        const { stdout } = await execFileAsync(
          path,
          ["query", notebookId, modeConfig.summaryPrompt],
          { timeout: 12e4 }
        );
        summary = stdout.trim();
      } catch {
        summary = "\uC694\uC57D\uC744 \uC0DD\uC131\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
      }
      onProgress?.("4/5  \uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC2DC\uC791 \uC911...\n(5\uBD84\uB9C8\uB2E4 \uC0C1\uD0DC \uD655\uC778, \uCD5C\uB300 10\uBD84 \uB300\uAE30)");
      let artifactId;
      {
        const maxRetries = 3;
        let lastErr;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          if (attempt > 1) {
            onProgress?.(`\u21B3 \uC7AC\uC2DC\uB3C4 ${attempt}/${maxRetries} \u2014 30\uCD08 \uB300\uAE30 \uC911...`);
            await new Promise((r) => setTimeout(r, 3e4));
          }
          try {
            const { stdout } = await execFileAsync(
              path,
              [
                "slides",
                "create",
                notebookId,
                "--format",
                modeConfig.slidesFormat,
                "--length",
                modeConfig.slidesLength,
                "--focus",
                modeConfig.focusPrompt,
                "--language",
                "ko",
                "--confirm"
              ],
              { timeout: 6e4 }
            );
            artifactId = this.extractArtifactId(stdout);
            if (!artifactId) throw new Error("Artifact ID\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
            onProgress?.("\u21B3 \uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC2DC\uC791\uB428 (ID: " + artifactId + ")");
            lastErr = null;
            break;
          } catch (error) {
            lastErr = error;
            onProgress?.(`\u21B3 \uC2DC\uB3C4 ${attempt} \uC2E4\uD328: ` + execDetail(error));
          }
        }
        if (lastErr) throw new Error("\uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC2E4\uD328: " + execDetail(lastErr));
      }
      await this.waitForArtifact(path, notebookId, artifactId, onProgress);
      onProgress?.("\u21B3 \uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC644\uB8CC!");
      onProgress?.("5/5  PPTX \uB2E4\uC6B4\uB85C\uB4DC \uC911...");
      const tmpPath = (0, import_path.join)((0, import_os.tmpdir)(), `nlm-${Date.now()}.pptx`);
      try {
        await execFileAsync(
          path,
          [
            "download",
            "slide-deck",
            notebookId,
            "--id",
            artifactId,
            "--format",
            "pptx",
            "--output",
            tmpPath,
            "--no-progress"
          ],
          { timeout: 12e4 }
        );
      } catch (error) {
        throw new Error("PPTX \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: " + execDetail(error));
      }
      const fileBuffer = await (0, import_promises.readFile)(tmpPath);
      const pptxBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      );
      (0, import_promises.unlink)(tmpPath).catch(() => {
      });
      return { summary, pptxBuffer, mode };
    } finally {
      execFileAsync(path, ["notebook", "delete", notebookId], { timeout: 1e4 }).catch(() => {
      });
      if (exportedPdfPath && uploadSucceeded) (0, import_promises.unlink)(exportedPdfPath).catch(() => {
      });
    }
  }
  /**
   * 마크다운 텍스트를 PDF로 변환한다.
   * Electron BrowserWindow → pandoc 순으로 시도하며, 모두 실패하면 null을 반환한다.
   */
  async convertMarkdownToPdf(title, text) {
    const tmpPdfPath = (0, import_path.join)((0, import_os.tmpdir)(), `nlm-src-${Date.now()}.pdf`);
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:11pt;line-height:1.6;padding:50px;white-space:pre-wrap;word-wrap:break-word;}</style></head><body>${escaped}</body></html>`;
    try {
      let BrowserWindow = null;
      for (const mod of ["@electron/remote", "electron"]) {
        try {
          const m = globalThis.require?.(mod);
          const remote = mod === "electron" ? m?.remote : m;
          if (remote?.BrowserWindow) {
            BrowserWindow = remote.BrowserWindow;
            break;
          }
        } catch {
        }
      }
      if (BrowserWindow) {
        const win = new BrowserWindow({
          show: false,
          webPreferences: { nodeIntegration: false, contextIsolation: true }
        });
        await new Promise((resolve, reject) => {
          win.webContents.once("did-finish-load", resolve);
          win.webContents.once("did-fail-load", (_, code) => reject(new Error(String(code))));
          win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
        });
        const pdfBuffer = await win.webContents.printToPDF({ pageSize: "A4" });
        win.destroy();
        await (0, import_promises.writeFile)(tmpPdfPath, pdfBuffer);
        return tmpPdfPath;
      }
    } catch {
    }
    const tmpMdPath = (0, import_path.join)((0, import_os.tmpdir)(), `nlm-src-${Date.now()}.md`);
    try {
      await (0, import_promises.writeFile)(tmpMdPath, `# ${title}

${text}`, "utf-8");
      for (const pandoc of ["pandoc", "/opt/homebrew/bin/pandoc", "/usr/local/bin/pandoc"]) {
        try {
          await execFileAsync(pandoc, [tmpMdPath, "-o", tmpPdfPath], { timeout: 3e4 });
          return tmpPdfPath;
        } catch {
        }
      }
    } finally {
      (0, import_promises.unlink)(tmpMdPath).catch(() => {
      });
    }
    return null;
  }
  /** NotebookLM --text 소스 추가를 위해 마크다운 문법을 제거하고 순수 텍스트로 정제 */
  cleanTextForSource(text) {
    return text.replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^#{1,6}\s+/gm, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/`{3}[\s\S]*?`{3}/g, "").replace(/`[^`]+`/g, "").replace(/^\s*\|.*\|\s*$/gm, "").replace(/^\s*[-|:=]{3,}\s*$/gm, "").replace(/^\s*[-*+]\s+/gm, "").replace(/^\s*\d+\.\s+/gm, "").replace(/^>\s*/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  }
  /**
   * Studio artifact가 "completed" 상태가 될 때까지 폴링한다.
   * - 5분 간격으로 studio status --json 호출
   * - 30초마다 사이드바에 경과 시간 표시
   * - 최대 15분 대기 후 타임아웃
   */
  async waitForArtifact(path, notebookId, artifactId, onProgress) {
    const pollIntervalMs = 5 * 60 * 1e3;
    const maxWaitMs = 15 * 60 * 1e3;
    const tickMs = 30 * 1e3;
    const startTime = Date.now();
    let lastPollTime = Date.now();
    while (true) {
      await new Promise((r) => setTimeout(r, tickMs));
      const elapsed = Date.now() - startTime;
      const mins = Math.floor(elapsed / 6e4);
      const secs = Math.floor(elapsed % 6e4 / 1e3);
      const timeStr = `${mins}\uBD84 ${String(secs).padStart(2, "0")}\uCD08 \uACBD\uACFC`;
      if (Date.now() - lastPollTime >= pollIntervalMs) {
        try {
          const { stdout: statusOut } = await execFileAsync(
            path,
            ["studio", "status", notebookId, "--json"],
            { timeout: 15e3 }
          );
          let status = "unknown";
          try {
            const artifacts = JSON.parse(statusOut);
            status = artifacts.find((a) => a.id === artifactId)?.status ?? "unknown";
          } catch {
          }
          lastPollTime = Date.now();
          if (status === "completed") return;
        } catch {
          lastPollTime = Date.now();
        }
      }
      onProgress?.(`\u21B3 \uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC911... | ${timeStr}`);
      if (elapsed >= maxWaitMs) {
        throw new Error("\uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC2DC\uAC04 \uCD08\uACFC (15\uBD84 \uCD08\uACFC)");
      }
    }
  }
  extractId(output) {
    const lines = output.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      const m = lines[i].match(/^([a-zA-Z0-9_-]{6,})$/);
      if (m) return m[1];
    }
    const match = output.match(/([a-zA-Z0-9_-]{10,})/);
    if (match) return match[1];
    return lines[lines.length - 1] || output.trim();
  }
  extractArtifactId(output) {
    const uuidMatch = output.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    if (uuidMatch) return uuidMatch[0];
    const longMatch = output.match(/[a-zA-Z0-9_-]{20,}/);
    if (longMatch) return longMatch[0];
    return output.trim().split("\n").pop()?.trim() || "";
  }
};

// src/mode-modal.ts
var import_obsidian2 = require("obsidian");
var ModeSelectionModal = class extends import_obsidian2.Modal {
  constructor(app) {
    super(app);
    this.resolve = null;
  }
  open() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      super.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("clippings-ppt-modal");
    contentEl.createEl("h2", { text: "\uB9AC\uD3EC\uD2B8 \uBAA8\uB4DC \uC120\uD0DD" });
    contentEl.createEl("p", {
      text: "\uC5B4\uB5A4 \uC2A4\uD0C0\uC77C\uC758 PPT\uB97C \uC0DD\uC131\uD560\uAE4C\uC694?",
      cls: "clippings-ppt-modal-desc"
    });
    const modesContainer = contentEl.createDiv({
      cls: "clippings-ppt-modes"
    });
    const modeEntries = [
      ["detailed", MODES.detailed],
      ["executive", MODES.executive],
      ["easy", MODES.easy]
    ];
    for (const [key, config] of modeEntries) {
      const card = modesContainer.createDiv({
        cls: "clippings-ppt-mode-card"
      });
      card.createDiv({
        cls: "clippings-ppt-mode-icon",
        text: config.icon
      });
      const textContainer = card.createDiv({
        cls: "clippings-ppt-mode-text"
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
  onClose() {
    if (this.resolve) {
      this.resolve(null);
      this.resolve = null;
    }
    this.contentEl.empty();
  }
};

// src/settings.ts
var import_obsidian3 = require("obsidian");
var DEFAULT_SETTINGS = {
  nlmPath: "nlm",
  clippingsFolder: "Clippings",
  outputSubfolder: "PDF",
  exportPdfSubfolder: "exportPDF"
};
var ClippingsPptSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: `Clippings NotebookLM v${this.plugin.manifest.version}` });
    containerEl.createEl("h3", { text: "NotebookLM \uC5F0\uB3D9" });
    const loginSetting = new import_obsidian3.Setting(containerEl).setName("NotebookLM \uB85C\uADF8\uC778").setDesc("Google \uACC4\uC815\uC73C\uB85C NotebookLM\uC5D0 \uB85C\uADF8\uC778\uD569\uB2C8\uB2E4.");
    const statusEl = loginSetting.descEl.createEl("div", {
      cls: "clippings-ppt-login-status"
    });
    this.checkLoginStatus(statusEl);
    loginSetting.addButton(
      (button) => button.setButtonText("\u{1F310} \uBE0C\uB77C\uC6B0\uC800\uB85C \uB85C\uADF8\uC778").onClick(async () => {
        button.setDisabled(true);
        await this.plugin.nlmClient.launchLogin();
        button.setDisabled(false);
      })
    );
    loginSetting.addButton(
      (button) => button.setButtonText("\uACC4\uC815 \uBCC0\uACBD").onClick(async () => {
        button.setDisabled(true);
        await this.plugin.nlmClient.launchAccountSwitch();
        button.setDisabled(false);
      })
    );
    loginSetting.addButton(
      (button) => button.setButtonText("\uC0C1\uD0DC \uD655\uC778").onClick(async () => {
        button.setDisabled(true);
        button.setButtonText("\uD655\uC778 \uC911...");
        await this.checkLoginStatus(statusEl);
        button.setDisabled(false);
        button.setButtonText("\uC0C1\uD0DC \uD655\uC778");
      })
    );
    new import_obsidian3.Setting(containerEl).setName("nlm CLI \uACBD\uB85C").setDesc(
      "notebooklm-mcp-cli\uC758 nlm \uC2E4\uD589 \uD30C\uC77C \uACBD\uB85C. \uAE30\uBCF8\uAC12 'nlm'\uC73C\uB85C \uCC3E\uC9C0 \uBABB\uD560 \uACBD\uC6B0 \uC808\uB300 \uACBD\uB85C\uB97C \uC785\uB825\uD558\uC138\uC694. \uC608: /Users/yourname/.local/bin/nlm"
    ).addText(
      (text) => text.setPlaceholder("nlm").setValue(this.plugin.settings.nlmPath).onChange(async (value) => {
        this.plugin.settings.nlmPath = value || "nlm";
        this.plugin.nlmClient.setPath(this.plugin.settings.nlmPath);
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\uD3F4\uB354 \uC124\uC815" });
    new import_obsidian3.Setting(containerEl).setName("Clippings \uD3F4\uB354").setDesc("\uC6F9 \uD074\uB9AC\uD551\uC774 \uC800\uC7A5\uB418\uB294 \uD3F4\uB354 \uACBD\uB85C").addText(
      (text) => text.setPlaceholder("Clippings").setValue(this.plugin.settings.clippingsFolder).onChange(async (value) => {
        this.plugin.settings.clippingsFolder = value || "Clippings";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("PPT \uC800\uC7A5 \uD558\uC704 \uD3F4\uB354").setDesc("Clippings \uD3F4\uB354 \uC548\uC5D0 PPT\uAC00 \uC800\uC7A5\uB420 \uD558\uC704 \uD3F4\uB354\uBA85").addText(
      (text) => text.setPlaceholder("PDF").setValue(this.plugin.settings.outputSubfolder).onChange(async (value) => {
        this.plugin.settings.outputSubfolder = value || "PDF";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("PDF \uB0B4\uBCF4\uB0B4\uAE30 \uC784\uC2DC \uC800\uC7A5 \uD3F4\uB354").setDesc("NotebookLM \uC5C5\uB85C\uB4DC\uC6A9 PDF\uAC00 \uC784\uC2DC \uC800\uC7A5\uB420 \uD558\uC704 \uD3F4\uB354\uBA85 (\uC5C5\uB85C\uB4DC \uD6C4 \uC790\uB3D9 \uC0AD\uC81C)").addText(
      (text) => text.setPlaceholder("exportPDF").setValue(this.plugin.settings.exportPdfSubfolder).onChange(async (value) => {
        this.plugin.settings.exportPdfSubfolder = value || "exportPDF";
        await this.plugin.saveSettings();
      })
    );
  }
  async checkLoginStatus(statusEl) {
    statusEl.empty();
    statusEl.setText("\uD655\uC778 \uC911...");
    statusEl.removeClass("clippings-ppt-status-ok", "clippings-ppt-status-error");
    const installed = await this.plugin.nlmClient.isInstalled();
    if (!installed) {
      statusEl.setText("\u26A0 nlm CLI \uBBF8\uC124\uCE58 \u2014 \uD130\uBBF8\uB110\uC5D0\uC11C: uv tool install notebooklm-mcp-cli");
      statusEl.addClass("clippings-ppt-status-error");
      return;
    }
    const loggedIn = await this.plugin.nlmClient.isLoggedIn();
    if (loggedIn) {
      statusEl.setText("\u2713 \uB85C\uADF8\uC778\uB428");
      statusEl.addClass("clippings-ppt-status-ok");
    } else {
      statusEl.setText("\u2717 \uB85C\uADF8\uC778 \uD544\uC694 \u2014 '\uBE0C\uB77C\uC6B0\uC800\uB85C \uB85C\uADF8\uC778' \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC138\uC694");
      statusEl.addClass("clippings-ppt-status-error");
    }
  }
};

// src/sidebar.ts
var import_obsidian4 = require("obsidian");
var VIEW_TYPE_SIDEBAR = "clippings-notebooklm-sidebar";
var ClippingsSidebarView = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.historyListEl = null;
    this.generateBtn = null;
    this.hintEl = null;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_SIDEBAR;
  }
  getDisplayText() {
    return "Clippings NotebookLM";
  }
  getIcon() {
    return "notebooklm";
  }
  async onOpen() {
    this.render();
  }
  async onClose() {
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("clippings-sidebar");
    const header = contentEl.createEl("div", { cls: "clippings-sidebar-header" });
    header.createEl("span", { cls: "clippings-sidebar-title", text: "\u{1F4D3} NotebookLM" });
    const btnArea = contentEl.createEl("div", { cls: "clippings-sidebar-btn-area" });
    const btn = btnArea.createEl("button", {
      cls: "clippings-sidebar-generate-btn",
      text: "NotebookLM\uC73C\uB85C \uC694\uC57D\uD558\uAE30"
    });
    this.generateBtn = btn;
    btn.addEventListener("click", async () => {
      if (this.plugin.isRunning) return;
      const activeFile = this.plugin.app.workspace.getActiveFile();
      if (!activeFile) {
        return;
      }
      if (!activeFile.path.startsWith(this.plugin.settings.clippingsFolder + "/")) {
        this.showHint("Clippings \uD3F4\uB354\uC758 \uB178\uD2B8\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.");
        return;
      }
      const modal = new ModeSelectionModal(this.plugin.app);
      const mode = await modal.open();
      if (mode) {
        await this.plugin.handleGeneratePpt(activeFile, mode);
      }
    });
    const hintEl = contentEl.createEl("div", { cls: "clippings-sidebar-hint" });
    this.hintEl = hintEl;
    this.updateActiveFileHint(hintEl);
    this.registerEvent(
      this.plugin.app.workspace.on("active-leaf-change", () => {
        if (!this.plugin.isRunning) this.updateActiveFileHint(hintEl);
      })
    );
    this.refreshBtn();
    contentEl.createEl("hr", { cls: "clippings-sidebar-divider" });
    contentEl.createEl("div", { cls: "clippings-sidebar-section-title", text: "\uC791\uC5C5 \uB0B4\uC5ED" });
    this.historyListEl = contentEl.createEl("div", { cls: "clippings-sidebar-history" });
    this.renderHistory();
  }
  /** isRunning 상태에 따라 버튼과 힌트를 갱신한다. */
  refreshBtn() {
    if (!this.generateBtn) return;
    if (this.plugin.isRunning) {
      this.generateBtn.disabled = true;
      this.generateBtn.textContent = "\u23F3 \uC791\uC5C5 \uC9C4\uD589 \uC911...";
      this.generateBtn.addClass("clippings-sidebar-generate-btn--running");
      if (this.hintEl) {
        this.hintEl.textContent = "\uC644\uB8CC \uD6C4 \uC0AC\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4";
        this.hintEl.removeClass("clippings-sidebar-hint-active");
      }
    } else {
      this.generateBtn.disabled = false;
      this.generateBtn.textContent = "NotebookLM\uC73C\uB85C \uC694\uC57D\uD558\uAE30";
      this.generateBtn.removeClass("clippings-sidebar-generate-btn--running");
      if (this.hintEl) this.updateActiveFileHint(this.hintEl);
    }
  }
  showHint(msg) {
    const existing = this.contentEl.querySelector(".clippings-sidebar-toast");
    if (existing) existing.remove();
    const toast = this.contentEl.createEl("div", {
      cls: "clippings-sidebar-toast",
      text: msg
    });
    setTimeout(() => toast.remove(), 3e3);
  }
  updateActiveFileHint(el) {
    const file = this.plugin.app.workspace.getActiveFile();
    if (!file) {
      el.setText("\uD65C\uC131 \uB178\uD2B8 \uC5C6\uC74C");
      el.removeClass("clippings-sidebar-hint-active");
      return;
    }
    const isClippings = file.path.startsWith(this.plugin.settings.clippingsFolder + "/") && !file.path.slice(this.plugin.settings.clippingsFolder.length + 1).includes("/");
    if (isClippings) {
      el.setText(`\u2713 ${file.basename}`);
      el.addClass("clippings-sidebar-hint-active");
    } else {
      el.setText("Clippings \uD3F4\uB354 \uB178\uD2B8\uB97C \uC5F4\uC5B4\uC8FC\uC138\uC694");
      el.removeClass("clippings-sidebar-hint-active");
    }
  }
  renderHistory() {
    if (!this.historyListEl) return;
    this.refreshBtn();
    this.historyListEl.empty();
    const history = this.plugin.history;
    if (history.length === 0) {
      this.historyListEl.createEl("div", {
        cls: "clippings-sidebar-empty",
        text: "\uC544\uC9C1 \uC0DD\uC131 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
      });
      return;
    }
    for (const item of [...history].reverse()) {
      const card = this.historyListEl.createEl("div", { cls: "clippings-sidebar-history-card" });
      const cardTop = card.createEl("div", { cls: "clippings-sidebar-card-top" });
      const statusIcon = item.status === "success" ? "\u2713" : item.status === "running" ? "\u23F3" : "\u2717";
      cardTop.createEl("span", {
        cls: `clippings-sidebar-status clippings-sidebar-status-${item.status}`,
        text: statusIcon
      });
      cardTop.createEl("span", {
        cls: "clippings-sidebar-card-title",
        text: item.title
      });
      const cardMeta = card.createEl("div", { cls: "clippings-sidebar-card-meta" });
      cardMeta.createEl("span", { text: `${item.modeIcon} ${item.mode}` });
      cardMeta.createEl("span", { text: this.formatDate(item.date) });
      if (item.log && item.log.length > 0) {
        const logEl = card.createEl("div", { cls: "clippings-sidebar-card-log" });
        const entries = item.log;
        for (const entry of entries) {
          logEl.createEl("div", {
            cls: "clippings-sidebar-card-log-entry",
            text: entry
          });
        }
      }
      if (item.status === "error") {
        const copyBtn = card.createEl("button", {
          cls: "clippings-sidebar-card-copy-btn",
          text: "\uB85C\uADF8 \uBCF5\uC0AC"
        });
        copyBtn.addEventListener("click", () => {
          const logText = (item.log ?? []).join("\n");
          const full = logText ? logText + "\n" + (item.errorMsg ?? "") : item.errorMsg ?? "";
          navigator.clipboard.writeText(full).then(() => {
            copyBtn.textContent = "\u2713 \uBCF5\uC0AC\uB428";
            setTimeout(() => {
              copyBtn.textContent = "\uB85C\uADF8 \uBCF5\uC0AC";
            }, 2e3);
          });
        });
      }
      if (item.status === "error" && item.errorMsg) {
        card.createEl("div", {
          cls: "clippings-sidebar-card-error",
          text: item.errorMsg
        });
      }
      if (item.status === "success" && item.pptPath) {
        const link = card.createEl("div", {
          cls: "clippings-sidebar-card-link",
          text: `\u{1F4CE} ${item.pptPath.split("/").pop()}`
        });
        link.addEventListener("click", () => {
          const file = this.plugin.app.vault.getAbstractFileByPath(item.pptPath);
          if (file instanceof import_obsidian4.TFile) {
            this.plugin.app.workspace.getLeaf().openFile(file);
          }
        });
      }
    }
  }
  formatDate(date) {
    const now = /* @__PURE__ */ new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 6e4) return "\uBC29\uAE08 \uC804";
    if (diff < 36e5) return `${Math.floor(diff / 6e4)}\uBD84 \uC804`;
    if (diff < 864e5) return `${Math.floor(diff / 36e5)}\uC2DC\uAC04 \uC804`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
};

// src/main.ts
var NOTEBOOKLM_ICON_ID = "notebooklm";
var NOTEBOOKLM_ICON_SVG = `
<rect x="8" y="5" width="78" height="90" rx="8" fill="none" stroke="currentColor" stroke-width="6"/>
<line x1="26" y1="5" x2="26" y2="95" stroke="currentColor" stroke-width="6"/>
<path d="M70 13 L75 24 L86 29 L75 34 L70 45 L65 34 L54 29 L65 24 Z" fill="currentColor"/>
<line x1="36" y1="60" x2="78" y2="60" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
<line x1="36" y1="75" x2="78" y2="75" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
`;
var ClippingsPptPlugin = class extends import_obsidian5.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.nlmClient = new NotebookLMClient();
    this.history = [];
    this.isRunning = false;
  }
  async onload() {
    (0, import_obsidian5.addIcon)(NOTEBOOKLM_ICON_ID, NOTEBOOKLM_ICON_SVG);
    await this.loadSettings();
    this.nlmClient = new NotebookLMClient(this.settings.nlmPath);
    this.addSettingTab(new ClippingsPptSettingTab(this.app, this));
    this.registerView(
      VIEW_TYPE_SIDEBAR,
      (leaf) => new ClippingsSidebarView(leaf, this)
    );
    this.addRibbonIcon(NOTEBOOKLM_ICON_ID, "Clippings NotebookLM", () => {
      this.toggleSidebar();
    });
    this.addCommand({
      id: "generate-ppt-notebooklm",
      name: "NotebookLM\uC73C\uB85C PPT \uB9CC\uB4E4\uAE30",
      checkCallback: (checking) => {
        if (this.isRunning) return false;
        const view = this.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
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
      }
    });
  }
  async toggleSidebar() {
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
  refreshSidebar() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_SIDEBAR).forEach((leaf) => {
      if (leaf.view instanceof ClippingsSidebarView) {
        leaf.view.renderHistory();
      }
    });
  }
  async handleGeneratePpt(file, mode) {
    const modeConfig = MODES[mode];
    if (this.isRunning) return;
    this.isRunning = true;
    const historyItem = {
      title: file.basename,
      mode: modeConfig.label,
      modeIcon: modeConfig.icon,
      status: "running",
      date: /* @__PURE__ */ new Date(),
      log: ["\uC5F0\uACB0 \uC911..."]
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
        source || void 0,
        (step) => {
          historyItem.log = historyItem.log ?? [];
          historyItem.log.push(step);
          this.refreshSidebar();
        },
        () => this.exportFileToPdf(file)
      );
      const outputFolder = `${this.settings.clippingsFolder}/${this.settings.outputSubfolder}`;
      const pptFileName = `${file.basename}.pptx`;
      const pptPath = `${outputFolder}/${pptFileName}`;
      if (!this.app.vault.getAbstractFileByPath(outputFolder)) {
        await this.app.vault.createFolder(outputFolder);
      }
      const existingFile = this.app.vault.getAbstractFileByPath(pptPath);
      if (existingFile instanceof import_obsidian5.TFile) {
        await this.app.vault.modifyBinary(existingFile, result.pptxBuffer);
      } else {
        await this.app.vault.createBinary(pptPath, result.pptxBuffer);
      }
      await this.insertSummaryAndLink(
        file,
        content,
        result.summary,
        pptPath,
        modeConfig
      );
      historyItem.status = "success";
      historyItem.pptPath = pptPath;
      historyItem.log?.push(`\u2713 \uC644\uB8CC: ${pptFileName}`);
      this.refreshSidebar();
    } catch (error) {
      const rawMsg = String(error);
      historyItem.status = "error";
      historyItem.errorMsg = this.classifyError(rawMsg);
      historyItem.log?.push("\u2717 \uC624\uB958: " + rawMsg);
      this.refreshSidebar();
      console.error("[Clippings NotebookLM] PPT \uC0DD\uC131 \uC624\uB958:", error);
    } finally {
      this.isRunning = false;
    }
  }
  /**
   * Obsidian 내장 "PDF로 내보내기" 명령을 트리거하여 임시 PDF 파일 경로를 반환한다.
   * Electron remote 모듈이 없거나 내보내기 실패 시 null 반환.
   */
  async exportFileToPdf(file) {
    const vaultBasePath = this.app.vault.adapter.basePath ?? (0, import_os2.tmpdir)();
    const exportDir = (0, import_path2.join)(vaultBasePath, this.settings.clippingsFolder, this.settings.exportPdfSubfolder);
    await (0, import_promises2.mkdir)(exportDir, { recursive: true }).catch(() => {
    });
    const tmpPdfPath = (0, import_path2.join)(exportDir, `${file.basename}.pdf`);
    try {
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);
      let restoreDialog = null;
      for (const mod of ["@electron/remote", "electron"]) {
        try {
          const m = globalThis.require?.(mod);
          const remote = mod === "electron" ? m?.remote : m;
          if (remote?.dialog) {
            const dialog = remote.dialog;
            const origSync = dialog.showSaveDialogSync;
            const origAsync = dialog.showSaveDialog;
            dialog.showSaveDialogSync = () => tmpPdfPath;
            dialog.showSaveDialog = async () => ({ canceled: false, filePath: tmpPdfPath });
            restoreDialog = () => {
              dialog.showSaveDialogSync = origSync;
              dialog.showSaveDialog = origAsync;
            };
            break;
          }
        } catch {
        }
      }
      if (!restoreDialog) {
        try {
          const electron = globalThis.require?.("electron");
          const ipc = electron?.ipcRenderer;
          if (ipc?.invoke) {
            const origInvoke = ipc.invoke.bind(ipc);
            ipc.invoke = async (channel, ...args) => {
              if (typeof channel === "string") {
                const argsStr = JSON.stringify(args).toLowerCase();
                if (argsStr.includes(".pdf") || argsStr.includes("pdf")) {
                  return { canceled: false, filePath: tmpPdfPath };
                }
              }
              return origInvoke(channel, ...args);
            };
            restoreDialog = () => {
              ipc.invoke = origInvoke;
            };
          }
        } catch {
        }
      }
      if (!restoreDialog) return null;
      try {
        this.app.commands.executeCommandById("workspace:export-pdf");
        const modalDeadline = Date.now() + 5e3;
        while (Date.now() < modalDeadline) {
          await new Promise((r) => setTimeout(r, 100));
          const btns = Array.from(document.querySelectorAll("button.mod-cta"));
          const pdfBtn = btns.find(
            (btn) => (btn.textContent || "").includes("PDF")
          );
          if (pdfBtn) {
            pdfBtn.click();
            break;
          }
        }
        const deadline = Date.now() + 3e4;
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 500));
          try {
            await (0, import_promises2.access)(tmpPdfPath, import_promises2.constants.F_OK);
            return tmpPdfPath;
          } catch {
          }
        }
      } finally {
        restoreDialog();
      }
    } catch {
    }
    return null;
  }
  classifyError(msg) {
    if (msg.includes("\uC18C\uC2A4 \uCD94\uAC00 \uC2E4\uD328")) {
      return "\u{1F4C4} \uC18C\uC2A4 \uC5C5\uB85C\uB4DC \uC2E4\uD328.\n\uB178\uD2B8\uC758 source URL\uC744 \uD655\uC778\uD558\uAC70\uB098 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    } else if (msg.includes("\uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC2E4\uD328")) {
      return "\u{1F3A8} \uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131 \uC2E4\uD328.\n\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    } else if (msg.includes("\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328")) {
      return "\u2B07\uFE0F PPTX \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328.\n\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    } else if (msg.includes("\uB85C\uADF8\uC778") || msg.includes("login")) {
      return "\u{1F510} NotebookLM \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.\n\uC124\uC815 \u2192 \uBE0C\uB77C\uC6B0\uC800\uB85C \uB85C\uADF8\uC778";
    } else if (msg.includes("\uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4") || msg.includes("not found") || msg.includes("ENOENT")) {
      return "\u26A0\uFE0F nlm CLI\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.\n\uC124\uC815\uC5D0\uC11C \uACBD\uB85C\uB97C \uD655\uC778\uD558\uC138\uC694.";
    }
    return "\u274C PPT \uC0DD\uC131 \uC2E4\uD328.\n\uAC1C\uBC1C\uC790 \uB3C4\uAD6C \uCF58\uC194(Ctrl+Shift+I)\uC5D0\uC11C \uC790\uC138\uD55C \uC624\uB958\uB97C \uD655\uC778\uD558\uC138\uC694.";
  }
  async insertSummaryAndLink(file, originalContent, summary, pptPath, modeConfig) {
    const { raw: rawFrontmatter, body } = this.parseFrontmatter(originalContent);
    const summaryBlock = `> [!summary] ${modeConfig.icon} ${modeConfig.label}
` + summary.split("\n").map((line) => `> ${line}`).join("\n") + `
>
> \u{1F4CE} **PPT:** [[${pptPath}]]`;
    let newBody;
    if (body.includes("> [!summary]")) {
      newBody = body.replace(
        /> \[!summary\][\s\S]*?(?=\n[^>]|\n\n[^>]|$)/,
        summaryBlock
      );
    } else {
      newBody = summaryBlock + "\n\n" + body;
    }
    const newContent = rawFrontmatter ? rawFrontmatter + "\n" + newBody : newBody;
    await this.app.vault.modify(file, newContent);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.summary = summary;
    });
  }
  parseFrontmatter(content) {
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!fmMatch) {
      return { frontmatter: {}, body: content, raw: "" };
    }
    const raw = fmMatch[0].trimEnd();
    const body = content.slice(fmMatch[0].length);
    const frontmatter = {};
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
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
