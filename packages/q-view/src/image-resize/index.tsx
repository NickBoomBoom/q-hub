import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';
import Dialog from '../dialog';

@customElement({ tag: 'q-image-resize', style })
export default class ImageResize extends QuarkElement {
  @state()
  isControl = false;

  @state()
  isCropper = true;

  @property({
    type: Number,
  })
  width = 0;

  @property({
    type: Number,
  })
  height = 0;

  @property({
    type: Number,
  })
  x = 0;

  @property({
    type: Number,
  })
  y = 0;

  @property({
    type: Number,
  })
  rotate = 0;

  @property({
    type: Number,
  })
  scale = 0;

  @property({ type: String })
  src = '';

  @property({ type: Boolean })
  readOnly = false;

  elRef: Ref<HTMLElement> = createRef();
  dialogRef: Ref<Dialog> = createRef();
  imgRef: Ref<HTMLImageElement> = createRef();
  contentRef: Ref<HTMLElement> = createRef();

  // 缩放变量
  isMoving = false;
  preWidth = null;
  startX = null;
  startEl = null;

  get contentStyle() {
    return {
      width: this.width ? this.width + 'px' : '100%',
      height: this.height ? this.height + 'px' : 'auto',
    };
  }

  get imgStyle() {
    return {
      transform: `rotate(${this.rotate || 0}) translate(-${this.x}px, -${this.y}px) scale(${this.scale || 0})`,
    };
  }

  get data() {
    return {
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      rotate: this.rotate,
      scale: this.scale,
      src: this.src,
      readOnly: this.readOnly,
    };
  }

  listen = (e) => {
    this.isMoving = true;
    this.startEl = e.target;
    this.startX = e.clientX;
    this.preWidth = this.width || this.getBoundingClientRect().width;
    this.setCursor(window.getComputedStyle(this.startEl).cursor);
    document.addEventListener('mousemove', this.handleMouseMove, false);
    document.addEventListener('mouseup', this.handleMouseUp, false);
  };

  handleMouseMove = (e) => {
    const deltaX = e.clientX - this.startX;
    const type = this.startEl.getAttribute('data-type');
    if (type === '-') {
      this.width = this.preWidth - deltaX;
    }
    if (type === '+') {
      this.width = this.preWidth + deltaX;
    }
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
    const isInDom = this.contains(e.target);
    if (!isInDom) {
      this.toggleControl();
    }
  };

  getClassName = () => {
    return `q-image-resize ${this.readOnly ? 'readOnly' : ''} ${this.isControl ? 'focus' : ''} ${this.isCropper ? 'cropper' : ''}`;
  };

  openCropper = (e) => {
    e.stopPropagation();
  };

  render() {
    return (
      <>
        <div ref={this.elRef} class={this.getClassName()} onClick={this.handleClick}>
          <div ref={this.contentRef} class="content" style={this.contentStyle}>
            <img ref={this.imgRef} src={this.src} />
          </div>
          {this.isControl && (
            <div class="anchors">
              <div class="anchor lt" data-type="-" onMouseDown={this.listen}></div>
              <div class="anchor lb" data-type="-" onMouseDown={this.listen}></div>
              <div class="anchor rt" data-type="+" onMouseDown={this.listen}></div>
              <div class="anchor rb" data-type="+" onMouseDown={this.listen}></div>
            </div>
          )}

          {this.isControl && (
            <div className="toolbar" onClick={this.openCropper}>
              <button>裁切</button>
            </div>
          )}
        </div>

        <q-dialog ref={this.dialogRef}>
          <img src={this.src} width="100%" />
          <div slot="footer"></div>
        </q-dialog>
      </>
    );
  }
}
