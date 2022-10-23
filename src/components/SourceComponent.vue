<template>
  <pre><code v-html="preformattedContent" class="source-component-code"></code></pre>
</template>

<script>
import {highlightSyntax} from "@/simulator/symbolTransformers";
import {getRange} from "@/simulator/symbol";

export default {
  name: "SourceComponent",
  props: {
    symbols: {type: Array, required: true},
    highlightedSymbolRange: {type: Object, required: true},
  },
  computed: {
    preformattedContent: function() {
      let buffer = "";

      for(let i = 0; i < this.symbols.length; i++) {
        let symbol = this.symbols[i];

        if (i === this.highlightedSymbolRange.start) buffer += '<span class="source-component-highlight">';
        if (this.hasCssClass(symbol)) {
            buffer += `<span class="source-component-${symbol.type}">${symbol.value}</span>`;
        }
        else buffer += symbol.value;
        if (i === this.highlightedSymbolRange.end) buffer += "</span>";
      }
      return buffer;
    }
  },
  methods: {
    hasCssClass: function(symbol) {
      const cssClasses = [
          "include", "identifier", "keyword", "type", "numeral", "string"
      ];
      return cssClasses.includes(symbol.type);
    }
  }
}
</script>

<style>
  .source-component-highlight {
    background-color: #2b91af;
  }
  .source-component-code {
    font-family: monospace;
    font-weight: 900;
    color: #000;
  }
  .source-component-include {
    color: #2b91af;
  }
  .source-component-identifier {
    //color: #a31515;
  }
  .source-component-keyword {
    color: #00f;
  }
  .source-component-type {
    color: #811e99;
  }
  .source-component-numeral {
    color: darkorange;
  }
  .source-component-string {
    color: #77787d;
  }
</style>