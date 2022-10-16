<template>
  <code>
    <span v-for="symbol in allSymbols" :key="symbol.node" :class="symbol.type">
      {{symbol.value}}
      <br v-if="symbol.value.trim() === ';' || symbol.value.trim() === '{' || symbol.value.trim() === '}'"/>
    </span>
  </code>
</template>

<script>
import {highlightSyntax} from "@/simulator/symbolTransformers";

export default {
  name: "SourceComponent",
  props: {
    symbols: {type: Array, required: true}
  },
  computed: {
    allSymbols: function() {
      return highlightSyntax(this.symbols);
    }
  }
}
</script>

<style scoped>
  code {
    font-family: monospace;
    font-weight: 900;
    color: #000;
  }
  .include {
    color: #2b91af;
  }
  .identifier {
    color: #a31515;
  }
  .keyword {
    color: #00f;
  }
  .type {
    //color: #2b91af;
  }
  .numeral {
    color: darkorange;
  }
</style>