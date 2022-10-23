<template>
  <SimulatorComponent :initial-state="state"></SimulatorComponent>
</template>

<script>
import {initialState} from "@/simulator/evaluator";
import {
  addAssign,
  and,
  assign,
  block,
  equal,
  forLoop,
  identifier,
  iff,
  increment,
  intConstant,
  intDeclaration,
  invoke,
  lessThanOrEqual,
  statement,
  stringConstant
} from "@/simulator/tree";
import SimulatorComponent from "@/components/SimulatorComponent";

const i = identifier('i');
const j = identifier('j');
const n = identifier('n');
const printf = identifier('printf');
const step = identifier('step');

const root = [
  intDeclaration(n, intConstant(7)),
  intDeclaration(step, intConstant(1)),
  forLoop(
      intDeclaration(i, intConstant(0)),
      statement(and(lessThanOrEqual(intConstant(0), i), lessThanOrEqual(i, n))),
      statement(addAssign(i, step)),
      block(
          forLoop(
              intDeclaration(j, intConstant(0)),
              statement(lessThanOrEqual(j, i)),
              statement(increment(j)),
              block(
                  statement(invoke(printf, stringConstant(" %d"), j))
              )
          ),
          statement(invoke(printf, stringConstant("\n"))),
          iff(equal(i, n), statement(assign(step, intConstant(-1))))
      )
  )
];

export default {
  name: 'App',
  components: {SimulatorComponent},
  data: function() {
    return {
      state:  initialState({
        root: root,
        statement: root[0],
        expression: root[0]
      })
    };
  }
}
</script>

<style>
</style>
