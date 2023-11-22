export type CODE_LANGUAGE =
  | 'javascript'
  | 'python'
  | 'java'
  | 'markdown'
  | 'json'
  | 'rust'
  | 'cpp'
  | 'sql'
  | 'html'
  | 'xml'
  | 'css'
  | 'sass'
  | 'less'
  | 'angular'
  | 'vue'

export type LANGUAGE_MAP = {
  [key in CODE_LANGUAGE]: any
}

