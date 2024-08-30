#! /bin/sh

npx vsce package
zip vscode-zigem.zip vscode-zigem*.vsix
