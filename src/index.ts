import fsp from 'node:fs/promises'
import { addEventListener, createBottomBar, getConfiguration, registerCommand } from '@vscode-use/utils'
import * as vscode from 'vscode'

// todo: 在底部栏增加一个开关来控制是否要启动此插件进行自动处理
const rules = [
  [/-\[?\s*(rgba?\([^\)]*\))\s*\]?/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-\[?\s*(calc\([^\)]*\))\s*\]?/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-(\#[^\s\"]+)/g, (_: string, v: string) => `-[${v}]`],
  [/-([0-9]+((px)|(vw)|(vh)|(rem)|(em)|%))/g, (_: string, v: string) => `-[${v}]`],
  ['justify-center items-center', 'justify-center items-center'],
  ['overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-x-hidden', 'overflow-x-hidden'],
  ['overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-overflow-y-hidden', 'overflow-y-hidden'],
  ['whitespace-nowrap overflow-hidden text-eclipse', 'whitespace-nowrap overflow-hidden text-eclipse'],
]
export function activate(context: vscode.ExtensionContext) {
  const { presets = [], prefix = ['ts', 'js', 'vue', 'tsx', 'jsx', 'svelte'] } = getConfiguration('uno-magic')
  if (presets.length)
    rules.push(...presets)
  let isOpen = true
  // 如果在class或者className中才处理成-[]
  const statusBarItem = createBottomBar({
    text: 'uno-magic off 😞',
    command: {
      title: 'uno-magic',
      command: 'unomagic.changeStatus',
    },
    position: 'left',
    offset: 500,
  })
  const activeTextEditor = vscode.window.activeTextEditor?.document.uri.path

  if (activeTextEditor && prefix.includes(activeTextEditor.split('.').slice(-1)[0]))
    statusBarItem.show()

  registerCommand('unomagic.changeStatus', () => {
    isOpen = !isOpen
    statusBarItem.text = `uno-magic ${isOpen ? 'off 😞' : 'on 🤩'}`
  })

  context.subscriptions.push(addEventListener('text-save', (e) => {
    const url = vscode.window.activeTextEditor!.document.uri.path
    if (!isOpen)
      return
    // 对文档保存后的内容进行处理
    const text = e.getText()
    const newText = rules.reduce((result, cur) => {
      const [reg, callback] = cur as [string | RegExp, string ]
      return result.replace(/class(Name)?="([^"]*)"/g, (_: string, name = '', value: string) =>
      `class${name}="${value.replace(reg, callback)}"`,
      )
    }, text)
    if (newText !== text)
      fsp.writeFile(url, newText, 'utf-8')
  }))

  context.subscriptions.push(addEventListener('activeText-change', () =>
    setTimeout(() => {
      const url = vscode.window.activeTextEditor?.document.uri.path
      if (!url)
        return
      if (!prefix.includes(url.split('.').slice(-1)[0]))
        statusBarItem.hide()
      else
        statusBarItem.show()
    }),
  ))
}

export function deactivate() {

}
