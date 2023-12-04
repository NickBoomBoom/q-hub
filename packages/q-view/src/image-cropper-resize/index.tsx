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

  get computedRect() {
    const [imgWidth, cropperWidth, imgHeight, cropperHeight] = (this.rect || '').split(',').map((t) => (t ? +t : 0));
    return {
      imgWidth,
      cropperWidth,
      imgHeight,
      cropperHeight,
    };
  }

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
    const { cropperWidth, cropperHeight } = this.computedRect;
    this.width = cropperWidth;
    this.height = cropperHeight;
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
                  <svg
                    t="1701679775369"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="10621"
                    width="200"
                    height="200"
                  >
                    <path
                      d="M275.712 152.064h60.928V243.2h-60.928V152.064zM336.384 698.112V364.288h-60.928v394.496h394.496v-60.928l-333.568 0.256zM791.552 698.112h91.136v60.928h-91.136v-60.928z"
                      p-id="10622"
                    ></path>
                    <path
                      d="M154.368 273.408v60.928h546.048v546.048h60.928v-606.72H154.368v-0.256zM700.672 78.848h45.824v45.824h-45.824zM789.248 101.888h45.824v45.824h-45.824zM858.368 147.456h45.824v45.824h-45.824zM904.192 216.832h45.824v45.824h-45.824zM926.976 308.224H972.8v45.824h-45.824zM507.392 101.376l142.336 93.952V7.424zM282.624 904.448h45.824v45.824h-45.824zM194.048 881.408h45.824v45.824H194.048zM124.928 835.84h45.824v45.824H124.928zM79.36 766.72h45.824v45.824H79.36zM56.32 674.816h45.824v45.824H56.32zM521.728 927.744l-142.336-93.952v187.904z"
                      p-id="10623"
                    ></path>
                  </svg>
                </button>
              </div>
            </q-image-resize>
          )}
        </div>
      </>
    );
  }
}
