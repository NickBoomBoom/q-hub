import { QuarkElement, Ref, createRef, customElement, property, state } from 'quarkc';
import { isAudio, isVideo } from '../utils';
import style from './index.less?inline';
import Plyr from 'plyr';
import plyrStyle from 'plyr/dist/plyr.css?inline';

@customElement({ tag: 'q-media-player', style: `${style} ${plyrStyle}` })
export default class EventTable extends QuarkElement {
  @property({ type: String })
  src = '';
  player: Plyr;
  el: Ref<HTMLElement> = createRef();
  componentDidMount(): void {
    console.log(111, this.src);
    this.init();
  }

  componentDidUpdate(propName: string, oldValue: any, newValue: any): void {
    if (propName === 'src') {
      console.log(2111, newValue, oldValue);
    }
  }

  init() {
    if (!this.src) {
      return console.error('q-media-player src is null');
    }
    this.player = new Plyr(this.el.current, {
      i18n: {
        speed: '速率',
      },
      resetOnEnd: true,
    });
    this.player.on('loadeddata', () => {
      this.$emit('load');
    });
  }
  render() {
    return (
      <>
        {isVideo(this.src) ? (
          <video controls crossorigin ref={this.el} src={this.src}></video>
        ) : (
          <audio controls ref={this.el} src={this.src}></audio>
        )}
      </>
    );
  }
}
