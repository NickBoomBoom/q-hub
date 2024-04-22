import { QuarkElement, property, customElement, createRef, Ref } from 'quarkc';
import style from './index.less?inline';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';
import { css } from '@codemirror/lang-css';
import { cpp } from '@codemirror/lang-cpp';
import { angular } from '@codemirror/lang-angular';
import { java } from '@codemirror/lang-java';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { less } from '@codemirror/lang-less';
import { sass } from '@codemirror/lang-sass';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { vue } from '@codemirror/lang-vue';
import { CODE_LANGUAGE, LANGUAGE_MAP } from './interface';

const DEFAULT_LANGUAGE: CODE_LANGUAGE = 'javascript';
const LANGUAGES: LANGUAGE_MAP = {
  javascript: javascript(),
  python: python(),
  java: java(),
  markdown: markdown(),
  json: json(),
  rust: rust(),
  cpp: cpp(),
  sql: sql(),
  html: html(),
  xml: xml(),
  css: css(),
  angular: angular(),
  less: less(),
  sass: sass(),
  vue: vue(),
};

@customElement({ tag: 'q-code-area', style })
export default class CodeArea extends QuarkElement {
  @property({ type: String })
  value = '';

  @property({ type: String })
  language: CODE_LANGUAGE = DEFAULT_LANGUAGE;

  @property({ type: Boolean })
  readOnly = false;

  get data() {
    return {
      value: this.value,
      language: this.language,
      readOnly: this.readOnly,
    };
  }

  editorEl: Ref<HTMLDivElement> = createRef();
  editor: EditorView;
  readOnlyConfig = new Compartment();
  langConfig = new Compartment();

  componentDidMount() {
    const _lang = LANGUAGES[this.language];
    const state = EditorState.create({
      doc: this.value,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        this.langConfig.of(_lang),
        this.readOnlyConfig.of(EditorState.readOnly.of(this.readOnly)),
        EditorView.updateListener.of((v) => {
          const { docChanged } = v;
          if (docChanged) {
            this.setValue();
          }
        }),
      ],
    });
    this.editor = new EditorView({
      state,
      parent: this.editorEl.current,
    });

    if (!this.readOnly) {
      setTimeout(() => {
        this.editor.focus();
      });
    }
  }

  componentDidUpdate(propName, oldValue, newValue) {
    if (propName === 'value' && newValue !== this.value) {
      this.editor?.dispatch({
        changes: {
          from: 0,
          to: this.editor.state.doc.length,
          insert: newValue,
        },
      });
    }
    if (propName === 'readOnly') {
      this.setReadOnly(newValue);
    }
    if (propName === 'language') {
      this.setLanguage(newValue);
    }
  }
  setValue(v?: string) {
    const code = v || this.editor.state.doc.toString();
    this.value = code;
    this.emitChange();
  }

  setReadOnly(bol: boolean) {
    this.editor?.dispatch({
      effects: this.readOnlyConfig.reconfigure(EditorState.readOnly.of(bol)),
    });
    this.emitChange();
  }

  setLanguage(key: CODE_LANGUAGE) {
    this.language = key;
    this.editor?.dispatch({
      effects: this.langConfig.reconfigure(LANGUAGES[key]),
    });
    this.emitChange();
  }

  emitChange() {
    this.$emit('change', {
      detail: this.data,
    });
  }

  render() {
    return (
      <>
        <div class="code-area" ref={this.editorEl}></div>
        <select disabled={this.readOnly} onChange={(e) => this.setLanguage(e.target.value)}>
          {Object.keys(LANGUAGES).map((t) => {
            return (
              <option key={t} value={t} selected={t === this.language}>
                {t}
              </option>
            );
          })}
        </select>
      </>
    );
  }
}
