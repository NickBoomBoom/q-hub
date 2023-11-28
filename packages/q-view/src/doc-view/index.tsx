import { QuarkElement, property, customElement, createRef, Ref, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-doc-view', style })
export default class DocView extends QuarkElement {
  @property({
    type: String,
  })
  title = '';
  @property({ type: String, attribute: 'toc-title' })
  tocTitle = '';

  @state()
  isShowAttr = false;

  titleRef = createRef();

  handleAttrSlotChange = (e) => {
    this.isShowAttr = e.target.assignedNodes().length > 0;
  };

  render() {
    return (
      <>
        {this.title ? (
          <div class="title" id={this.title} dangerouslySetInnerHTML={{ __html: `${this.title}` }}></div>
        ) : (
          <div class="title-slot">
            <slot name="title" ref={this.titleRef} />
          </div>
        )}
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
