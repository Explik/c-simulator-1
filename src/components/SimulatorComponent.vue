<template>
  <div>
    <source-component :symbols="this.currentSymbols" />
    <variable-component :variables="this.currentVariables" />
    <div>
      <button @click="stepBackward" style="display: inline-block"><i class="material-icons">skip_previous</i></button>
      <button v-if="!isPlaying" @click="startPlaying" style="display: inline-block"><i class="material-icons">play_arrow</i></button>
      <button v-else @click="stopPlaying" style="display: inline-block"><i class="material-icons">pause</i></button>
      <button @click="stepForward" style="display: inline-block"><i class="material-icons">skip_next</i></button>
    </div>
  </div>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</template>

<script>
import {symbolList} from "@/simulator/symbol";
import SourceComponent from "@/components/SourceComponent";
import VariableComponent from "@/components/VariableComponent";
import {
  evaluateExpressionRecursively
} from "@/simulator/evaluator";
import {substitute} from "@/simulator/tree";

export default {
  name: 'SimulatorComponent',
  props: {
    initialState: {type: Object, required: true}
  },
  components: {SourceComponent, VariableComponent},
  data() {
    return {
      states: [this.initialState],
      isPlaying: false,
      playInterval: undefined
    };
  },
  computed: {
    currentState: function() {
      return this.states[this.states.length - 1];
    },
    currentSymbols: function() {
      const getSymbolList = n => [...symbolList(n), { value: "\n", node: n }];
      // Computed changes
      const target = this.currentState.statement;
      const replacement = this.currentState.expression;
      const substituteExpression = n => substitute(n, target, replacement);

      return this.currentState.root.map(substituteExpression).flatMap(getSymbolList);
    },
    currentVariables: function() {
      return this.currentState.variables;
    }
  },
  methods: {
    stepForward: function() {
      console.log("step forward");
      let newState = evaluateExpressionRecursively(this.currentState);
      console.log(newState);
      this.states = [
          ...this.states,
          newState
      ];
    },
    stepBackward: function() {
      console.log("step backward");
      if (this.states.length > 1)
        this.states = this.states.slice(0, -1);
    },
    startPlaying: function() {
      this.isPlaying = true;
      this.playInterval = setInterval(() => this.stepForward(), 700);
    },
    stopPlaying: function() {
      this.isPlaying = false;
      clearInterval(this.playInterval);
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
