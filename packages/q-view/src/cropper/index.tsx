import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';
import { getImgInfoByDom, getTransformByMatrix } from '../utils';

interface CROPPER_RECT {
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
}

interface RECT {
  imgWidth: number;
  imgHeight: number;
  cropperWidth: number;
  cropperHeight: number;
}

@customElement({ tag: 'q-cropper', style })
export default class Cropper extends QuarkElement {
  MIN_WIDTH = 30;
  MIN_HEIGHT = 30;

  @property({ type: String })
  src = null;

  @property({ type: String })
  rect = ''; // 原图宽,裁切宽,原图高,裁切高

  // scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY()  translateX 和 translateY 改为百分比
  @property({
    type: String,
  })
  matrix = '';

  contentRef: Ref<HTMLElement> = createRef();
  previewRef: Ref<HTMLImageElement> = createRef();
  cropperRef: Ref<HTMLElement> = createRef();
  cropperEl: HTMLElement = null;
  isCutting = false;

  startX = null;
  startY = null;

  // 开始时保存最初始的值
  curRect: CROPPER_RECT = {
    width: null,
    height: null,
    scaleX: null,
    scaleY: null,
    skewX: null,
    skewY: null,
    translateX: null,
    translateY: null,
  };

  get data() {
    return {
      rect: this.rect,
      matrix: this.matrix,
      src: this.src,
    };
  }
  get cropperMatrix() {
    return getTransformByMatrix(this.matrix);
  }

  get contentStyle() {
    return {
      width: this.computedRect?.imgWidth ?? 'auto',
      height: this.computedRect?.imgHeight ?? 'auto',
    };
  }

  get computedRect(): RECT {
    const [imgWidth, cropperWidth, imgHeight, cropperHeight] = (this.rect || '').split(',').map((t) => +t);
    return {
      imgWidth,
      cropperWidth,
      imgHeight,
      cropperHeight,
    };
  }

  get cropperStyle() {
    const { cropperHeight, cropperWidth } = this.computedRect;
    return {
      width: cropperWidth,
      height: cropperHeight,
      transform: `matrix(${this.matrix})`,
    };
  }

  get previewStyle() {
    const { translateX, translateY, scaleX, scaleY, skewX, skewY } = this.cropperMatrix;
    // matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
    return {
      ...this.contentStyle,
      margin: `-${translateY}px 0 0 -${translateX}px`,
      transform: `matrix(${scaleX}, ${skewY}, ${skewX}, ${scaleY}, 0, 0)`,
    };
  }
  componentDidMount() {
    this.init();
  }

  init = async () => {
    try {
      const info = await getImgInfoByDom(this.src, this);
      const { cropperWidth, cropperHeight } = this.computedRect;
      this.rect = `${info.width},${cropperWidth || info.width * 0.6},${info.height},${cropperHeight || info.height * 0.4}`;
      this.initMatrix();
    } catch (error) {
      console.error(error);
    }
  };

  initMatrix = () => {
    if (!this.matrix) {
      const { imgWidth, imgHeight, cropperHeight, cropperWidth } = this.computedRect;
      const x = (imgWidth - cropperWidth) / 2;
      const y = (imgHeight - cropperHeight) / 2;
      this.matrix = `1,0,0,1,${x},${y}`;
    }
  };

  listen = (e) => {
    if (this.isCutting) {
      return;
    }
    this.isCutting = true;
    this.cropperEl = e.target;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.curRect = {
      width: this.computedRect.cropperWidth,
      height: this.computedRect.cropperHeight,
      ...this.cropperMatrix,
    };
    this.setCursor(window.getComputedStyle(this.cropperEl).cursor);
    document.addEventListener('mousemove', this.handleCropperMouseMove, false);
    document.addEventListener('mouseup', this.handleCropperMouseUp, false);
  };

  setCursor = (v: string) => {
    [document.body, this.cropperEl]
      .filter((t) => !!t)
      .forEach((el) => {
        el.style.cursor = v;
      });
  };

