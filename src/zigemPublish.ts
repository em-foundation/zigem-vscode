import * as ChildProc from 'child_process';
import Fs from "fs";
import Os from "os";
import Path from "path";
import Vsc from "vscode";

export function exec(doc: Vsc.TextDocument) {
    // TODO validate with Fs.existsSync
    let root = Vsc.workspace.workspaceFolders![0].uri.fsPath;
    let exePath = Path.join(root, "zig-out", "bin", "zigem");
    if (Os.platform() == 'win32') exePath += ".exe";
    let proc = ChildProc.spawnSync(exePath, ['publish', '-f', doc.fileName], {cwd: Path.join(root, "workspace")});
    // console.log(`*** stat = ${proc.status}`);
    // if (proc.stdout.length > 0) console.log(`*** stdout = ${proc.stdout}`);
    // if (proc.stderr.length > 0) console.log(`*** stderr = ${proc.stderr}`);
}