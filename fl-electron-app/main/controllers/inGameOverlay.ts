import { ElectronController } from '@/ElectronController'
import { app, globalShortcut, ipcMain } from 'electron'
import { ControllerPlugin } from './plugin'

export const inGameOverlayPlugin: ControllerPlugin = function (this: ElectronController) {
  let isOverlayActive = false

  const registerShortcut = () => {
    try {
      // Unregister first if already registered
      globalShortcut.unregister('CommandOrControl+F')

      const success = globalShortcut.register('CommandOrControl+F', () => {
        const window = this.mainWin
        if (!window || window.isDestroyed()) return

        // If launcher is already visible, focused, and on top, toggle hide to return to game
        if (window.isVisible() && window.isFocused() && isOverlayActive) {
          isOverlayActive = false
          window.setAlwaysOnTop(false)
          window.hide()
          return
        }

        // Bring launcher smoothly to front on top of Minecraft!
        isOverlayActive = true
        if (window.isMinimized()) {
          window.restore()
        }
        window.setAlwaysOnTop(true, 'screen-saver')
        window.show()
        window.focus()

        // Notify the UI to enter in-game overlay mode
        try {
          window.webContents.send('in-game-overlay-open', { defaultTab: 'resourcepacks' })
        } catch {
          // ignore mid-send
        }
      })

      if (success) {
        this.logger.log('In-Game Overlay global shortcut registered: CommandOrControl+F')
      } else {
        this.logger.warn('Failed to register global shortcut CommandOrControl+F')
      }
    } catch (err) {
      this.logger.warn('Error while registering in-game overlay shortcut: %o', err)
    }
  }

  app.whenReady().then(() => {
    registerShortcut()
  })

  app.on('will-quit', () => {
    try {
      globalShortcut.unregister('CommandOrControl+F')
    } catch {
      // ignore
    }
  })

  ipcMain.handle('in-game-overlay-close', () => {
    const window = this.mainWin
    if (window && !window.isDestroyed()) {
      isOverlayActive = false
      window.setAlwaysOnTop(false)
      window.hide()
    }
    return true
  })

  ipcMain.handle('set-always-on-top', (_, flag: boolean) => {
    const window = this.mainWin
    if (window && !window.isDestroyed()) {
      isOverlayActive = flag
      window.setAlwaysOnTop(flag, flag ? 'screen-saver' : undefined)
    }
    return true
  })
}
