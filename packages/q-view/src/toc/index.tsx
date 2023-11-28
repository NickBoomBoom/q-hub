import { QuarkElement, property, customElement, createRef, Ref, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-toc', style })
export default class Toc extends QuarkElement {
  @state()
  isShow = true;
  @state()
  list: any[] = [];

  toggle = () => {
    this.isShow = !this.isShow;
  };
  componentDidMount(): void {
    const ls = document.querySelectorAll('q-doc-view');
    const arr = [];
    for (let i = 0; i < ls.length; i++) {
      arr.push(ls[i]);
    }
    this.list = arr;
  }
  render() {
    return (
      <div class={`q-toc ${this.isShow ? 'show' : 'hide'}`}>
        <div class="control" onClick={this.toggle}>
          导航
        </div>
        <div class="content">
          {this.list.map((t, i) => {
            return (
              <div class="item" onClick={() => t.scrollIntoView({ behavior: 'smooth' })}>
                {i + 1}.{t.title || t.tocTitle}
              </div>
            );
          })}

          <footer>
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    );
  }
}
