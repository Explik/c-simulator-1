import { assert } from 'chai';
import {
    declaration,
    identifier,
    intConstant,
    intDeclaration,
    stringConstant,
    stringDeclaration,
    and,
    lessThanOrEqual,
    assign,
    addAssign,
    increment,
    invoke,
    equal,
    statement,
    forLoop,
    block,
    nullStatement
} from "@/simulator/treeNodes\'";
import {highlightSyntax} from "../src/simulator/symbolTransformers";

describe('symbolTransformers', () => {
    describe('highlightSyntax', () => {
        it('should handle parentheses correctly', ()  => {
           const nullNode = nullStatement();
           const symbols = [{ value: '()', node: nullNode }];

           const expected = [
               { type: 'bracket', value: '()' }
           ];
           assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle parentheses with internal space correctly', ()  => {
            const nullNode = nullStatement();
            const symbols = [{ value: '(  )', node: nullNode }];

            const expected = [
                { type: 'bracket', value: '(' },
                { type: 'whitespace', value: '  '},
                { type: 'bracket', value: ')'}
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle parentheses with surrounding spaces correctly', ()  => {
            const nullNode = nullStatement();
            const symbols = [{ value: '  ()  ', node: nullNode }];

            const expected = [
                { type: 'whitespace', value: '  '},
                { type: 'bracket', value: '()' },
                { type: 'whitespace', value: '  '},
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle identifier correctly', () => {
            const identifierNode = identifier('name');
            const symbols = [{ value: 'name', node: identifierNode }];

            const expected = [
                { type: 'identifier', value: 'name' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle string numeral correctly', () => {
            const constantNode = stringConstant('value');
            const symbols = [{ value: '\"value\"', node: constantNode }];

            const expected = [
                { type: 'string', value: '\"value\"' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle numeral correctly', () => {
            const constantNode = intConstant(65);
            const symbols = [{ value: '65', node: constantNode }];

            const expected = [
                { type: 'numeral', value: '65' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle negative numeral correctly', () => {
            const constantNode = intConstant(-65);
            const symbols = [{ value: '-65', node: constantNode }];

            const expected = [
                { type: 'operator', value: '-'},
                { type: 'numeral', value: '65' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle negative numeral correctly', () => {
            const constantNode = intConstant(-65);
            const symbols = [{ value: '-65', node: constantNode }];

            const expected = [
                { type: 'operator', value: '-'},
                { type: 'numeral', value: '65' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle and expression correctly', () => {
            const identifierNode = identifier("p");
            const constantNode = intConstant(0);
            const operatorNode = and(identifierNode, constantNode);
            const symbols = [
                {value: "p", node: identifierNode},
                {value: " && ", node: operatorNode},
                {value: "0", node: constantNode}
            ];

            const expected = [
                { type: 'identifier', value: 'p'},
                { type: 'whitespace', value: ' '},
                { type: 'operator', value: '&&'},
                { type: 'whitespace', value: ' '},
                { type: 'numeral', value: '0' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle less-than-or-equal expression correctly', () => {
            const identifierNode = identifier("p");
            const constantNode = intConstant(0);
            const operatorNode = lessThanOrEqual(identifierNode, constantNode);
            const symbols = [
                {value: "p", node: identifierNode},
                {value: " <= ", node: operatorNode},
                {value: "0", node: constantNode}
            ];

            const expected = [
                { type: 'identifier', value: 'p'},
                { type: 'whitespace', value: ' '},
                { type: 'operator', value: '<='},
                { type: 'whitespace', value: ' '},
                { type: 'numeral', value: '0' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle equal expression correctly', () => {
            const identifierNode = identifier("p");
            const constantNode = intConstant(0);
            const operatorNode = equal(identifierNode, constantNode);
            const symbols = [
                {value: "p", node: identifierNode},
                {value: " == ", node: operatorNode},
                {value: "0", node: constantNode}
            ];

            const expected = [
                { type: 'identifier', value: 'p'},
                { type: 'whitespace', value: ' '},
                { type: 'operator', value: '=='},
                { type: 'whitespace', value: ' '},
                { type: 'numeral', value: '0' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle assign expression correctly', () => {
            const identifierNode = identifier("n");
            const constantNode = intConstant(0);
            const operatorNode = assign(identifierNode, constantNode);
            const symbols = [
                {value: "n", node: identifierNode},
                {value: " = ", node: operatorNode},
                {value: "0", node: constantNode}
            ];

            const expected = [
                { type: 'identifier', value: 'n'},
                { type: 'whitespace', value: ' '},
                { type: 'operator', value: '='},
                { type: 'whitespace', value: ' '},
                { type: 'numeral', value: '0' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle add-assign expression correctly', () => {
            const identifierNode = identifier("i");
            const constantNode = intConstant(2);
            const operatorNode = addAssign(identifierNode, constantNode);
            const symbols = [
                {value: "i", node: identifierNode},
                {value: " += ", node: operatorNode},
                {value: "2", node: constantNode}
            ];

            const expected = [
                { type: 'identifier', value: 'i'},
                { type: 'whitespace', value: ' '},
                { type: 'operator', value: '+='},
                { type: 'whitespace', value: ' '},
                { type: 'numeral', value: '2' },
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle increment expression correctly', () => {
            const identifierNode = identifier("i");
            const operatorNode = increment(identifierNode);
            const symbols = [
                {value: "i", node: identifierNode},
                {value: "++", node: operatorNode},
            ];

            const expected = [
                {type: 'identifier', value: 'i'},
                {type: 'operator', value: '++'},
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle invocation expression correctly (without parameters)', () => {
            const identifierNode = identifier("method");
            const invocationNode = invoke(identifierNode);
            const symbols = [
                {value: "method", node: identifierNode},
                {value: "()", node: invocationNode},
            ];

            const expected = [
                {type: 'identifier', value: 'method'},
                {type: 'bracket', value: '()'},
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle invocation expression correctly (with 1 parameter)', () => {
            const identifierNode = identifier("printf");
            const constantNode1 = stringConstant("Hello World");
            const invocationNode = invoke(identifierNode, constantNode1);
            const symbols = [
                {value: "printf", node: identifierNode},
                {value: "(", node: invocationNode},
                {value: "\"Hello World\"", node: constantNode1},
                {value: ")", node: invocationNode}
            ];

            const expected = [
                {type: 'identifier', value: 'printf'},
                {type: 'bracket', value: '('},
                {type: 'string', value: '\"Hello World\"'},
                {type: 'bracket', value: ')'}
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle invocation expression correctly (with 2 parameters)', () => {
            const identifierNode = identifier("printf");
            const constantNode1 = stringConstant("%d");
            const constantNode2 = intConstant(53);
            const invocationNode = invoke(identifierNode, constantNode1, constantNode2);
            const symbols = [
                {value: "printf", node: identifierNode},
                {value: "(", node: invocationNode},
                {value: "\"%d\"", node: constantNode1},
                {value: ", ", node: invocationNode},
                {value: "53", node: constantNode2},
                {value: ")", node: invocationNode}
            ];

            const expected = [
                {type: 'identifier', value: 'printf'},
                {type: 'bracket', value: '('},
                {type: 'string', value: '\"%d\"'},
                {type: 'operator', value: ','},
                {type: 'whitespace', value: ' '},
                {type: 'numeral', value: '53'},
                {type: 'bracket', value: ')'}
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle null statement correctly', () => {
            const nullNode = nullStatement();
            const symbols = [{value: ';', node: nullNode}];

            const expected = [{type: 'semicolon', value: ';'}];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle expression statement correctly', () => {
            const constantNode = intConstant(5);
            const statementNode = statement(constantNode);
            const symbols = [
                {value: "5", node: constantNode},
                {value: ";", node: statementNode}
            ];

            const expected = [
                {type: 'numeral', value: '5'},
                {type: 'semicolon', value: ';'}
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it('should handle string-declaration statement correctly', () => {
            const identifierNode = identifier("name");
            const constantNode = stringConstant("Hello World");
            const declarationNode = stringDeclaration(identifierNode, constantNode);
            const symbols = [
                {value: "char* ", node: declarationNode},
                {value: "name", node: identifierNode},
                {value: " = ", node: declarationNode},
                {value: "\"Hello World\"", node: constantNode},
                {value: ";", node: declarationNode}
            ];

            const expected = [
                {type: 'type', value: 'char*'},
                {type: 'whitespace', value: ' '},
                {type: 'identifier', value: 'name'},
                {type: 'whitespace', value: ' '},
                {type: 'operator', value: '='},
                {type: 'whitespace', value: ' '},
                {type: 'string', value: "\"Hello World\""},
                {type: 'semicolon', value: ';'},
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
        it ('should handle for-loop statement correctly', () => {
           const nullNode1 = nullStatement();
           const nullNode2 = nullStatement();
           const nullNode3 = nullStatement();
           const nullNode4 = nullStatement();
           const forNode = forLoop(nullNode1, nullNode2, nullNode3, nullNode4);
           const symbols = [
               {value: "for(", node: forNode},
               {value: ";", node: nullNode1},
               {value: ";", node: nullNode2},
               {value: ")", node: forNode}
           ];

            const expected = [
                {type: 'keyword', value: 'for'},
                {type: 'bracket', value: '('},
                {type: 'semicolon', value: ';'},
                {type: 'semicolon', value: ';'},
                {type: 'bracket', value: ')'},
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);

        });
        it('should handle block statement correctly, ', () => {
            const identifierNode = identifier("printf");
            const constantNode = intConstant(5);
            const invocationNode = invoke(identifierNode, constantNode);
            const statementNode = statement(invocationNode);
            const bodyNode = block(statementNode);
            const symbols = [
                {value: "{\n", node: bodyNode},
                {value: "  ", node: bodyNode},
                {value: "printf", node: identifierNode},
                {value: "(", node: invocationNode},
                {value: "5", node: constantNode},
                {value: ")", node: invocationNode},
                {value: ";", node: statementNode},
                {value: "\n}", node: bodyNode}
            ];

            const expected = [
                {type: 'bracket', value: '{'},
                {type: 'whitespace', value: '\n'},
                {type: 'whitespace', value: '  '},
                {type: 'identifier', value: 'printf'},
                {type: 'bracket', value: '('},
                {type: 'numeral', value: '5'},
                {type: 'bracket', value: ')'},
                {type: 'semicolon', value: ';'},
                {type: 'whitespace', value: '\n'},
                {type: 'bracket', value: '}'},
            ];
            assert.deepEqual(highlightSyntax(symbols), expected);
        });
    });
});