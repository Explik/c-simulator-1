<template>
  <div>
    <source-component :symbols="this.symbols" />
    <variable-component :variables="this.state.variables" />
  </div>
</template>

<script>
import {symbolList} from "@/simulator/symbol";
import SourceComponent from "@/components/SourceComponent";
import VariableComponent from "@/components/VariableComponent";
import {substitute} from "@/simulator/tree";

export default {
  name: 'SimulatorComponent',
  props: {
    initialState: {type: Object, required: true}
  },
  components: {SourceComponent, VariableComponent},
  data() {
    return {
      state: this.initialState
    };
  },
  computed: {
    symbols: function() {
      const target = this.state.statement;
      const replacement = this.state.expression;
      const substituteExpression = n => substitute(n, target, replacement);
      const getSymbolList = n => [...symbolList(n), { value: "\n", node: n }];

      return this.state.root.map(substituteExpression).flatMap(getSymbolList);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
