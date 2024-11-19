#! /bin/sh

VERS='0.1.1'
DATE=`date -u +%Y%m%d%H%M`
VERS_FULL="${VERS}.${DATE}"
TAG="v${VERS_FULL}"

rm -f vscode-zigem*.vsix
rm -f vscode-zigem.zip

npx vsce package --pre-release
mv vscode-zigem-${VERS}.vsix vscode-zigem-${VERS_FULL}.vsix
zip vscode-zigem.zip vscode-zigem-${VERS_FULL}.vsix

gh repo set-default https://github.com/em-foundation/vscode-zigem.git

gh release create $TAG --title $TAG --notes-file CHANGELOG.md --prerelease
gh release upload $TAG vscode-zigem.zip
