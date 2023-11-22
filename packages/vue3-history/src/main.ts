import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createHistory } from './libs';
import 'vue-json-pretty/lib/styles.css';

const Vue3History = createHistory({
  router,
  debug: true,
  onRouteChange: (v: any) => {
    console.log('onRouteChange', v);
  },
  onQuit() {
    alert('已经到第一页了');
  },
});

createApp(App).use(router).use(Vue3History).mount('#app');
