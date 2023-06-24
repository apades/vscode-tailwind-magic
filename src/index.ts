import fs from 'node:fs'
import { addEventListener, createBottomBar, createCompletionItem, getConfiguration, registerCommand, registerCompletionItemProvider } from '@vscode-use/utils'
import * as vscode from 'vscode'
import { rules, transform } from './transform'

const commonMap = [
  'flex-center',
  'pointer',
  'pointer-none',
  'dashed',
  'dotted',
  'double',
  'col',
  'row',
  'contain',
  'cover',
  'justify-center',
  'align-center',
  'eclipse',
]

export function activate(context: vscode.ExtensionContext) {
  // 只针对当前根目录下有tailwind.config.js | tailwind.config.ts才生效
  const { presets = [], prefix = ['ts', 'js', 'vue', 'tsx', 'jsx', 'svelte'] } = getConfiguration('tailwind-magic')
  let isTailwind = false
  const currentFolder = (vscode.workspace.workspaceFolders as any)?.[0]
  if (currentFolder)
    updateTailwindStatus()
  if (presets.length)
    rules.unshift(...presets)
  let isOpen = true
  // 如果在class或者className中才处理成-[]
  const statusBarItem = createBottomBar({
    text: 'tailwind-magic off 😞',
    command: {
      title: 'tailwind-magic',
      command: 'tailwindmagic.changeStatus',
    },
    position: 'left',
    offset: 500,
  })
  const activeTextEditorUri = vscode.window.activeTextEditor?.document?.uri?.path

  if (activeTextEditorUri && prefix.includes(activeTextEditorUri.split('.').slice(-1)[0]))
    statusBarItem.show()

  registerCommand('tailwindmagic.changeStatus', () => {
    isOpen = !isOpen
    statusBarItem.text = `tailwind-magic ${isOpen ? 'off 😞' : 'on 🤩'}`
  })

  context.subscriptions.push(addEventListener('text-save', (e) => {
    const url = vscode.window.activeTextEditor!.document.uri.fsPath
    const activeTextEditor = vscode.window.activeTextEditor
    if (!isOpen || !isTailwind || !activeTextEditor)
      return
    const beforeActivePosition = activeTextEditor.selection.active
    // 对文档保存后的内容进行处理
    const text = e.getText()

    const newText = transform(text)
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
    const rootPath = currentFolder.uri.fsPath.replace(/\\/g, '/')
    isTailwind = fs.existsSync(`${rootPath}/tailwind.config.js`) || fs.existsSync(`${rootPath}/tailwind.config.ts`)
  }
  // 如果是tailwind环境下,给出一些预设提醒
  context.subscriptions.push(registerCompletionItemProvider(['javascript', 'javascriptreact', 'typescriptreact', 'html', 'vue', 'css'], () => {
    if (!isTailwind)
      return []
    return commonMap.map(common => createCompletionItem(common))
  }, ['"', '\'', ' ', '.']))
}

export function deactivate() {

}