  handleCropperMouseMove = (e) => {
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    const type = this.cropperEl.getAttribute('data-type');

    switch (type) {
      case 'move':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const newX = translateX + deltaX;
          const newY = translateY + deltaY;
          const res = this.check(newX, newY, width, height);
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${res.x},${res.y}`;
        }
        break;
      case 'lt':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const w = width - deltaX;
          const h = height - deltaY;
          const newX = translateX + deltaX;
          const newY = translateY + deltaY;
          const res = this.check(newX, newY, w, h);
          const { imgWidth, imgHeight } = this.computedRect;
          this.rect = `${imgWidth},${res.w},${imgHeight},${res.h}`;

          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${res.x},${res.y}`;
        }
        break;
      case 'lb':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const { imgWidth, imgHeight } = this.computedRect;
          const w = width - deltaX;
          const h = height + deltaY;
          const newX = translateX + deltaX;
          const res = this.check(newX, translateY, w, h);
          this.rect = `${imgWidth},${res.w},${imgHeight},${res.h}`;
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${res.x},${res.y}`;
        }
        break;
      case 'ct':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const h = height - deltaY;
          const newY = translateY + deltaY;
          const { imgWidth, imgHeight, cropperWidth } = this.computedRect;
          const res = this.check(translateX, newY, cropperWidth, h);
          this.rect = `${imgWidth},${cropperWidth},${imgHeight},${res.h}`;
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${translateX},${res.y}`;
        }
        break;

      case 'cb':
        {
          const { translateX, translateY, height } = this.curRect;
          const h = height + deltaY;
          const { imgWidth, imgHeight, cropperWidth } = this.computedRect;
          const res = this.check(translateX, translateY, cropperWidth, h);
          this.rect = `${imgWidth},${cropperWidth},${imgHeight},${res.h}`;
        }
        break;

      case 'rt':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const w = width + deltaX;
          const h = height - deltaY;
          const newY = translateY + deltaY;
          const res = this.check(translateX, newY, w, h);
          const { imgWidth, imgHeight } = this.computedRect;
          this.rect = `${imgWidth},${res.w},${imgHeight},${res.h}`;
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${translateX},${res.y}`;
        }
        break;
      case 'rb':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const w = width + deltaX;
          const h = height + deltaY;
          const res = this.check(translateX, translateY, w, h);
          const { imgWidth, imgHeight } = this.computedRect;
          this.rect = `${imgWidth},${res.w},${imgHeight},${res.h}`;
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${res.x},${res.y}`;
        }
        break;
    }
  };

  handleCropperMouseUp = (e) => {
    this.setCursor('');
    document.removeEventListener('mousemove', this.handleCropperMouseMove, false);
    document.removeEventListener('mouseup', this.handleCropperMouseUp, false);
    setTimeout(() => {
      this.isCutting = false;
    });
  };

  // 需要进行边界判断
  check = (
    x: number,
    y: number,
    w: number,
    h: number
  ): {
    x: number;
    y: number;
    w: number;
    h: number;
  } => {
    const { imgWidth, imgHeight } = this.computedRect;
    const res = {
      x,
      y,
      w,
      h,
    };

    if (w < this.MIN_WIDTH) {
      res.w = this.MIN_WIDTH;
      w = this.MIN_WIDTH;
    } else if (w > imgWidth) {
      res.w = imgWidth;
      w = imgWidth;
    }
    if (h < this.MIN_HEIGHT) {
      res.h = this.MIN_HEIGHT;
      h = this.MIN_HEIGHT;
    } else if (h > imgHeight) {
      res.h = imgHeight;
      h = imgHeight;
    }

    if (x < 0) {
      res.x = 0;
    } else if (x + w > imgWidth) {
      res.x = imgWidth - w;
    }

    if (y < 0) {
      res.y = 0;
    } else if (y + h > imgHeight) {
      res.y = imgHeight - h;
    }
    return res;
  };

  render() {
    return (
      <>
        <div ref={this.contentRef} class="content" style={this.contentStyle}>
          <img src={this.src} class="bg" alt="" />
          <div class="croppers" data-type="move" style={this.cropperStyle} ref={this.cropperRef} onMouseDown={this.listen}>
            <div class="cropper lt" data-type="lt" onMouseDown={this.listen}></div>
            <div class="cropper ct" data-type="ct" onMouseDown={this.listen}></div>
            <div class="cropper rt" data-type="rt" onMouseDown={this.listen}></div>

            <div class="cropper lb" data-type="lb" onMouseDown={this.listen}></div>
            <div class="cropper cb" data-type="cb" onMouseDown={this.listen}></div>
            <div class="cropper rb" data-type="rb" onMouseDown={this.listen}></div>

            <img ref={this.previewRef} src={this.src} style={this.previewStyle} alt="" class="preview" />
          </div>
        </div>
      </>
    );
  }
}
