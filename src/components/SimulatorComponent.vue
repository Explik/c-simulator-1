<template>
  <div>
    <SourceComponent :symbols="this.symbols" />
  </div>
</template>

<script>
import {symbolList} from "@/simulator/symbol";
import SourceComponent from "@/components/SourceComponent";

export default {
  name: 'SimulatorComponent',
  props: {
    initialState: {type: Object, required: true}
  },
  components: {SourceComponent},
  data() {
    return {
      state: this.initialState
    };
  },
  computed: {
    symbols: function() {
      return (this.state.root.flatMap(symbolList));
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
