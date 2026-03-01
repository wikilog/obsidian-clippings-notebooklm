import esbuild from "esbuild";
import process from "process";
import fs from "fs";
import path from "path";

const prod = process.argv[2] === "production";

/**
 * Copy built files to the Obsidian vault plugin directory.
 * Set the OBSIDIAN_VAULT environment variable to enable auto-copy:
 *   OBSIDIAN_VAULT=/path/to/vault npm run build
 *
 * For development, add to your shell profile or .env.local:
 *   export OBSIDIAN_VAULT=/path/to/your/obsidian/vault
 */
const copyToVaultPlugin = {
	name: "copy-to-vault",
	setup(build) {
		build.onEnd((result) => {
			if (result.errors.length > 0) return;

			const vault = process.env.OBSIDIAN_VAULT;
			if (!vault) return;

			const pluginDir = path.join(
				vault,
				".obsidian",
				"plugins",
				"clippings-notebooklm"
			);

			try {
				if (!fs.existsSync(pluginDir)) {
					fs.mkdirSync(pluginDir, { recursive: true });
				}
				for (const file of ["main.js", "manifest.json", "styles.css"]) {
					if (fs.existsSync(file)) {
						fs.copyFileSync(file, path.join(pluginDir, file));
					}
				}
				console.log(`[copy-to-vault] Copied to ${pluginDir}`);
			} catch (err) {
				console.error("[copy-to-vault] Failed:", err.message);
			}
		});
	},
};

const context = await esbuild.context({
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
	],
	format: "cjs",
	target: "es2020",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
	platform: "node",
	plugins: [copyToVaultPlugin],
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
