import { QuarkElement, property, customElement, createRef, Ref } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-tab', style })
export default class Tab extends QuarkElement {
  @property()
  title = '';

  render() {
    return <slot />;
  }
}
