export * from './code-area';
export * from './attr-table';
export * from './doc-view';
export * from './dialog';
export * from './media-player';
export * from './image-resize';
export * from './image-cropper';
export * from './tabs';
export * from './tab';
export * from './html-code';
export * from './toc';

import CodeArea from './code-area';
import AttrTable from './attr-table';
import Dialog from './dialog';
import DocView from './doc-view';
import HtmlCode from './html-code';
import ImageCropper from './image-cropper';
import ImageResize from './image-resize';
import MediaPlayer from './media-player';
import Tabs from './tabs';
import Tab from './tab';
import Toc from './toc';
declare global {
  interface HTMLElementTagNameMap {
    'q-code-area': CodeArea;
    'q-attr-table': AttrTable;
    'q-dialog': Dialog;
    'q-doc-view': DocView;
    'q-html-code': HtmlCode;
    'q-image-cropper': ImageCropper;
    'q-image-resize': ImageResize;
    'q-media-player': MediaPlayer;
    'q-tabs': Tabs;
    'q-tab': Tab;
    'q-toc': Toc;
  }
}
