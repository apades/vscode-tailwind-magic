import fs from 'node:fs'
import { addEventListener, createBottomBar, getConfiguration, registerCommand } from '@vscode-use/utils'
import * as vscode from 'vscode'

// todo: 在底部栏增加一个开关来控制是否要启动此插件进行自动处理
const rules = [
  ['lh-', 'leading-'],
  [/-\[?\s*(rgba?\([^\)]*\))\s*\]?/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-\[?\s*(calc\([^\)]*\))\s*\]?/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-(\#[^\s\"]+)/g, (_: string, v: string) => `-[${v}]`],
  [/-([0-9]+((px)|(vw)|(vh)|(rem)|(em)|%))/g, (_: string, v: string) => `-[${v}]`],
  ['flex-center', 'justify-center items-center'],
  [/^(?:x-hidden)|([\s])x-hidden/, (_: string, v = '') => `${v}overflow-x-hidden`],
  [/^(?:y-hidden)|([\s])y-hidden/, (_: string, v = '') => `${v}overflow-y-hidden`],
  [/^(?:hidden)|([\s])hidden/, (_: string, v = '') => `${v}overflow-hidden`],
  [/^(?:eclipse)|([\s])eclipse/, (_: string, v = '') => `${v}whitespace-nowrap overflow-hidden text-eclipse`],
]
export function activate(context: vscode.ExtensionContext) {
  // 只针对当前根目录下有tailwind.config.js | tailwind.config.ts才生效
  const { presets = [], prefix = ['ts', 'js', 'vue', 'tsx', 'jsx', 'svelte'] } = getConfiguration('uno-magic')
  let isTailwind = false
  const currentFolder = (vscode.workspace.workspaceFolders as any)[0]
  if (currentFolder)
    updateTailwindStatus()

  if (presets.length)
    rules.unshift(...presets)
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
    if (!isOpen || !isTailwind)
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
      fs.promises.writeFile(url, newText, 'utf-8')
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
  if (!isTailwind) {
    context.subscriptions.push(addEventListener('file-create', () => {
      updateTailwindStatus()
    }))
  }

  function updateTailwindStatus() {
    const rootPath = currentFolder.uri.path
    isTailwind = fs.existsSync(`${rootPath}/tailwind.config.js`) || fs.existsSync(`${rootPath}/tailwind.config.ts`)
  }
}

export function deactivate() {

}
