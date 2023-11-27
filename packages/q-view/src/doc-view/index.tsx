import { QuarkElement, property, customElement, createRef, Ref, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-doc-view', style })
export default class DocView extends QuarkElement {
  @property()
  title = '';

  @state()
  isShowAttr = false;

  handleAttrSlotChange = (e) => {
    this.isShowAttr = e.target.assignedNodes().length > 0;
  };
  render() {
    return (
      <>
        <div class="title" id={this.title} dangerouslySetInnerHTML={{ __html: `${this.title}` }}></div>
        <div class={`attr ${this.isShowAttr ? '' : 'hide'}`}>
          <slot name="attr" onSlotChange={this.handleAttrSlotChange} />
        </div>
        <div class="main">
          <slot />
        </div>
      </>
    );
  }
}
