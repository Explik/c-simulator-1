import { assert } from 'chai';
import {
    declaration,
    identifier,
    intConstant,
    intDeclaration,
    stringConstant,
    stringDeclaration,
    and,
    lessThanOrEqual, assign, addAssign, increment, invoke, equal, statement, forLoop, block, nullStatement,
    iff, withLeft, withRight, withValue
} from "../src/tree";
import {evaluate, evaluateExpression, initialState, variable, withExpression} from "../src/evaluator";

describe('evaluator', () => {
    describe('evaluateExpression', () => {
        describe('and expression', () => {
            it('should use callback on non-constant left', () => {
                const constant = intConstant(5);
                const expression = and(identifier('l'), identifier('r'));
                const state = initialState({expression});
                const callback = () => withExpression(state, constant);

                const expectedExpression = withLeft(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right when left is constant', () => {
                const constant = intConstant(5);
                const expression = and(intConstant(2), identifier('r'));
                const state = initialState({expression});
                const callback = () => withExpression(state, constant);

                const expectedExpression = withRight(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is 0', () => {
                const expression = and(intConstant(0), identifier('r'));
                const state = initialState({expression});
                const callback = () => {
                    throw new Error("Invalid operation")
                };

                const expectedExpression = intConstant(0);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is 1 and right is 0', () => {
                const expression = and(intConstant(1), intConstant(0));
                const state = initialState({expression});
                const callback = () => {
                    throw new Error("Invalid operation")
                };

                const expectedExpression = intConstant(0);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 1 when left is 1 and right is 1', () => {
                const expression = and(intConstant(1), intConstant(1));
                const state = initialState({expression});
                const callback = () => {
                    throw new Error("Invalid operation")
                };

                const expectedExpression = intConstant(1);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('less-than-or-equal expression', () => {
            it('should use callback on non-constant left', () => {
                const constant = intConstant(5);
                const expression = lessThanOrEqual(identifier('l'), identifier('r'));
                const state = initialState({expression});
                const callback = () => withExpression(state, constant);

                const expectedExpression = withLeft(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right', () => {
                const constant = intConstant(5);
                const expression = lessThanOrEqual(intConstant(2), identifier('r'));
                const state = initialState({expression});
                const callback = () => withExpression(state, constant);

                const expectedExpression = withRight(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is larger than right', () => {
                const expression = lessThanOrEqual(intConstant(7), intConstant(6));
                const state = initialState({expression});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedExpression = intConstant(0);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is equal to right', () => {
                const expression = lessThanOrEqual(intConstant(6), intConstant(6));
                const state = initialState({expression});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedExpression = intConstant(1);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 1 when left is smaller than right', () => {
                const expression = lessThanOrEqual(intConstant(6), intConstant(7));
                const state = initialState({expression});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedExpression = intConstant(1);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('equal expression', () => {
            it('should use callback on non-constant left', () => {
                const constant = intConstant(5);
                const expression = equal(identifier('l'), identifier('r'));
                const state = initialState({expression});
                const callback = () => withExpression(state, constant);

                const expectedExpression = withLeft(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right', () => {
                const constant = intConstant(5);
                const expression = equal(intConstant(2), identifier('r'));
                const state = initialState({expression});
                const callback = () => withExpression(state, constant);

                const expectedExpression = withRight(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is not equal to right', () => {
                const expression = equal(intConstant(2), intConstant(3));
                const state = initialState({expression});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedExpression = intConstant(0);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is equal right', () => {
                const expression = equal(intConstant(2), intConstant(2));
                const state = initialState({expression});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedExpression = intConstant(1);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('assign operator', () => {
            it('should use callback on non-constant value', () => {
                const name = identifier('n');
                const value = intConstant(5);
                const expression = assign(name, identifier('v'));
                const state = initialState({expression, variables: [variable(name, value)]});
                const callback = () => withExpression(state, value);

                const expectedExpression = withValue(expression, value);
                const expectedState = initialState({expression: expectedExpression, variables: [variable(name, value)]});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should change variable value and return value', () => {
                const name = identifier('n');
                const value = intConstant(3);
                const expression = assign(name, value);
                const state = initialState({expression, variables: [variable(name, value)]});
                const callback = () => { throw new Error("Invalid operation") };

                const newValue = intConstant(4);
                const expectedState = initialState({expression: newValue, variables: [variable(name, newValue)]});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
    });

    describe('zzz', () => {
        it('should evaluate constant statement (step 1)', () => {
            const constantNode1 = intConstant(0);
            const constantNode2 = intConstant(1);
            const andNode = and(constantNode1, constantNode2);
            const statementNode = statement(andNode);

            const expectedState = {
                variables: [],
                stdout: "",
                currentStatement: statementNode,
                currentExpression: statement(intConstant(0)),
            };
            assert.deepEqual(evaluate(statementNode), expectedState);
        });

        it('should evaluate constant statement (step 2)', () => {
            const constantNode1 = intConstant(0);
            const constantNode2 = intConstant(1);
            const andNode = and(constantNode1, constantNode2);
            const statementNode = statement(andNode);

            const initialState = {
                variables: [],
                stdout: "",
                currentStatement: statementNode,
                currentExpression: statement(intConstant(0)),
            };

            const expectedState = {
                variables: [],
                stdout: "",
                currentStatement: undefined,
                currentExpression: undefined
            };
            assert.deepEqual(evaluate(statementNode, initialState), expectedState);
        });

        it('should evaluate constant declaration', () => {
            const identifierNode = identifier("name");
            const constantNode = intConstant(5);
            const declarationNode = intDeclaration(identifierNode, constantNode);

            const expectedState = {
                variables: [
                    {identifier: identifierNode, value: constantNode}
                ],
                currentExpression: undefined,
                currentStatement: undefined
            };
            assert.deepEqual(evaluate(declarationNode), expectedState);
        });

        it('should evaluate calculated declaration (step 1)', () => {
            const identifierNode = identifier("name");
            const constantNode1 = intConstant(0);
            const constantNode2 = intConstant(1);
            const andNode = and(constantNode1, constantNode2);
            const declarationNode = intDeclaration(identifierNode, andNode);

            const expectedState = {
                variables: [],
                currentExpression: intDeclaration(identifierNode, intConstant(0)),
                currentStatement: declarationNode
            };
            assert.deepEqual(evaluate(declarationNode), expectedState);
        });

        it('should evaluate calculated declaration (step 2)', () => {
            const identifierNode = identifier("name");
            const constantNode1 = intConstant(0);
            const constantNode2 = intConstant(1);
            const andNode = and(constantNode1, constantNode2);
            const declarationNode = intDeclaration(identifierNode, andNode);

            const initialState = {
                variables: [],
                currentExpression: intDeclaration(identifierNode, intConstant(0)),
                currentStatement: declarationNode
            };

            const expectedState = {
                variables: [
                    {identifier: identifierNode, value: intConstant(0)}
                ],
                currentExpression: undefined,
                currentStatement: undefined
            };
            assert.deepEqual(evaluate(declarationNode, initialState), expectedState);
        });
    });
});