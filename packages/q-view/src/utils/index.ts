function getPathname(src: string): string {
  const res = new URL(src);
  return res.pathname;
}

export function isAudio(src: string): boolean {
  const u = getPathname(src);
  const bol = /\.(mp3|wav|mpeg)$/i.test(u);
  return bol;
}

export function isVideo(src: string): boolean {
  const u = getPathname(src);
  const bol = /\.(mp4|webm)$/i.test(u);
  return bol;
}

export function isImg(src: string): boolean {
  const u = getPathname(src);
  const bol = /\.(gif|jpe?g|tiff|png|svg|webp)$/i.test(u);
  return bol;
}

export function getStyleByObject(obj: object): string {
  let res = '';
  for (const key in obj) {
    res += `${key}=${obj[key]};`;
  }
  return res;
}

export function getImgInfoByDom(
  src: string,
  el: HTMLElement
): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const { width } = el.getBoundingClientRect();
    const img = new Image();
    img.src = src;
    img.width = width;
    img.onload = (e: any) => {
      resolve({
        width: e.target.width,
        height: e.target.height,
      });
      img.remove();
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.style.cssText = `
      position:fixed; 
      top: -10000000px;
    `;
    document.body.appendChild(img);
  });
}

export function getTransformByMatrix(str: string): {
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
} {
  // matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
  let scaleX = 0;
  let scaleY = 0;
  let skewX = 0;
  let skewY = 0;
  let translateX = 0;
  let translateY = 0;
  if (str && str !== 'none') {
    [scaleX, skewY, skewX, scaleY, translateX, translateY] = str.split(',').map((t) => {
      return +t.trim();
    });
  }
  return {
    scaleX,
    scaleY,
    skewX,
    skewY,
    translateX,
    translateY,
  };
}

export function computeDistancePoint(x1: number, y1: number, x2: number, y2: number): number {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;

  // 计算欧几里得距离
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  return distance;
}
