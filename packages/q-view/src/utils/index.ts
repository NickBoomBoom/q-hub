function getPathname(src: string): string {
  const res = new URL(src)
  return res.pathname
}

export function isAudio(src: string): boolean {
  const u = getPathname(src)
  const bol = /\.(mp3|wav|mpeg)$/i.test(u)
  return bol
}

export function isVideo(src: string): boolean {
  const u = getPathname(src)
  const bol = /\.(mp4|webm)$/i.test(u)
  return bol
}

export function isImg(src: string): boolean {
  const u = getPathname(src)
  const bol = /\.(gif|jpe?g|tiff|png|svg|webp)$/i.test(u)
  return bol
}
