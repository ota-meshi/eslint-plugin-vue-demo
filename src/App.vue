<template>
  <div id="app">
    <header class="header-info">
      <img class="logo" alt="Vue logo" src="./assets/logo.png" />
      <div class="site-name">eslint-plugin-vue Online Playground</div>
      <div class="packages-info">
        <template v-for="pkg in packages" :key="pkg.name">
          <a :href="pkg.homepage" target="_blank"
            >{{ pkg.name }}@{{ pkg.version }}</a
          >
        </template>
        <a
          href="https://github.com/ota-meshi/eslint-plugin-vue-demo"
          target="_blank"
        >
          <svg
            style="transform: scale(0.8)"
            version="1.1"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            class="octicon octicon-mark-github"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
        </a>
      </div>
    </header>
    <main class="main">
      <ESLintPlayground />
    </main>
    <footer class="footer-info">This site was build at :{{ buildAt }}</footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import ESLintPlayground from "./components/ESLintPlayground.vue"

export default defineComponent({
  name: "App",
  components: {
    ESLintPlayground,
  },
  data() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- env
      buildAt: process.env.VUE_APP_BUILD_AT,
      packages: [
        require("eslint-plugin-vue/package.json"),
        require("vue-eslint-parser/package.json"),
        require("eslint/package.json"),
        require("@typescript-eslint/parser/package.json"),
        require("typescript/package.json"),
        require("eslint-plugin-vuejs-accessibility/package.json"),
      ],
    }
  },
})
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.header-info {
  display: flex;
  align-items: center;
}
.logo {
  height: 42px;
}
.site-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  flex-shrink: 0;
}
.packages-info {
  padding-left: 16px;
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  font-size: 70%;
  justify-content: flex-end;
}
.packages-info a {
  padding: 0 8px;
  color: #2c3e50;
}
.main {
  height: calc(100vh - 80px);
}
.footer-info {
  height: 24px;
  display: flex;
  align-items: center;
  font-size: 70%;
}
@media screen and (max-width: 700px) {
  .logo {
    display: none;
  }
  .site-name {
    font-size: 1rem;
  }
}
@media screen and (max-width: 600px) {
  .logo {
    height: 32px;
    display: block;
  }
  .packages-info {
    display: none;
  }
}
</style>
