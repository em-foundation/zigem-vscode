import vscode from "vscode";

import { ZigFormatProvider, ZigRangeFormatProvider } from "./zigFormat";
import { activate as activateZls, deactivate as deactivateZls } from "./zls";
import ZigCompilerProvider from "./zigCompilerProvider";
import { setupZig } from "./zigSetup";

const ZIG_MODE: vscode.DocumentFilter = { language: "zig", scheme: "file" };

export async function activate(context: vscode.ExtensionContext) {
    await updateSettings('editor', 'tokenColorCustomizations', COLORS);
    await setupZig(context).finally(() => {
        const compiler = new ZigCompilerProvider();
        compiler.activate(context.subscriptions);

        if (vscode.workspace.getConfiguration("zig").get<string>("formattingProvider") === "extension") {
            context.subscriptions.push(
                vscode.languages.registerDocumentFormattingEditProvider(ZIG_MODE, new ZigFormatProvider()),
            );
            context.subscriptions.push(
                vscode.languages.registerDocumentRangeFormattingEditProvider(ZIG_MODE, new ZigRangeFormatProvider()),
            );
        }

        void activateZls(context);
    });
}

export async function deactivate() {
    await deactivateZls();
}

function rootPath(): string {
    return vscode.workspace.workspaceFolders![0].uri.fsPath
}

async function updateSettings(sect: string, key: string, val: any) {
    let conf = vscode.workspace.getConfiguration(sect, vscode.Uri.file(rootPath()))
    await conf.update(key, val, vscode.ConfigurationTarget.Workspace)
}

const COLORS = 
    {
        "textMateRules": [
            {
                "scope": "zigem-0",
                "settings": {
                    "foreground": "#fa6424",
                    "fontStyle": "bold"
                }
            },
            {
                "scope": "zigem",
                "settings": {
                    "foreground": "#f99165",
                    "fontStyle": "bold"
                }
            },
            {
                "scope": "zigem-2",
                "settings": {
                    "foreground": "#c0e3f9",
                    "fontStyle": "bold"
                }
            },
            {
                "scope": "zigemDebug",
                "settings": {
                    "foreground": "#ff0000",
                    "fontStyle": "bold"
                }
            },
            {
                "scope": "zigemMarker",
                "settings": {
                    "foreground": "#bbffee",
                    "fontStyle": "bold"
                }
            },
        ]
    }
