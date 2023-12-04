import { QuarkElement, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';

const DEFAULT_Z_INDEX = 9999;
@customElement({ tag: 'q-dialog', style })
export default class Dialog extends QuarkElement {
  @property({ type: Boolean, attribute: 'mask-close' })
  maskClose = true;

  // 是否在打开时渲染 dialog content
  @property({ type: Boolean, attribute: 'lazy' })
  lazy = false;

  // 关闭后销毁内容
  @property({ type: Boolean, attribute: 'destroy-after-close' })
  destroyAfterClose = false;

  @state()
  className = 'q-dialog';

  @state()
  zIndex = DEFAULT_Z_INDEX;

  @state()
  isShow = !this.lazy;

  isAppend = false;
  handleEsc: (e: KeyboardEvent) => void = () => {};

  refTmp = null;

  dialogRef = createRef();

  open = () => {
    this.isShow = true;
    if (!this.isAppend) {
      document.body.appendChild(this);
      this.refTmp = this.cloneNode(true);
      this.isAppend = true;
    }
    this.checkZIndex();
    this.className = 'q-dialog show';
    this.listen();
  };
  close = () => {
    this.offListen();
    this.dialogRef.current.addEventListener(
      'animationend',
      () => {
        this.dialogRef.current.classList.remove('hide');
        this.emitClose();
        if (this.destroyAfterClose) {
          this.remove();
          document.body.appendChild(this.refTmp);
        }
      },
      {
        once: true,
      }
    );
    this.className = 'q-dialog hide';
  };
  listen = () => {
    this.handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    window.addEventListener('keydown', this.handleEsc);
  };
  offListen = () => {
    window.removeEventListener('keydown', this.handleEsc);
  };

  checkZIndex() {
    const els = document.querySelectorAll('.q-dialog.open');
    if (els.length) {
      const arr = [];
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const zIndex = getComputedStyle(el)['zIndex'];
        arr.push(zIndex);
      }
      const max = Math.max(...arr);
      this.zIndex = max + 1;
    } else {
      this.zIndex = DEFAULT_Z_INDEX;
    }
  }

  emitConfirm = () => {
    this.$emit('confirm');
  };
  emitClose = () => {
    this.$emit('close');
  };

  clickMask = () => {
    this.maskClose && this.close();
  };

  clickMain = (e) => {
    e.stopPropagation();
  };

  render() {
    return (
      <div
        ref={this.dialogRef}
        style={{
          'z-index': this.zIndex,
        }}
        class={this.className}
        onClick={this.clickMask}
      >
        <div class="q-dialog-main" onClick={this.clickMain}>
          <div class="q-dialog-main--close" onClick={this.close}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L12 12M12 12L16 16M12 12L16 8M12 12L8 16" stroke="black" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          {this.isShow && (
            <>
              <slot />
              <slot name="footer">
                <footer class="q-dialog-main-footer">
                  <button class="ok" onClick={this.emitConfirm}>
                    确定
                  </button>
                  <button class="close" onClick={this.close}>
                    关闭
                  </button>
                </footer>
              </slot>
            </>
          )}
        </div>
      </div>
    );
  }
}
