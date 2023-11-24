import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';
import { getImgInfoByDom, getTransformByMatrix } from '../utils';

const DEFAULT_MATRIX = '1,0,0,1,0,1';
@customElement({ tag: 'q-cropper', style })
export default class AttrTable extends QuarkElement {
  @property({ type: String })
  src = null;

  @property({ type: Number })
  width = 0;

  @property({ type: Number })
  height = 0;

  @property({ type: Number })
  x = 0;

  @property({ type: Number })
  y = 0;

  @property({
    type: String,
  })
  matrix = DEFAULT_MATRIX;

  MIN_WIDTH = 30;
  MIN_HEIGHT = 30;

  @state()
  contentRect: {
    width: number;
    height: number;
  } | null = null;
  contentRef: Ref<HTMLElement> = createRef();
  previewRef: Ref<HTMLImageElement> = createRef();
  cropperRef: Ref<HTMLElement> = createRef();
  isCutting = false;
  cropperEl = null;

  startX = null;
  startY = null;

  // 开始时保存最初始的值
  curRect: {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
    translateX: number;
    translateY: number;
  } = {
    width: null,
    height: null,
    scaleX: null,
    scaleY: null,
    skewX: null,
    skewY: null,
    translateX: null,
    translateY: null,
  };

  get cropperMatrix() {
    return getTransformByMatrix(this.matrix);
  }
  get contentStyle() {
    return {
      width: this.contentRect?.width ?? 'auto',
      height: this.contentRect?.height ?? 'auto',
    };
  }

  get cropperStyle() {
    return {
      width: this.width,
      height: this.height,
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
      this.contentRect = info;
      this.width = this.width || info.width * 0.6;
      this.height = this.height || info.height * 0.4;
    } catch (error) {
      console.error(error);
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
      width: this.width,
      height: this.height,
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
          const newX = ~~(translateX + deltaX);
          const newY = ~~(translateY + deltaY);
          const res = this.check(newX, newY, width, height);
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${res.x},${res.y}`;
        }
        break;
      case 'lt':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const w = ~~(width - deltaX);
          const h = ~~(height - deltaY);
          const newX = ~~(translateX + deltaX);
          const newY = ~~(translateY + deltaY);
          const res = this.check(newX, newY, w, h);
          this.width = res.w;
          this.height = res.h;
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${res.x},${res.y}`;
        }
        break;

      case 'ct':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const h = ~~(height - deltaY);
          const newY = ~~(translateY + deltaY);
          const res = this.check(translateX, newY, this.width, h);
          this.height = res.h;
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${translateX},${res.y}`;
        }
        break;

      case 'rt':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const w = ~~(width + deltaX);
          const h = ~~(height - deltaY);
          const newX = ~~-(translateX - deltaX);
          const newY = ~~(translateY + deltaY);
          const res = this.check(newX, newY, w, h);
          this.width = res.w;
          this.height = res.h;
          this.matrix = `${scaleX},${skewX},${skewY},${scaleY},${res.x},${res.y}`;
        }
        break;

      case 'lb':
        break;

      case 'cb':
        {
          const { translateX, translateY, width, height, scaleX, scaleY, skewX, skewY } = this.curRect;
          const h = ~~(height + deltaY);
          const res = this.check(translateX, translateY, this.width, h);
          this.height = res.h;
        }
        break;

      case 'rb':
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
    alert(111);
  };

  setCropper = () => {
    const s = window.getComputedStyle(this.cropperRef.current);
    const x = this.cropperRef.current.offsetLeft;
    const y = this.cropperRef.current.offsetTop;
    const width = parseFloat(s.width);
    const height = parseFloat(s.height);
    const box = this.getBoundingClientRect();
    console.log(333, x, y, width, height, box);
    this.contentRef.current.style.cssText = `
      width: ${width}px;
      height: ${height}px;
    `;
    this.imgRef.current.style.cssText = `
      transform-origin: left top;
      transform: scale(${box.width / width} ) translate(-${x}px,-${y}px);
    `;
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
    const { width, height } = this.contentRect;
    const res = {
      x,
      y,
      w,
      h,
    };

    if (w < this.MIN_WIDTH) {
      res.w = this.MIN_WIDTH;
      w = this.MIN_WIDTH;
    } else if (w > width) {
      res.w = width;
      w = width;
    }
    if (h < this.MIN_HEIGHT) {
      res.h = this.MIN_HEIGHT;
      h = this.MIN_HEIGHT;
    } else if (h > height) {
      res.h = height;
      h = height;
    }

    if (x < 0) {
      res.x = 0;
    } else if (x + w > width) {
      res.x = width - w;
    }

    if (y < 0) {
      res.y = 0;
    } else if (y + h > height) {
      res.y = height - h;
    }
    return res;
  };

  render() {
    return (
      <>
        <div ref={this.contentRef} class="content" style={this.contentStyle}>
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
