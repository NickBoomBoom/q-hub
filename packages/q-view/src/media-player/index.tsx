import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import { isAudio, isVideo } from '../utils';
import style from './index.less?inline';

@customElement({ tag: 'q-media-player', style })
export default class EventTable extends QuarkElement {
  @property({ type: String })
  src = '';
  el: Ref<HTMLElement> = createRef();
  componentDidMount(): void {
    this.init();
  }

  init() {
    if (!this.src) {
      return console.error('q-media-player src is null');
    }
  }
  render() {
    return <>{isVideo(this.src) ? <video controls ref={this.el} src={this.src}></video> : <audio controls ref={this.el} src={this.src}></audio>}</>;
  }
}
