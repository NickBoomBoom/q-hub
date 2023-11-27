import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';
import Dialog from '../dialog';
import { getTransformByMatrix } from '../utils';

interface RECT {
  imgWidth: number;
  imgHeight: number;
  cropperWidth: number;
  cropperHeight: number;
}
@customElement({ tag: 'q-image-resize', style })
export default class ImageResize extends QuarkElement {
  @state()
  isControl = false;

  @state()
  isCropper = false;

  @property({
    type: Number,
  })
  width = 0;

  @property({
    type: Number,
  })
  height = 0;

  @property({ type: String })
  src = '';

  @property({ type: String })
  matrix = '';

  @property({ type: String })
  rect = '';

  @property({ type: Boolean })
  readOnly = false;

  elRef: Ref<HTMLElement> = createRef();
  dialogRef: Ref<Dialog> = createRef();
  imgRef: Ref<HTMLImageElement> = createRef();
  contentRef: Ref<HTMLElement> = createRef();

  // 缩放变量
  isMoving = false;
  startX = null;
  startY = null;
  startEl = null;
  curRect = {
    width: null,
    height: null,
  };

  originRect = null;

  get computedRect(): RECT {
    const [imgWidth, cropperWidth, imgHeight, cropperHeight] = (this.rect || '').split(',').map((t) => +t);
    return {
      imgWidth,
      cropperWidth,
      imgHeight,
      cropperHeight,
    };
  }

  get contentStyle() {
    const { cropperWidth, cropperHeight } = this.computedRect;
    return {
      width: cropperWidth || '100%',
      height: cropperHeight || 'auto',
    };
  }

  get imgStyle() {
    const { imgWidth, imgHeight, cropperWidth, cropperHeight } = this.computedRect;
    const { cropperWidth: originCropperWidth, cropperHeight: originCropperHeight } = this.originRect || {};
    const { translateX, translateY, skewX, skewY } = getTransformByMatrix(this.matrix || '1,0,0,1,0,0');
    // matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )

    const scaleX = cropperWidth / originCropperWidth;
    const scaleY = cropperHeight / originCropperHeight;
    return {
      width: imgWidth || '100%',
      height: imgHeight || '100%',
      margin: `-${translateY}px 0 0 -${translateX}px`,
      transform: `matrix(${scaleX}, ${skewY}, ${skewX}, ${scaleY}, 0, 0)`,
    };
  }

  get data() {
    return {
      rect: this.rect,
      src: this.src,
      readOnly: this.readOnly,
    };
  }

  listen = (e) => {
    this.isMoving = true;
    this.startEl = e.target;
    this.startX = e.clientX;
    this.startY = e.clientY;
    const { width, height } = this.getBoundingClientRect();
    this.curRect = {
      width: this.computedRect.cropperWidth || width,
      height: this.computedRect.cropperHeight || height,
    };
    if (!this.originRect) {
      this.originRect = JSON.parse(JSON.stringify(this.computedRect));
    }
    this.setCursor(window.getComputedStyle(this.startEl).cursor);
    document.addEventListener('mousemove', this.handleMouseMove, false);
    document.addEventListener('mouseup', this.handleMouseUp, false);
  };

  handleMouseMove = (e) => {
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    const type = this.startEl.getAttribute('data-type');
    let width;
    let height;
    switch (type) {
      case 'lt':
        width = this.curRect.width - deltaX;
        height = this.curRect.height - deltaY;
        break;
      case 'rt':
        width = this.curRect.width + deltaX;
        height = this.curRect.height - deltaY;
        break;
      case 'lb':
        width = this.curRect.width - deltaX;
        height = this.curRect.height + deltaY;
        break;
      case 'rb':
        width = this.curRect.width + deltaX;
        height = this.curRect.height + deltaY;
        break;
    }
    const { imgWidth, imgHeight } = this.computedRect;
    this.rect = `${imgWidth},${width},${imgHeight},${height}`;
  };

  handleMouseUp = (e) => {
    this.setCursor('');
    document.removeEventListener('mousemove', this.handleMouseMove, false);
    document.removeEventListener('mouseup', this.handleMouseUp, false);
    setTimeout(() => {
      this.isMoving = false;
    });
  };

  setCursor = (v: string) => {
    [document.body, this.startEl]
      .filter((t) => !!t)
      .forEach((el) => {
        el.style.cursor = v;
      });
  };

  handleClick = () => {
    const classList = this.elRef.current.classList;
    if (classList.contains('focus') || classList.contains('readOnly')) {
      !this.isMoving && this.dialogRef.current.open();
    } else {
      this.toggleControl();
    }
  };

  toggleControl = () => {
    if (this.isMoving || this.readOnly) {
      return;
    }
    this.isControl = !this.isControl;
    if (this.isControl) {
      window.addEventListener('click', this.handleClickByOut);
    } else {
      window.removeEventListener('click', this.handleClickByOut);
    }
  };

  handleClickByOut = (e) => {
    const isInDom = this.contains(e.target) || e.target.shadowRoot?.contains(this);
    if (!isInDom) {
      this.toggleControl();
    }
  };

  getClassName = () => {
    return `q-image-resize ${this.readOnly ? 'readOnly' : ''} ${this.isControl ? 'focus' : ''} ${this.isCropper ? 'cropper' : ''}`;
  };

  render() {
    return (
      <>
        <div ref={this.elRef} class={this.getClassName()} onClick={this.handleClick}>
          <div ref={this.contentRef} class="content" style={this.contentStyle}>
            <img ref={this.imgRef} style={this.imgStyle} src={this.src} />
          </div>
          {this.isControl && (
            <div class="anchors">
              <div class="anchor lt" data-type="lt" onMouseDown={this.listen}></div>
              <div class="anchor lb" data-type="lb" onMouseDown={this.listen}></div>
              <div class="anchor rt" data-type="rt" onMouseDown={this.listen}></div>
              <div class="anchor rb" data-type="rb" onMouseDown={this.listen}></div>
            </div>
          )}

          {this.isControl && (
            <div className="toolbar">
              <slot name="toolbar"></slot>
            </div>
          )}
        </div>

        <q-dialog ref={this.dialogRef}>
          <div class="content" style={this.contentStyle}>
            <img style={this.imgStyle} src={this.src} />
          </div>
          <div slot="footer"></div>
        </q-dialog>
      </>
    );
  }
}
