import { QuarkElement, property, customElement, createRef, Ref } from "quarkc";
import style from './index.less?inline'

@customElement({ tag: "q-doc-view", style })
export default class ComDoc extends QuarkElement {

  @property()
  title = ''
 

  render() {
    return  <>
    <div className="title">
      {this.title}
    </div>
    <slot/>
    
    </>
  }
}