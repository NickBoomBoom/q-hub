<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import VueJsonPretty from 'vue-json-pretty';

const router = useRouter();
const instance = getCurrentInstance();
console.log(instance, instance?.proxy?.$history);

function replace(path: string) {
  router.replace(path);
}
function winHandler(method: any, step?: any) {
  (window.history as any)[method](step);
}
const historyLength = computed(() => {
  return instance?.proxy?.$history.stack.length;
});

const historyCurrent = computed(() => {
  return instance?.proxy?.$history.current;
});
console.log(router);
</script>

<template>
  <div class="view">
    <div class="view-item">
      <h1>mode: path</h1>
      <div>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </div>
      <h1>mode: object name</h1>
      <div>
        <RouterLink :to="{ name: 'home', replace: true }">Home</RouterLink>
        <RouterLink :to="{ name: 'about', replace: true }">About</RouterLink>
      </div>
      <h1>router methods</h1>
      <div>
        <button @click="replace('/')">replace home</button>
        <button @click="replace('about')">replace about</button>

        <button @click="router.go(1)">go 1</button>
        <button @click="router.go(-1)">go -1</button>
        <button @click="router.go(0)">go 0</button>
      </div>
      <h1>window.history methods</h1>
      <div>
        <button @click="winHandler('back')">back</button>
        <button @click="winHandler('forward')">forward</button>
        <button @click="winHandler('go', 1)">go 1</button>
        <button @click="winHandler('go', -1)">go -1</button>
        <button @click="winHandler('go', 0)">go 0</button>
      </div>
      <div>history length : {{ historyLength }}</div>
      <div>history current : {{ historyCurrent }}</div>
    </div>

    <VueJsonPretty class="view-item dark" :data="$history as any" :deep="2" showLineNumber showLength> </VueJsonPretty>
  </div>

  <main>
    <RouterView />
  </main>
</template>

<style lang="scss">
#app {
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  font-weight: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

a,
.green {
  margin-right: 10px;
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

button {
  background-color: aquamarine;
  padding: 4px;
  font-size: 20px;
}

button + button {
  margin-left: 10px;
}

.view {
  display: flex;
  width: 100vw;
  height: 90vh;

  &-item {
    flex: 1;
    overflow: auto;

    &:first-child {
      padding-left: 20px;
    }
  }
}

main {
  background: skyblue;
  width: 100vw;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
