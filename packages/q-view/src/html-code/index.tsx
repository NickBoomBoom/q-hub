import { QuarkElement, property, customElement, createRef, Ref, state } from 'quarkc';
import style from './index.less?inline';
import prismStyle from 'prismjs/themes/prism-okaidia.min.css?inline';
import Prism from 'prismjs';

@customElement({ tag: 'q-html-code', style: `${style} ${prismStyle}` })
export default class HtmlCode extends QuarkElement {
  @state()
  isShowSlot = true;

  @state()
  code = '';

  contentRef = createRef();
  componentDidMount(): void {
    this.code = this.innerHTML;
  }
  handleChange = () => {
    Prism.highlightAllUnder(this.shadowRoot);
  };

  toggle = () => {
    this.isShowSlot = !this.isShowSlot;
  };
  render() {
    return (
      <>
        <div class="header">
          <button onClick={this.toggle}>{this.isShowSlot ? '查看源码' : '返回'}</button>
        </div>
        <div ref={this.contentRef} class="content">
          {this.isShowSlot ? (
            <slot onSlotChange={this.handleChange} />
          ) : (
            <pre class="code">
              <code class="language-html">{this.code}</code>
            </pre>
          )}
        </div>
      </>
    );
  }
}
