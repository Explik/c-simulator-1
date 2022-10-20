<template>
  <table>
    <tr v-if="formattedVariables.length !== 0">
      <th>Variable name</th>
      <th>Variable value</th>
    </tr>
    <tr v-for="variable in formattedVariables" :key="variable.name">
      <th>{{variable.name}}</th>
      <th>{{variable.value}}</th>
    </tr>
  </table>
</template>

<script>
import {symbolList} from "@/simulator/symbol";
import {stringify} from "@/simulator/symbolTransformers";

export default {
  name: "VariableComponent",
  props: {
    variables: {type: Array, required: true},
  },
  computed: {
    formattedVariables: function() {
      return this.variables.map(v => {
        return {
          name: v.identifier.name,
          value: stringify(symbolList(v.value))
        }
      });
    }
  }
}
</script>

<style scoped>

</style>