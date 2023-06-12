import fsp from 'node:fs/promises'
import { addEventListener, createBottomBar, registerCommand } from '@vscode-use/utils'
import * as vscode from 'vscode'

// todo: 在底部栏增加一个开关来控制是否要启动此插件进行自动处理
const rules = [
  [/-\[\s*(rgb[a]\([^\)]*\))\s*\]/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-\[\s*(calc\([^\)]*\))\s*\]/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-(\#[^\s\"]+)/g, (_: string, v: string) => `-[${v}]`],
  [/-([0-9]+((px)|(vw)|(vh)|(rem)|(em)|%))/g, (_: string, v: string) => `-[${v}]`],
  ['flex-center', 'justify-center items-center'],
  ['x-hidden', 'overflow-x-hidden'],
  ['y-hidden', 'overflow-y-hidden'],
  ['text-hidden', 'whitespace-nowrap overflow-hidden text-eclipse'],
]
export function activate(context: vscode.ExtensionContext) {
  let isOpen = true
  context.subscriptions.push(addEventListener('text-save', (e) => {
    if (!isOpen)
      return
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
  const statusBarItem = createBottomBar({
    text: 'uno-magic off 😞',
    command: {
      title: 'uno-magic',
      command: 'extension.changeStatus',
    },
    position: 'left',
    offset: 500,
  })
  statusBarItem.show()
  registerCommand('extension.changeStatus', () => {
    isOpen = !isOpen
    statusBarItem.text = `uno-magic ${isOpen ? 'off 😞' : 'on 🤩'}`
  })
}

export function deactivate() {

}
