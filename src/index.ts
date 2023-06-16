import fs from 'node:fs'
import { addEventListener, createBottomBar, getConfiguration, registerCommand } from '@vscode-use/utils'
import * as vscode from 'vscode'
import {resolve} from 'path'

const fontMap: any = {
  100: 'thin',
  200: 'extralight',
  300: 'light',
  400: 'normal',
  500: 'medium',
  600: 'semibold',
  700: 'bold',
  800: 'extrabold',
  900: 'black',
}

const customMap: any = {
  'b': 'border',
  'bb': 'border-b',
  'border-rd': 'rounded',
  'lh': 'leading',
}

const rules = [
  [/\s(w|h|gap|m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl|b|bt|br|bb|bl|lh|top|right|bottom|left|border-rd)-?([0-9]+)(px|rem|em|\%|vw|vh||$)/g, (_: string, v: string, v1 = '', v2 = '') => {
    if (v in customMap)
      v = customMap[v]

    return v2.trim() === ''
      ? ` ${v}-${v1}${v2}`
      : ` ${v}-[${v1}${v2}]`
  }],
  [/^(?:border-box)|([\s])border-box/, (_: string, v = '') => `${v}box-border`],
  [/^(?:content-box)|([\s])content-box/, (_: string, v = '') => `${v}box-content`],
  [/-\[?\s*(rgba?\([^\)]*\))\s*\]?/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-\[?\s*(calc\([^\)]*\))\s*\]?/g, (_: string, v: string) => `-[${v.replace(/\s*/g, '')}]`],
  [/-(\#[^\s\"]+)/g, (_: string, v: string) => `-[${v}]`],
  [/-([0-9]+(?:px)|(?:vw)|(?:vh)|(?:rem)|(?:em)|(?:%))([\s"])/g, (_: string, v: string, v1 = '') => `-[${v}]${v1}`],
  [/^(?:x-hidden)|([\s])x-hidden/, (_: string, v = '') => `${v}overflow-x-hidden`],
  [/^(?:y-hidden)|([\s])y-hidden/, (_: string, v = '') => `${v}overflow-y-hidden`],
  [/^(?:justify-center)|([\s])justify-center/, (_: string, v = '') => `${v}justify-center`],
  [/^(?:align-center)|([\s])align-center/, (_: string, v = '') => `${v}items-center`],
  [/^(?:hidden)|([\s])hidden/, (_: string, v = '') => `${v}overflow-hidden`],
  [/^(?:eclipse)|([\s])eclipse/, (_: string, v = '') => `${v}whitespace-nowrap overflow-hidden text-ellipsis`],
  [/(["\s])font-?(100|200|300|400|500|600|700|800|900)/, (_: string, prefix: string, v: string) => ` ${prefix}font-${fontMap[v]}`],
  [/^(?:pointer-none)|([\s])pointer-none/, (_: string, v = '') => `${v}pointer-events-none`],
  [/^(?:pointer)|([\s])pointer/, (_: string, v = '') => `${v}cursor-pointer`],
  [/^(?:flex-center)|([\s])flex-center/, (_: string, v = '') => `${v}justify-center items-center`],
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
  const activeTextEditorUri = vscode.window.activeTextEditor?.document?.uri?.path

  if (activeTextEditorUri && prefix.includes(activeTextEditorUri.split('.').slice(-1)[0]))
    statusBarItem.show()

  registerCommand('unomagic.changeStatus', () => {
    isOpen = !isOpen
    statusBarItem.text = `uno-magic ${isOpen ? 'off 😞' : 'on 🤩'}`
  })

  context.subscriptions.push(addEventListener('text-save', (e) => {
    const url = vscode.window.activeTextEditor!.document.uri.fsPath
    const activeTextEditor = vscode.window.activeTextEditor
    if (!isOpen || !isTailwind || !activeTextEditor)
      return
    const beforeActivePosition = activeTextEditor.selection.active
    // 对文档保存后的内容进行处理
    const text = e.getText()

    const newText = rules.reduce((result, cur) => {
      const [reg, callback] = cur as [string | RegExp, string ]
      return result.replace(/class(Name)?="([^"]*)"/g, (_: string, name = '', value: string) => {
        const v = ` ${value}`
        const newClass = v.replace(reg, callback).slice(1)
        return `class${name}="${newClass}"`
      },
      )
    }, text)
    if (newText === text)
      return
    // activeTextEditor.selection = new vscode.Selection(beforeActivePosition, beforeActivePosition)
    fs.promises.writeFile(url, newText, 'utf-8').then(() => {
      const lineText = activeTextEditor.document.lineAt(beforeActivePosition.line).text
      const classMatch = lineText.match(/((class)|(className))="[^"]*"/)
      if (!classMatch)
        return

      const index = classMatch.index ?? 0
      const offset = classMatch[0].length + index
      const newCursorPosition = new vscode.Position(
        beforeActivePosition.line,
        offset,
      )
      setTimeout(() => {
        activeTextEditor.selection = new vscode.Selection(newCursorPosition, newCursorPosition)
      }, 100)
    })
  }))

  context.subscriptions.push(addEventListener('activeText-change', () =>
    setTimeout(() => {
      const url = vscode.window.activeTextEditor?.document.uri.fsPath
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
    const rootPath = currentFolder.uri.fsPath
    isTailwind = fs.existsSync(resolve(rootPath,'./tailwind.config.js')) || fs.existsSync(resolve(rootPath,'./tailwind.config.ts'))
  }
}

export function deactivate() {

}
