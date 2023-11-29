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

@customElement({ tag: 'q-image-cropper', style })
export default class ImageCropper extends QuarkElement {
  MIN_WIDTH = 30;
  MIN_HEIGHT = 50;

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
    const [imgWidth, cropperWidth, imgHeight, cropperHeight] = (this.rect || '').split(',').map((t) => (t ? +t : 0));
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
      this.$emit('load', {
        detail: this.data,
      });
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

  emitConfirm = () => {
    this.$emit('confirm', {
      detail: this.data,
    });
  };

  emitCancel = () => {
    this.$emit('cancel', {
      detail: this.data,
    });
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

            <div class="btn">
              <div class="confirm hover-tip" onClick={this.emitConfirm}>
                <svg t="1701229812110" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="31790" width="20" height="20">
                  <path
                    d="M819.823 83.694H206.991c-67.703 0-122.588 54.885-122.588 122.588v612.833c0 67.703 54.885 122.588 122.588 122.588h612.833c67.703 0 122.588-54.885 122.588-122.588V206.282c-0.001-67.703-54.885-122.588-122.589-122.588z m-124.435 63.313v241.142H331.772V147.007h363.616z m185.787 672.274c0.027 33.765-27.323 61.158-61.088 61.185H207.133c-16.389 0-31.864-6.297-43.454-17.887s-18.039-26.91-18.039-43.298v-612.94c0.061-33.923 27.57-61.395 61.493-61.41h61.327v245.294c-0.05 33.771 27.286 61.187 61.057 61.237h367.888c33.853 0 61.299-27.387 61.299-61.237V144.931h61.206c33.872 0.036 61.301 27.524 61.265 61.396V819.281z"
                    fill=""
                    p-id="31791"
                  ></path>
                  <path
                    d="M574.817 329.936c17.483 0 31.656-14.173 31.656-31.656v-61.292c0-17.483-14.173-31.656-31.656-31.656s-31.656 14.173-31.656 31.656v61.292c0 17.483 14.173 31.656 31.656 31.656z"
                    fill=""
                    p-id="31792"
                  ></path>
                </svg>
              </div>

              <div onClick={this.emitCancel} class="cancel hover-tip">
                <svg t="1701229855353" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="32790" width="20" height="20">
                  <path
                    d="M482.7 249.9V106.1c0-37.4-45.3-56.2-71.7-29.7L140.3 347c-16.4 16.4-16.4 43 0 59.4L410.9 677c26.5 26.5 71.7 7.7 71.7-29.7v-155c96.1-0.3 271.5-10.7 271.5 227.7 0 118.1-92.8 216.8-216 239.6 198.1-24.4 326-236 326-361.9 0.1-292.6-309.4-346.3-381.4-347.8z"
                    fill=""
                    p-id="32791"
                  ></path>
                </svg>
              </div>
            </div>
            <img ref={this.previewRef} src={this.src} style={this.previewStyle} alt="" class="preview" />
          </div>
        </div>
      </>
    );
  }
}
