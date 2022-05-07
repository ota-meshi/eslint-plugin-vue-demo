import { createApp } from "vue"
import App from "./App.vue"

if (typeof window !== "undefined" && typeof window.process === "undefined") {
  window.process = {
    env: {},
    cwd: () => "",
  } as any
}
createApp(App).mount("#app")
