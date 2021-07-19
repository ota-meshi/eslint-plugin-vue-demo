import type { VNode } from "vue"
import type Vue from "vue"

declare global {
  namespace JSX {
    // eslint-disable-next-line no-shadow -- ignore
    type Element = VNode
    type ElementClass = Vue
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}
