<template>
    <div id="app">
        <header class="header-info">
            <img alt="Vue logo" src="./assets/logo.png" style="height: 42px" />
            <div class="site-name">eslint-plugin-vue Online Playground</div>
            <div class="packages-info">
                <template v-for="pkg in packages">
                    <a :key="pkg.name" :href="pkg.homepage" target="_blank"
                        >{{ pkg.name }}@{{ pkg.version }}</a
                    >
                </template>
            </div>
        </header>
        <main class="main">
            <ESLintPlayground />
        </main>
    </div>
</template>

<script lang="ts">
import Vue from "vue"
import ESLintPlayground from "./components/ESLintPlayground.vue"

export default Vue.extend({
    name: "App",
    components: {
        ESLintPlayground,
    },
    data() {
        return {
            packages: [
                require("eslint-plugin-vue/package.json"),
                require("vue-eslint-parser/package.json"),
                require("eslint4b/package.json"),
                // require("@typescript-eslint/parser/package.json"),
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
}
.packages-info a {
    padding: 0 8px;
    color: #2c3e50;
}
.main {
    height: calc(100vh - 60px);
}
</style>
