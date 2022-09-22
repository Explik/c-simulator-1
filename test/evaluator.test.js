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
    iff, withLeft, withRight
} from "../src/tree";
import {evaluate, evaluateExpression, initialState, withExpression} from "../src/evaluator";

describe('evaluator', () => {
    describe('evaluateExpression', () => {
        describe('and expression', () => {
            it('should use callback on non-constant left', () => {
                const constant = intConstant(5);
                const root = and(identifier('l'), identifier('r'));
                const state = initialState(root);
                const callback = () => withExpression(state, constant);

                const expectedRoot = withLeft(root, constant);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right when left is constant', () => {
                const constant = intConstant(5);
                const root = and(intConstant(2), identifier('r'));
                const state = initialState(root);
                const callback = () => withExpression(state, constant);

                const expectedRoot = withRight(root, constant);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is 0', () => {
                const root = and(intConstant(0), identifier('r'));
                const state = initialState(root);
                const callback = () => {
                    throw new Error("Invalid operation")
                };

                const expectedRoot = intConstant(0);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is 1 and right is 0', () => {
                const root = and(intConstant(1), intConstant(0));
                const state = initialState(root);
                const callback = () => {
                    throw new Error("Invalid operation")
                };

                const expectedRoot = intConstant(0);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 1 when left is 1 and right is 1', () => {
                const root = and(intConstant(1), intConstant(1));
                const state = initialState(root);
                const callback = () => {
                    throw new Error("Invalid operation")
                };

                const expectedRoot = intConstant(1);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('less-than-or-equal expression', () => {
            it('should use callback on non-constant left', () => {
                const constant = intConstant(5);
                const root = lessThanOrEqual(identifier('l'), identifier('r'));
                const state = initialState(root);
                const callback = () => withExpression(state, constant);

                const expectedRoot = withLeft(root, constant);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right', () => {
                const constant = intConstant(5);
                const root = lessThanOrEqual(intConstant(2), identifier('r'));
                const state = initialState(root);
                const callback = () => withExpression(state, constant);

                const expectedRoot = withRight(root, constant);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is larger than right', () => {
                const root = lessThanOrEqual(intConstant(7), intConstant(6));
                const state = initialState(root);
                const callback = () => { throw new Error("Invalid operation") };

                const expectedRoot = intConstant(0);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is equal to right', () => {
                const root = lessThanOrEqual(intConstant(6), intConstant(6));
                const state = initialState(root);
                const callback = () => { throw new Error("Invalid operation") };

                const expectedRoot = intConstant(1);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 1 when left is smaller than right', () => {
                const root = lessThanOrEqual(intConstant(6), intConstant(7));
                const state = initialState(root);
                const callback = () => { throw new Error("Invalid operation") };

                const expectedRoot = intConstant(1);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('equal expression', () => {
            it('should use callback on non-constant left', () => {
                const constant = intConstant(5);
                const root = equal(identifier('l'), identifier('r'));
                const state = initialState(root);
                const callback = () => withExpression(state, constant);

                const expectedRoot = withLeft(root, constant);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right', () => {
                const constant = intConstant(5);
                const root = equal(intConstant(2), identifier('r'));
                const state = initialState(root);
                const callback = () => withExpression(state, constant);

                const expectedRoot = withRight(root, constant);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is not equal to right', () => {
                const root = equal(intConstant(2), intConstant(3));
                const state = initialState(root);
                const callback = () => { throw new Error("Invalid operation") };

                const expectedRoot = intConstant(0);
                const expectedState = initialState(expectedRoot);
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should return 0 when left is equal right', () => {
                const root = equal(intConstant(2), intConstant(2));
                const state = initialState(root);
                const callback = () => { throw new Error("Invalid operation") };

                const expectedRoot = intConstant(1);
                const expectedState = initialState(expectedRoot);
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