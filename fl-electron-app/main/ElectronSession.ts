import { Session, session, net } from 'electron'
import { existsSync, statSync } from 'fs'
import { createReadStream } from 'fs-extra'
import { join } from 'path'
import { Readable } from 'stream'
import { pathToFileURL } from 'url'
import ElectronLauncherApp from './ElectronLauncherApp'
import { HAS_DEV_SERVER, HOST } from './constant'

export class ElectronSession {
  private cached: Record<string, Session> = {}
  private proxy: string = ''

  constructor(private app: ElectronLauncherApp) { }

  #resolve(url: string): Session {
    const parsed = new URL(url)
    if (parsed.hostname === HOST) {
      if (existsSync(join(this.app.appDataPath, 'Partitions', 'main'))) {
        return session.fromPartition('persist:main')
      } else {
        return session.defaultSession
      }
    }
    return session.fromPartition(`persist:${parsed.hostname}`)
  }

  setProxy(proxy: string) {
    this.proxy = proxy

    for (const [, sess] of Object.entries(this.cached)) {
      sess.setProxy(proxy ? { proxyRules: proxy } : { mode: 'system' })
    }
  }

  getSession(url: string) {
    if (this.cached[url]) {
      return this.cached[url]
    }

    const ua = this.app.userAgent
    const sess = this.#resolve(url)

    sess.setUserAgent(ua)
    sess.setProxy(this.proxy ? { proxyRules: this.proxy } : { mode: 'system' })

    if (sess !== session.defaultSession) {
      for (const e of session.defaultSession.extensions.getAllExtensions()) {
        sess.extensions.loadExtension(e.path)
      }
    }

    const handler = async (request: Request): Promise<Response> => {
      const url = new URL(request.url)
      if (url.host === HOST && !HAS_DEV_SERVER) {
        let realPath = join(__dirname, 'renderer', url.pathname)
        if (realPath.includes('app.asar')) {
          const unpacked = realPath.replace('app.asar', 'app.asar.unpacked')
          if (existsSync(unpacked)) {
            realPath = unpacked
          }
        }
        if (!existsSync(realPath) && (url.pathname.includes('bg1') || url.pathname.endsWith('.mp4'))) {
          const resourcePath = join(process.resourcesPath, 'bg1.mp4')
          if (existsSync(resourcePath)) {
            realPath = resourcePath
          }
        }
        if (!existsSync(realPath)) {
          return new Response('Not Found', { status: 404 })
        }
        const stat = statSync(realPath)
        const mimeType =
          url.pathname.endsWith('.js')
            ? 'text/javascript'
            : url.pathname.endsWith('.css')
              ? 'text/css'
              : url.pathname.endsWith('.html')
                ? 'text/html'
                : url.pathname.endsWith('.json')
                  ? 'application/json'
                  : url.pathname.endsWith('.png')
                    ? 'image/png'
                    : url.pathname.endsWith('.svg')
                      ? 'image/svg+xml'
                      : url.pathname.endsWith('.ico')
                        ? 'image/x-icon'
                        : url.pathname.endsWith('.woff')
                          ? 'font/woff'
                          : url.pathname.endsWith('.woff2')
                            ? 'font/woff2'
                            : url.pathname.endsWith('.ttf')
                              ? 'font/ttf'
                              : url.pathname.endsWith('.mp4')
                                ? 'video/mp4'
                                : url.pathname.endsWith('.webm')
                                  ? 'video/webm'
                                  : url.pathname.endsWith('.webp') ? 'image/webp' : ''

        const range = request.headers.get('range')
        if (range && (mimeType.startsWith('video/') || mimeType.startsWith('audio/'))) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1
          const chunksize = (end - start) + 1
          const stream = createReadStream(realPath, { start, end })
          return new Response(Readable.toWeb(stream) as any, {
            status: 206,
            headers: {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize.toString(),
              'Content-Type': mimeType,
            },
          })
        }

        return new Response(Readable.toWeb(createReadStream(realPath)) as any, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': stat.size.toString(),
            'Accept-Ranges': 'bytes',
          },
        })
      }
      request.headers.append('User-Agent', ua)

      const headers = {} as Record<string, string>
      request.headers.forEach((value, key) => {
        headers[key] = value
      })

      const adaptRequestBody = () => {
        if (!request.body) return undefined
        const readable = Readable.fromWeb(request.body as any)
        readable.on('error', (err: any) => {
          if (err && (err.code === 'ERR_INVALID_STATE' || err.message === 'Invalid state: Controller is already closed')) {
            return
          }
          readable.destroy(err)
        })
        return readable
      }

      const response = await this.app.protocol.handle({
        url: new URL(url),
        method: request.method,
        headers: headers,
        body: adaptRequestBody() as any,
        signal: request.signal,
        cache: request.cache,
      })

      response.headers['access-control-allow-origin'] = ['*']

      return new Response(response.body instanceof Readable ? Readable.toWeb(response.body) as any : response.body, {
        status: response.status,
        headers: response.headers,
      })
    }

    sess.protocol.handle('http', handler)
    sess.protocol.handle('https', handler)

    this.cached[url] = sess

    return sess
  }
}
