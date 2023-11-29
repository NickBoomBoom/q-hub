import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';
import Dialog from '../dialog';
import { getTransformByMatrix, computeDistancePoint } from '../utils';

interface RECT {
  imgWidth: number;
  imgHeight: number;
  cropperWidth: number;
  cropperHeight: number;
}
@customElement({ tag: 'q-image-resize', style })
export default class ImageResize extends QuarkElement {
  @property({ type: String })
  src = '';

  @property({ type: Number })
  width = 0;

  @property({ type: Number })
  height = 0;

  // q-image-cropper 裁剪数据
  @property({ type: String })
  matrix = '';

  @property({ type: String })
  rect = '';

  @property({ type: Boolean })
  readOnly = false;

  @state()
  isControl = false;

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
    const [imgWidth, cropperWidth, imgHeight, cropperHeight] = (this.rect || '').split(',').map((t) => (t ? +t : 0));
    return {
      imgWidth,
      cropperWidth,
      imgHeight,
      cropperHeight,
    };
  }

  get parentStyle(): {
    width: number;
    height: number;
  } {
    const { width, height } = this.getBoundingClientRect();
    return {
      width,
      height,
    };
  }

  get contentStyle() {
    return {
      width: this.width || '100%',
      height: this.height || 'auto',
    };
  }

  get imgStyle() {
    const { imgWidth, imgHeight } = this.computedRect;
    const { cropperWidth: originCropperWidth, cropperHeight: originCropperHeight } = this.originRect || {};
    const { translateX, translateY, skewX, skewY } = getTransformByMatrix(this.matrix || '1,0,0,1,0,0');
    // matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
    const scaleX = this.width ? this.width / (originCropperWidth || this.width) : 1;
    const scaleY = this.height ? this.height / (originCropperHeight || this.height) : 1;

    return {
      width: imgWidth || '100%',
      height: imgHeight || '100%',
      transform: `matrix(${scaleX}, ${skewY}, ${skewX}, ${scaleY}, -${translateX * scaleX}, -${translateY * scaleY})`,
    };
  }

  get data() {
    return {
      src: this.src,
      width: this.width,
      height: this.height,
      rect: this.rect,
      matrix: this.matrix,
      readOnly: this.readOnly,
    };
  }

  componentDidMount(): void {
    const { cropperWidth, cropperHeight } = this.computedRect;
    this.width = cropperWidth;
    this.height = cropperHeight;
    this.originRect = {
      cropperWidth,
      cropperHeight,
    };
  }

  shouldComponentUpdate(propName: string, oldValue: any, newValue: any): boolean {
    if (['width', 'height'].includes(propName)) {
      if (oldValue === newValue) {
        return false;
      }
    }
    return true;
  }

  listen = (e) => {
    this.$emit('resizestart');
    this.isMoving = true;
    this.startEl = e.target;
    this.startX = e.clientX;
    this.startY = e.clientY;

    this.curRect = {
      width: this.width || this.parentStyle.width,
      height: this.height || this.parentStyle.height,
    };

    this.setCursor(window.getComputedStyle(this.startEl).cursor);
    document.addEventListener('mousemove', this.handleMouseMove, false);
    document.addEventListener('mouseup', this.handleMouseUp, false);
  };

  handleMouseMove = (e) => {
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    // 同比例放大
    // const distance = computeDistancePoint(this.startX, this.startY, e.clientX, e.clientY);
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
    this.width = width > this.parentStyle.width ? this.parentStyle.width : width;
    this.height = height;
  };

  handleMouseUp = () => {
    this.setCursor('');
    document.removeEventListener('mousemove', this.handleMouseMove, false);
    document.removeEventListener('mouseup', this.handleMouseUp, false);
    setTimeout(() => {
      this.$emit('resizeend', {
        detail: this.data,
      });
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
      this.$emit('confirm', {
        detail: this.data,
      });
      window.removeEventListener('click', this.handleClickByOut);
    }
  };

  handleClickByOut = (e) => {
    const isInDom = this.contains(e.target) || e.target.shadowRoot?.contains(this);
    if (!isInDom) {
      this.toggleControl();
    }
  };

  stopToolbar = (e) => {
    e.stopPropagation();
  };

  getClassName = () => {
    return `q-image-resize${this.readOnly ? ' readOnly' : ''}${this.isControl ? ' focus' : ''}`;
  };

  emitLoad = () => {
    this.$emit('load');
  };
  render() {
    return (
      <>
        <div ref={this.elRef} class={this.getClassName()} onClick={this.handleClick}>
          <div ref={this.contentRef} class="content" style={this.contentStyle}>
            <img ref={this.imgRef} style={this.imgStyle} src={this.src} onLoad={this.emitLoad} />
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
            <div className="toolbar" onClick={this.stopToolbar}>
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
