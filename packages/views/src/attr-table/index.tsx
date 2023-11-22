import { QuarkElement, property, customElement, createRef, Ref } from "quarkc";
import style from './index.less?inline'

@customElement({ tag: "q-attr-table", style })
export default class AttrTable extends QuarkElement {

  renderHeader() {
    return <>
      <th>
        attr
      </th>

      <th>
        type
      </th>
      <th>
        desc
      </th>
    </>
  }

  // 字符串形式 用\n 换行 分号切分不同格
  renderBody() {
    const arr = this.innerHTML.trim().split('\n').map(t => t.split(';'))
    return arr.map(t => <tr>
      {
        t.map(tt => <td>
          {tt}
        </td>)
      }
    </tr>)
  }



  render() {
    return <table border>
      <thead>
        {this.renderHeader()}
      </thead>

      <tbody>
        {
          this.renderBody()
        }

      </tbody>


    </table>
  }
}