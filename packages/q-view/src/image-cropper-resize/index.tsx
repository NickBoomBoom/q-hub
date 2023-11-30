import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-image-cropper-resize', style })
export default class ImageCropperResize extends QuarkElement {
  @property({ type: String })
  src = null;

  @property({ type: String })
  rect = ''; // 原图宽,裁切宽,原图高,裁切高

  @property({
    type: String,
  })
  matrix = '';

  @property({ type: Number })
  width = 0;

  @property({ type: Number })
  height = 0;

  @state()
  isCropper = false;

  get data() {
    return {
      // q-image-resize
      width: this.width,
      height: this.height,
      // q-image-cropper
      rect: this.rect,
      matrix: this.matrix,
      src: this.src,
    };
  }

  imageResizeRef = createRef();
  imageCropperRef = createRef();

  toggleCropper = () => {
    this.isCropper = !this.isCropper;
  };

  openCropper = () => {
    this.isCropper = true;
  };

  closeCropper = () => {
    this.isCropper = false;
  };

  componentDidUpdate(propName: string, oldValue: any, newValue: any): void {
    if (propName === 'isCropper') {
      if (newValue) {
        this.imageCropperRef.current.addEventListener('cancel', this.closeCropper);
        this.imageCropperRef.current.addEventListener('confirm', this.handleCropperConfirm);
      } else {
        this.imageResizeRef.current.addEventListener('resizeend', this.handleResizeEnd);
      }
    }
  }

  componentDidMount(): void {
    this.imageResizeRef.current.addEventListener('resizeend', this.handleResizeEnd);
    this.imageResizeRef.current.addEventListener('load', () => {
      this.$emit('load');
    });
  }

  componentWillUnmount(): void {
    this.imageResizeRef?.current?.removeEventListener('resizeend', this.handleResizeEnd);
    this.imageCropperRef?.current?.removeEventListener('cancel', this.closeCropper);
    this.imageCropperRef?.current?.removeEventListener('confirm', this.handleCropperConfirm);
  }

  handleCropperConfirm = (e) => {
    const {
      detail: { rect, matrix },
    } = e;
    this.rect = rect;
    this.matrix = matrix;
    this.width = 0;
    this.height = 0;
    this.closeCropper();
  };

  handleResizeEnd = (e) => {
    const {
      detail: { width, height },
    } = e;
    this.width = width;
    this.height = height;
  };

  render() {
    return (
      <>
        <div>
          {this.isCropper ? (
            <q-image-cropper ref={this.imageCropperRef} rect={this.rect} matrix={this.matrix} src={this.src}></q-image-cropper>
          ) : (
            <q-image-resize ref={this.imageResizeRef} width={this.width} height={this.height} rect={this.rect} matrix={this.matrix} src={this.src}>
              <div slot="toolbar" class="toolbar">
                <button class="cropper" onClick={this.toggleCropper}>
                  裁剪
                </button>
              </div>
            </q-image-resize>
          )}
        </div>
      </>
    );
  }
}
