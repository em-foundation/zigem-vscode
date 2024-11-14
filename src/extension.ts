import Fs from "fs";
import Path from "path";
import Vsc from "vscode";

import { ZigFormatProvider, ZigRangeFormatProvider } from "./zigFormat";
import { activate as activateZls, deactivate as deactivateZls } from "./zls";
import ZigCompilerProvider from "./zigCompilerProvider";
import { setupZig } from "./zigSetup";

const ZIG_MODE: Vsc.DocumentFilter = { language: "zig", scheme: "file" };

export async function activate(context: Vsc.ExtensionContext) {
    let zigFlag = Vsc.extensions.getExtension("ziglang.vscode-zig") != undefined;
    if (zigFlag) {
        let opts: Vsc.MessageOptions = { detail: "Disable the 'ziglang.vscode-zig' extension in this workspace", modal: true };
        await Vsc.window.showWarningMessage("Zig•EM", opts);
        return;
    }
    await updateSettings('editor', 'tokenColorCustomizations', COLORS);
    await updateSettings('workbench', 'tree.indent', 20)
    await refreshIcons();
    await setupZig(context).finally(() => {
        const compiler = new ZigCompilerProvider();
        compiler.activate(context.subscriptions);
        if (Vsc.workspace.getConfiguration("zig").get<string>("formattingProvider") === "extension") {
            context.subscriptions.push(
                Vsc.languages.registerDocumentFormattingEditProvider(ZIG_MODE, new ZigFormatProvider()),
            );
            context.subscriptions.push(
                Vsc.languages.registerDocumentRangeFormattingEditProvider(ZIG_MODE, new ZigRangeFormatProvider()),
            );
        }
        Vsc.workspace.onDidOpenTextDocument((document) => {
            if (document.fileName.endsWith(".em.zig")) {
                Vsc.window.showTextDocument(document).then(editor => {
                    foldRegions(editor);
                });
            }
        });
        Vsc.workspace.onDidSaveTextDocument((document) => {
            if (document.fileName.endsWith(".em.zig")) {
                Vsc.window.showTextDocument(document).then(editor => {
                    foldRegions(editor);
                });
            }
        }),
        activateZls(context);
        Vsc.window.showInformationMessage("Zig•EM activated");

    });
}


function foldRegions(editor: Vsc.TextEditor) {
    const { document } = editor;
    const foldingRanges: Vsc.Range[] = [];
    const savedSelection = editor.selection;

    // Customize this with your folding region logic
    for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;

        // Identify your folding region (e.g., based on specific markers)
        if (lineText.startsWith('//#region zigem')) {  // or your folding marker
            const startLine = i;
            // Find end of the region based on your criteria
            const endLine = document.lineCount - 1; // Example ending, adjust as needed
            foldingRanges.push(new Vsc.Range(startLine, 0, endLine, 0));
        }
    }

    editor.selections = foldingRanges.map(range => new Vsc.Selection(range.start, range.end));
    Vsc.commands.executeCommand('editor.fold').then(() => {
        // Return focus to the top of the file
        // const topLinePosition = new Vsc.Position(0, 0);
        // editor.selection = new Vsc.Selection(topLinePosition, topLinePosition);
        // editor.revealRange(new Vsc.Range(topLinePosition, topLinePosition), Vsc.TextEditorRevealType.AtTop);
        editor.selection = savedSelection;
        editor.revealRange(savedSelection, Vsc.TextEditorRevealType.Default);
    });

}


export async function deactivate() {
    await deactivateZls();
}

function isPackage(path: string): boolean {
    if (!Fs.existsSync(path)) return false;
    if (!Fs.statSync(path).isDirectory()) return false;
    let ifile = Path.join(path, 'zigem-package.ini');
    if (!Fs.existsSync(ifile)) return false;
    return true;
}

function mkBucketNames(): string[] {
    let res = new Array<string>();
    let wpath = Path.join(rootPath(), "workspace");
    Fs.readdirSync(wpath).forEach(f => {
        let ppath = Path.join(wpath, f);
        if (isPackage(ppath)) Fs.readdirSync(ppath).forEach(f => {
            let bpath = Path.join(ppath, f);
            if (Fs.statSync(bpath).isDirectory()) res.push(f);
        });
    });
    return res;
}

function mkPackageNames(): string[] {
    let res = new Array<string>();
    let wpath = Path.join(rootPath(), "workspace");
    Fs.readdirSync(wpath).forEach(f => {
        if (isPackage(Path.join(wpath, f))) res.push(f);
    });
    return res;
}

async function refreshIcons() {
    let conf = Vsc.workspace.getConfiguration('vsicons', Vsc.Uri.file(rootPath()))
    let pnames = mkPackageNames();
    let bnames = mkBucketNames();
    await conf.update('associations.folders', [
        { icon: 'empackage', extensions: pnames, format: 'svg' },
        { icon: 'embucket', extensions: bnames, format: 'svg' },
        { icon: 'zigem', extensions: ['zigem'], format: 'svg' },
    ], Vsc.ConfigurationTarget.Workspace)
    await conf.update('associations.files', [
        { icon: 'emunit', extensions: ['.em.zig'], format: 'svg' },
    ], Vsc.ConfigurationTarget.Workspace)
    await conf.update('customIconFolderPath', Path.join(Vsc.extensions.getExtension('the-em-foundation.vscode-zigem')!.extensionPath, 'etc'))
    Vsc.commands.executeCommand('vscode-icons.regenerateIcons')
}

function rootPath(): string {
    return Vsc.workspace.workspaceFolders![0].uri.fsPath
}

async function updateSettings(sect: string, key: string, val: any) {
    let conf = Vsc.workspace.getConfiguration(sect, Vsc.Uri.file(rootPath()))
    await conf.update(key, val, Vsc.ConfigurationTarget.Workspace)
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
            "scope": "zigemDomain",
            "settings": {
                "foreground": "#96ccbf",
                "fontStyle": "italic"
            }
        },
        {
            "scope": "zigemDomainRef",
            "settings": {
                "foreground": "#bbffee",
                "fontStyle": "normal"
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
