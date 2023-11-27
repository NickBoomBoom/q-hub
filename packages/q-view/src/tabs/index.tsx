import { QuarkElement, property, customElement, createRef, Ref, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-tabs', style })
export default class Tabs extends QuarkElement {
  @property()
  title = '';

  slotRef = createRef();
  contentRef = createRef();

  @state()
  list: {
    title: string;
    dom: any;
  }[] = [];

  @state()
  activeIndex = 0;

  onSlotChange = () => {
    const children = this.slotRef.current.assignedNodes();
    const tabs = children.filter((t) => t.tagName === 'Q-TAB');
    this.list = [
      ...this.list,
      ...tabs.map((t, i) => {
        t.setAttribute('data-index', i);
        this.contentRef.current.appendChild(t);
        return {
          title: t.title,
          dom: t,
        };
      }),
    ];
    this.handleSelect(0);
  };

  handleSelect = (i: number) => {
    this.activeIndex = i;
    this.list.forEach((tt, ii) => {
      if (i === ii) {
        tt.dom.style.display = 'block';
      } else {
        tt.dom.style.display = 'none';
      }
    });
  };

  render() {
    return (
      <>
        <div class="header">
          {this.list.map((t, i) => {
            return (
              <div
                class={`header-item ${this.activeIndex === i ? 'active' : ''}`}
                dangerouslySetInnerHTML={{ __html: t.title }}
                data-index={i}
                onClick={() => this.handleSelect(i)}
              ></div>
            );
          })}
          <div class="fill"></div>
        </div>
        <div class="content" ref={this.contentRef}>
          <slot ref={this.slotRef} onslotchange={this.onSlotChange} />
        </div>
      </>
    );
  }
}
