import { QuarkElement, customElement, property } from 'quarkc';
import style from './index.less?inline';

@customElement({ tag: 'q-attr-table', style })
export default class AttrTable extends QuarkElement {
  @property({ type: String })
  type: 'attr' | 'event' | 'slot' | 'method' = 'attr';

  renderHeader() {
    if (this.type === 'event') {
      return (
        <>
          <th>event</th>
          <th>detail</th>
          <th>desc</th>
        </>
      );
    } else if (this.type === 'slot') {
      return (
        <>
          <th>slot</th>
          <th>desc</th>
        </>
      );
    } else if (this.type === 'method') {
      return (
        <>
          <th>method</th>
          <th>detail</th>
          <th>desc</th>
        </>
      );
    }
    return (
      <>
        <th>attr</th>
        <th>type</th>
        <th>desc</th>
      </>
    );
  }

  // 字符串形式 用\n 换行 分号切分不同格
  renderBody() {
    const arr = this.innerHTML
      .trim()
      .split('\n')
      .map((t) => t.split(';'));
    return arr.map((t) => (
      <tr>
        {t.map((tt) => (
          <td>{tt}</td>
        ))}
      </tr>
    ));
  }

  render() {
    return (
      <table border>
        <thead>{this.renderHeader()}</thead>
        <tbody>{this.renderBody()}</tbody>
      </table>
    );
  }
}
