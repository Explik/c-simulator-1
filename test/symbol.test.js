import { assert } from 'chai';
import {
  declaration,
  identifier,
  intConstant,
  intDeclaration,
  stringConstant,
  stringDeclaration,
  and,
  lessThanOrEqual, assign, addAssign, increment, invoke, equal, statement, forLoop, block, nullStatement
} from "@/simulator/treeNodes\'";
import {symbolList, stringify, symbolMap, getRange, getTransformedRange, transformRange} from "../src/simulator/symbol";

describe('symbol', () => {
  describe('symbolList', () => {
    it('should produce correct symbol list for identifier', () => {
      const identifierNode = identifier("name");

      const expectedList = [
        {value: "name", node: identifierNode}
      ];
      assert.deepEqual(symbolList(identifierNode), expectedList);
    });

    it('should produce correct symbol list for int constant', () => {
      const constantNode = intConstant(5);

      const expectedList = [
        {value: "5", node: constantNode}
      ];
      assert.deepEqual(symbolList(constantNode), expectedList);
    });

    it('should produce correct symbol list for string literal', () => {
      const constantNode = stringConstant("value");

      const expectedList = [
        {value: "\"value\"", node: constantNode}
      ];
      assert.deepEqual(symbolList(constantNode), expectedList);
    });

    it('should produce correct symbol list for statement', () => {
      const constantNode = stringConstant("value");
      const statementNode = statement(constantNode);

      const expectedList = [
        {value: "\"value\"", node: constantNode},
        {value: ";", node: statementNode}
      ];
      assert.deepEqual(symbolList(statementNode), expectedList);
    });

    it('should produce correct symbol list for int declaration (without value)', () => {
      const identifierNode = identifier("n");
      const declarationNode = intDeclaration(identifierNode);

      const expectedList = [
        {value: "int ", node: declarationNode},
        {value: "n", node: identifierNode},
        {value: ";", node: declarationNode}
      ];
      assert.deepEqual(symbolList(declarationNode), expectedList);
    });

    it('should produce correct symbol list for int declaration (with value)', () => {
      const identifierNode = identifier("n");
      const constantNode = intConstant(5);
      const declarationNode = intDeclaration(identifierNode, constantNode);

      const expectedList = [
        {value: "int ", node: declarationNode},
        {value: "n", node: identifierNode},
        {value: " = ", node: declarationNode},
        {value: "5", node: constantNode},
        {value: ";", node: declarationNode}
      ];
      assert.deepEqual(symbolList(declarationNode), expectedList);
    });

    it('should produce correct symbol list for string declaration (without value)', () => {
      const identifierNode = identifier("name");
      const declarationNode = stringDeclaration(identifierNode);

      const expectedList = [
        {value: "char* ", node: declarationNode},
        {value: "name", node: identifierNode},
        {value: ";", node: declarationNode}
      ];
      assert.deepEqual(symbolList(declarationNode), expectedList);
    });

    it('should produce correct symbol list for string declaration (with value)', () => {
      const identifierNode = identifier("name");
      const constantNode = stringConstant("Hello World");
      const declarationNode = stringDeclaration(identifierNode, constantNode);

      const expectedList = [
        {value: "char* ", node: declarationNode},
        {value: "name", node: identifierNode},
        {value: " = ", node: declarationNode},
        {value: "\"Hello World\"", node: constantNode},
        {value: ";", node: declarationNode}
      ];
      assert.deepEqual(symbolList(declarationNode), expectedList);
    });

    it('should produce correct symbol list for and operator', () => {
      const identifierNode = identifier("p");
      const constantNode = intConstant(0);
      const operatorNode = and(identifierNode, constantNode);

      const expectedList = [
        {value: "p", node: identifierNode},
        {value: " && ", node: operatorNode},
        {value: "0", node: constantNode}
      ];
      assert.deepEqual(symbolList(operatorNode), expectedList);
    });

    it('should produce correct symbol list for less than or equal operator', () => {
      const identifierNode = identifier("p");
      const constantNode = intConstant(0);
      const operatorNode = lessThanOrEqual(identifierNode, constantNode);

      const expectedList = [
        {value: "p", node: identifierNode},
        {value: " <= ", node: operatorNode},
        {value: "0", node: constantNode}
      ];
      assert.deepEqual(symbolList(operatorNode), expectedList);
    });

    it('should produce correct symbol list for equal operator', () => {
      const identifierNode = identifier("p");
      const constantNode = intConstant(0);
      const operatorNode = equal(identifierNode, constantNode);

      const expectedList = [
        {value: "p", node: identifierNode},
        {value: " == ", node: operatorNode},
        {value: "0", node: constantNode}
      ];
      assert.deepEqual(symbolList(operatorNode), expectedList);
    });

    it('should produce correct symbol list for assign operator', () => {
      const identifierNode = identifier("n");
      const constantNode = intConstant(8);
      const operatorNode = assign(identifierNode, constantNode);

      const expectedList = [
        {value: "n", node: identifierNode},
        {value: " = ", node: operatorNode},
        {value: "8", node: constantNode}
      ];
      assert.deepEqual(symbolList(operatorNode), expectedList);
    });

    it('should produce correct symbol list for add assign operator', () => {
      const identifierNode = identifier("i");
      const constantNode = intConstant(2);
      const operatorNode = addAssign(identifierNode, constantNode);

      const expectedList = [
        {value: "i", node: identifierNode},
        {value: " += ", node: operatorNode},
        {value: "2", node: constantNode}
      ];
      assert.deepEqual(symbolList(operatorNode), expectedList);
    });

    it('should produce correct symbol list for increment operator', () => {
      const identifierNode = identifier("i");
      const operatorNode = increment(identifierNode);

      const expectedList = [
        {value: "i", node: identifierNode},
        {value: "++", node: operatorNode}
      ];
      assert.deepEqual(symbolList(operatorNode), expectedList);
    });

    it('should produce correct symbol list for invocation (without parameters)', () => {
      const identifierNode = identifier("method");
      const invocationNode = invoke(identifierNode);

      const expectedList = [
        {value: "method", node: identifierNode},
        {value: "()", node: invocationNode},
      ];
      assert.deepEqual(symbolList(invocationNode), expectedList);
    });

    it('should produce correct symbol list for invocation (with 1 parameters)', () => {
      const identifierNode = identifier("printf");
      const constantNode1 = stringConstant("Hello World");
      const invocationNode = invoke(identifierNode, constantNode1);

      const expectedList = [
        {value: "printf", node: identifierNode},
        {value: "(", node: invocationNode},
        {value: "\"Hello World\"", node: constantNode1},
        {value: ")", node: invocationNode}
      ];
      assert.deepEqual(symbolList(invocationNode), expectedList);
    });

    it('should produce correct symbol list for invocation (with 2 parameters)', () => {
      const identifierNode = identifier("printf");
      const constantNode1 = stringConstant("%d");
      const constantNode2 = intConstant(53);
      const invocationNode = invoke(identifierNode, constantNode1, constantNode2);

      //console.log(stringify(symbolList(invocationNode)))

      const expectedList = [
        {value: "printf", node: identifierNode},
        {value: "(", node: invocationNode},
        {value: "\"%d\"", node: constantNode1},
        {value: ", ", node: invocationNode},
        {value: "53", node: constantNode2},
        {value: ")", node: invocationNode}
      ];
      assert.deepEqual(symbolList(invocationNode), expectedList);
    });

    it('should produce correct symbol list for block', () => {
      const identifierNode = identifier("printf");
      const constantNode = intConstant(5);
      const invocationNode = invoke(identifierNode, constantNode);
      const statementNode = statement(invocationNode);
      const bodyNode = block(statementNode);

      const expectedList = [
        {value: "{\n", node: bodyNode},
        {value: "  ", node: bodyNode},
        {value: "printf", node: identifierNode},
        {value: "(", node: invocationNode},
        {value: "5", node: constantNode},
        {value: ")", node: invocationNode},
        {value: ";", node: statementNode},
        {value: "\n}", node: bodyNode}
      ];
      assert.deepEqual(symbolList(bodyNode), expectedList);
    });

    it('should produce correct symbol list for loop (without block)', () => {
      const identifierNode1 = identifier("i");
      const identifierNode2 = identifier("printf");
      const constantNode1 = intConstant(0);
      const constantNode2 = intConstant(5);
      const initializerNode = intDeclaration(identifierNode1, constantNode1);
      const lessThanNode = lessThanOrEqual(identifierNode1, constantNode2);
      const conditionNode = statement(lessThanNode);
      const incrementNode = increment(identifierNode1);
      const updateNode = statement(incrementNode);
      const invocationNode = invoke(identifierNode2, identifierNode1);
      const bodyNode = statement(invocationNode);
      const forLoopNode = forLoop(initializerNode, conditionNode, updateNode, bodyNode);

      //console.log(stringify(symbolList(forLoopNode)))

      const expectedList = [
        {value: "for (", node: forLoopNode},
        {value: "int ", node: initializerNode},
        {value: "i", node: identifierNode1},
        {value: " = ", node: initializerNode},
        {value: "0", node: constantNode1},
        {value: ";", node: initializerNode},
        {value: " ", node: forLoopNode},
        {value: "i", node: identifierNode1},
        {value: " <= ", node: lessThanNode},
        {value: "5", node: constantNode2},
        {value: ";", node: updateNode},
        {value: " ", node: forLoopNode},
        {value: "i", node: identifierNode1},
        {value: "++", node: incrementNode},
        {value: ")\n  ", node: forLoopNode},
        {value: "printf", node: identifierNode2},
        {value: "(", node: invocationNode},
        {value: "i", node: identifierNode1},
        {value: ")", node: invocationNode},
        {value: ";", node: bodyNode}
      ];
      assert.deepEqual(symbolList(forLoopNode), expectedList);
    });

    it('should produce correct symbol list for loop (with block)', () => {
      const identifierNode1 = identifier("i");
      const identifierNode2 = identifier("printf");
      const constantNode1 = intConstant(0);
      const constantNode2 = intConstant(5);
      const initializerNode = intDeclaration(identifierNode1, constantNode1);
      const lessThanNode = lessThanOrEqual(identifierNode1, constantNode2);
      const conditionNode = statement(lessThanNode);
      const incrementNode = increment(identifierNode1);
      const updateNode = statement(incrementNode);
      const invocationNode = invoke(identifierNode2, identifierNode1);
      const statementNode = statement(invocationNode);
      const bodyNode = block(statementNode);
      const forLoopNode = forLoop(initializerNode, conditionNode, updateNode, bodyNode);

      //console.log(stringify(symbolList(forLoopNode)))

      const expectedList = [
        {value: "for (", node: forLoopNode},
        {value: "int ", node: initializerNode},
        {value: "i", node: identifierNode1},
        {value: " = ", node: initializerNode},
        {value: "0", node: constantNode1},
        {value: ";", node: initializerNode},
        {value: " ", node: forLoopNode},
        {value: "i", node: identifierNode1},
        {value: " <= ", node: lessThanNode},
        {value: "5", node: constantNode2},
        {value: ";", node: updateNode},
        {value: " ", node: forLoopNode},
        {value: "i", node: identifierNode1},
        {value: "++", node: incrementNode},
        {value: ") ", node: forLoopNode},
        {value: "{\n  ", node: bodyNode},
        {value: "printf", node: identifierNode2},
        {value: "(", node: invocationNode},
        {value: "i", node: identifierNode1},
        {value: ")", node: invocationNode},
        {value: ";", node: statementNode},
        {value: "\n}", node: bodyNode}
      ];
      assert.deepEqual(symbolList(forLoopNode), expectedList);
    });

    it('should produce correct symbol map for int declaration (with value)', () => {
      const identifierNode = identifier("n");
      const constantNode = intConstant(5);
      const declarationNode = intDeclaration(identifierNode, constantNode);
      const list = symbolList(declarationNode);

      const expectedList = [
        {node: declarationNode, start: 0, end: 10},
        {node: constantNode, start: 8, end: 9}
      ];
      assert.deepEqual(symbolMap(declarationNode, list), expectedList);
    });
  });

  describe('getRange', () => {
    it('should match entire range for one-element sequence', () => {
      const identifierNode = identifier("name");
      const symbols = [
        {value: "name", node: identifierNode}
      ];

      const expectedRange = {
        start: 0,
        end: 0
      };
      assert.deepEqual(getRange(symbols, identifierNode), expectedRange);
    });
    it('should correctly match left of sequence', () => {
      const identifierNode = identifier("n");
      const constantNode = intConstant(8);
      const operatorNode = assign(identifierNode, constantNode);
      const symbols = [
        {value: "n", node: identifierNode},
        {value: " = ", node: operatorNode},
        {value: "8", node: constantNode}
      ];

      const expectedRange = {
        start: 0,
        end: 0
      };
      assert.deepEqual(getRange(symbols, identifierNode), expectedRange);
    });
    it('should correctly match middle of sequence', () => {
      const identifierNode = identifier("n");
      const declarationNode = intDeclaration(identifierNode);
      const symbols = [
        {value: "int ", node: declarationNode},
        {value: "n", node: identifierNode},
        {value: ";", node: declarationNode}
      ];

      const expectedRange = {
        start: 1,
        end: 1
      };
      assert.deepEqual(getRange(symbols, identifierNode), expectedRange);
    });
    it('should correctly match right of range', () => {
      const identifierNode = identifier("n");
      const constantNode = intConstant(8);
      const operatorNode = assign(identifierNode, constantNode);
      const symbols = [
        {value: "n", node: identifierNode},
        {value: " = ", node: operatorNode},
        {value: "8", node: constantNode}
      ];

      const expectedRange = {
        start: 2,
        end: 2
      };
      assert.deepEqual(getRange(symbols, constantNode), expectedRange);
    });
    it('should correctly match sub-sequence on composite symbol', () => {
      const identifierNode = identifier("n");
      const constantNode1 = intConstant(0);
      const constantNode2 = intConstant(1);
      const andNode = and(constantNode1, constantNode2);
      const declarationNode = intDeclaration(identifierNode, andNode);
      const symbols = [
        {value: "int ", node: declarationNode},
        {value: "n", node: identifierNode},
        {value: " = ", node: declarationNode},
        {value: "0", node: constantNode1},
        {value: " && ", node: andNode},
        {value: "1", node: constantNode2},
        {value: ";", node: declarationNode}
      ];

      const expectedRange = {
        start: 3,
        end: 5
      };
      assert.deepEqual(getRange(symbols, andNode), expectedRange);
    });
  });

  describe('transformRange', () => {
    function getArray(length) {
      return Array.from(Array(length).keys());
    }

    it ('should offset range after offset-symbol callback', () => {
      const symbols = [
        {value: "int ", node: undefined},
        {value: "n", node: undefined},
        {value: ";", node: undefined}
      ];
      const range = {
        start: 1,
        end: 1
      };
      const callback = (arr) => getArray(arr.length + 3);

      const transformedRange = {
        start: 4,
        end: 4
      };
      assert.deepEqual(transformRange(range, symbols, callback), transformedRange);
    });
    it ('should double range after double-symbol callback', () => {
      const symbols = [
        {value: "int ", node: undefined},
        {value: "n", node: undefined},
        {value: ";", node: undefined}
      ];
      const range = {
        start: 1,
        end: 1
      };
      const callback = (arr) => getArray(arr.length * 2);

      const transformedRange = {
        start: 2,
        end: 3
      };
      assert.deepEqual(transformRange(range, symbols, callback), transformedRange);
    });
  });
});