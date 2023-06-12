import fsp from 'node:fs/promises'
import { addEventListener } from '@vscode-use/utils'
import * as vscode from 'vscode'

const rules = [
  [/-\[\s*(rgb[a]\([^\)]*\))\s*\]/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-\[\s*(calc\([^\)]*\))\s*\]/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
]
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(addEventListener('text-save', (e) => {
    const url = vscode.window.activeTextEditor!.document.uri.path
    // 对文档保存后的内容进行处理
    const text = e.getText()
    const newText = rules.reduce((result, cur) => {
      const [reg, callback] = cur
      return result.replace(reg, callback)
    }, text)
    if (newText !== text)
      fsp.writeFile(url, newText, 'utf-8')
  }))
}

export function deactivate() {

}
