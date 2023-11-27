import { QuarkElement, property, customElement, createRef, Ref, state } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-toc', style })
export default class Toc extends QuarkElement {
  @state()
  list: any[] = [];
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
      <>
        {this.list.map((t, i) => {
          return (
            <div onClick={() => t.scrollIntoView({ behavior: 'smooth' })}>
              {i + 1}.{t.title}
            </div>
          );
        })}

        <footer>
          <slot name="footer"></slot>
        </footer>
      </>
    );
  }
}
