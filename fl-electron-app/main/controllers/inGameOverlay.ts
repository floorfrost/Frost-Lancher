import { ElectronController } from '@/ElectronController'
import { app, globalShortcut, ipcMain } from 'electron'
import { ControllerPlugin } from './plugin'
import { LaunchService } from '@xmcl/runtime/launch'
import { focusGameWindow } from '@/utils/focusGameWindow'

export const inGameOverlayPlugin: ControllerPlugin = function (this: ElectronController) {
  let isOverlayActive = false
  let launchService: LaunchService | undefined

  this.app.waitEngineReady().then(() => {
    this.app.registry.get(LaunchService).then((service) => {
      launchService = service
    }).catch((err) => {
      this.logger.warn('Failed to get LaunchService for inGameOverlayPlugin: %o', err)
    })
  })

  const getRunningMinecraftPids = (): number[] => {
    if (!launchService) return []
    return launchService.getProcesses()
  }

  const registerShortcut = () => {
    try {
      // Unregister first if already registered
      globalShortcut.unregister('CommandOrControl+F')

      const success = globalShortcut.register('CommandOrControl+F', async () => {
        const window = this.mainWin
        if (!window || window.isDestroyed()) return

        const runningPids = getRunningMinecraftPids()
        // If Minecraft is NOT running, do NOT trigger in-game overlay!
        if (runningPids.length === 0) {
          return
        }

        // If launcher is already visible, focused, and on top, toggle hide to return to game
        if (window.isVisible() && window.isFocused() && isOverlayActive) {
          isOverlayActive = false
          window.setAlwaysOnTop(false)
          const pid = runningPids[runningPids.length - 1]
          if (pid) {
            await focusGameWindow(pid)
          }
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

  ipcMain.handle('in-game-overlay-close', async () => {
    const window = this.mainWin
    if (window && !window.isDestroyed()) {
      isOverlayActive = false
      window.setAlwaysOnTop(false)

      const runningPids = getRunningMinecraftPids()
      if (runningPids.length > 0) {
        // Minecraft is running: refocus Minecraft and hide overlay window
        const pid = runningPids[runningPids.length - 1]
        if (pid) {
          await focusGameWindow(pid)
        }
        window.hide()
      }
      // If Minecraft is not running, do not hide the window, keeping launcher open
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
