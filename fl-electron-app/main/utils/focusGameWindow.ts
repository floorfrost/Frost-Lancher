import { execFile } from 'child_process'

export async function focusGameWindow(pid: number): Promise<void> {
  if (process.platform === 'win32') {
    try {
      const { focusWindowsWindow } = await import('./gameWindow/windows')
      focusWindowsWindow(pid)
    } catch {
      // ignore native error
    }

    // Supplementary WScript.Shell activation for reliable foreground switch
    try {
      await new Promise<void>((resolve) => {
        execFile(
          'powershell.exe',
          [
            '-NoProfile',
            '-NonInteractive',
            '-WindowStyle',
            'Hidden',
            '-Command',
            `(New-Object -ComObject WScript.Shell).AppActivate(${pid})`,
          ],
          () => resolve(),
        )
      })
    } catch {
      // ignore
    }
  } else if (process.platform === 'darwin') {
    try {
      execFile(
        'osascript',
        ['-e', `tell application "System Events" to set frontmost of (first process whose unix id is ${pid}) to true`],
        () => {},
      )
    } catch {
      // ignore
    }
  } else if (process.platform === 'linux') {
    try {
      execFile('wmctrl', ['-i', '-a', `${pid}`], () => {})
    } catch {
      // ignore
    }
  }
}
