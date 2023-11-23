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
  width = null;

  @property({ type: String })
  src = '';

  @property({ type: Boolean })
  readOnly = false;

  elRef: Ref<HTMLElement> = createRef();
  dialogRef: Ref<Dialog> = createRef();
  imgRef: Ref<HTMLImageElement> = createRef();
  cropperRef: Ref<HTMLElement> = createRef();
  contentRef: Ref<HTMLElement> = createRef();
  isMoving = false;
  preWidth = null;
  startX = null;
  startY = null;
  startEl = null;

  get currentWidth() {
    return this.width ? this.width + 'px' : '100%';
  }

  listen = (e) => {
    this.isMoving = true;
    this.startEl = e.target;
    this.startX = e.clientX;
    this.startY = e.clientY;
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
    [document.body, this.startEl].forEach((el) => {
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
    return `q-image-resize ${this.readOnly ? 'readOnly' : ''}  ${this.isControl ? 'focus' : ''}`;
  };

  openCropper = (e) => {
    e.stopPropagation();
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
  render() {
    return (
      <>
        <div ref={this.elRef} class={this.getClassName()} onClick={this.handleClick}>
          <div ref={this.contentRef} class="content" style={{ width: this.currentWidth }}>
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
          {this.isCropper && (
            <div class="croppers" ref={this.cropperRef}>
              <div class="cropper lt" data-type="-" onMouseDown={this.listen}></div>
              <div class="cropper ct" data-type="-" onMouseDown={this.listen}></div>
              <div class="cropper rt" data-type="+" onMouseDown={this.listen}></div>

              <div class="cropper lb" data-type="-" onMouseDown={this.listen}></div>
              <div class="cropper cb" data-type="-" onMouseDown={this.listen}></div>
              <div class="cropper rb" data-type="+" onMouseDown={this.listen}></div>
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
