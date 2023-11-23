import { QuarkElement, customElement, property, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-dialog', style })
export default class EventTable extends QuarkElement {
  @state()
  className = 'q-dialog hide';
  @property({ type: Boolean, attribute: 'mask-close' })
  maskClose = false;

  handleEsc: (e: KeyboardEvent) => void = () => {};

  open = () => {
    this.className = 'q-dialog show';
    this.listen();
  };
  close = () => {
    this.className = 'q-dialog hide';
    this.offListen();
    this.emitClose();
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
      <>
        <div class={this.className} onClick={this.clickMask}>
          <div class="q-dialog-main" onClick={this.clickMain}>
            <div class="q-dialog-main--close" onClick={this.close}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8L12 12M12 12L16 16M12 12L16 8M12 12L8 16" stroke="black" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
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
          </div>
        </div>
      </>
    );
  }
}
