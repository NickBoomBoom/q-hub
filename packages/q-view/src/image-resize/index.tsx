import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-image-resize', style })
export default class ImageResize extends QuarkElement {
  @state()
  isControl = false;

  @property({
    type: Number,
  })
  width = null;

  @property({ type: String })
  src = '';

  @property({ type: Boolean })
  readOnly = false;

  el: Ref<HTMLElement> = createRef();
  dialog: Ref<any> = createRef();
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
    const classList = this.el.current.classList;
    if (classList.contains('focus') || classList.contains('readOnly')) {
      !this.isMoving && this.dialog.current.open();
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
  render() {
    return (
      <>
        <div ref={this.el} class={this.getClassName()} onClick={this.handleClick}>
          <div class="content" style={{ width: this.currentWidth }}>
            <img src={this.src} />
          </div>
          <div class="anchors" style={{ visibility: this.isControl ? 'visible' : 'hidden' }}>
            <div class="anchor lt" data-type="-" onMouseDown={this.listen}></div>
            <div class="anchor lb" data-type="-" onMouseDown={this.listen}></div>
            <div class="anchor rt" data-type="+" onMouseDown={this.listen}></div>
            <div class="anchor rb" data-type="+" onMouseDown={this.listen}></div>
          </div>
        </div>
        <q-dialog ref={this.dialog}>
          <img src={this.src} width="100%" />
          <div slot="footer"></div>
        </q-dialog>
      </>
    );
  }
}
