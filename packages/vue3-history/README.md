# vue3-history
记录vue3 实例中 路由变化
主要用于当前网站返回按钮的功能.
会在app全局注入$history 字段
ex: 
1. 用户直接访问非首页url. 左上角 返回按钮用来判断当前实例访问记录, 如果当前访问记录为1, 那么返回按钮直接push home 页面. 如果访问记录>1 则直接router.back()

# Install
```javascript
pnpm add vue3-history
```
# Api

| options       | desc             | type            |
| ------------- | ---------------- | --------------- |
| router        | vue router 实例  | Router          |
| debug         | 是否打印堆栈信息 | boolean         |
| onRouteChange | 路由变化触发     | (v:any) => void |
| onQuit        | 即将退出app触发,即current = 0 时,history.back 会触发 | () => void      |


# Useage
```javascript
// main.ts 
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createHistory } from "vue3-history";

// core 
const Vue3History = createHistory({
  router,
  debug: true,
  onRouteChange: (v: any) => {
    console.log("onRouteChange", v);
  },
  onQuit() {
    alert('已经到第一页了')
  },
})

createApp(App).use(router).use(Vue3History).mount("#app");


```

```vue
<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { getCurrentInstance } from 'vue'
/** 两种用法
    1. 从getCurrentInstance 中获取
    2. template 中可直接通过$history 使用
*/
const { proxy } = getCurrentInstance()
const history = proxy?.$history
    
</script>

<template>
	<div>
    堆栈信息: {{$history.stack}}
    当前路由下标: {{$history.current}}
    </div>
</template>
```

