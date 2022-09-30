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
    iff, withLeft, withRight, withValue, withArgument
} from "../src/tree";
import {
    evaluate,
    evaluateExpression,
    findNextStatement,
    initialState,
    mergeState,
    variable
} from "../src/evaluator";

describe('evaluator', () => {
    describe('evaluateExpression', () => {
        describe('and expression', () => {
            it('should use callback on non-constant left', () => {
                const constant = intConstant(5);
                const expression = and(identifier('l'), identifier('r'));
                const state = initialState({expression});
                const callback = () => mergeState(state, {expression: constant});

                const expectedExpression = withLeft(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right when left is constant', () => {
                const constant = intConstant(5);
                const expression = and(intConstant(2), identifier('r'));
                const state = initialState({expression});
                const callback = () => mergeState(state, {expression: constant});

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
                const callback = () => mergeState(state, {expression: constant});

                const expectedExpression = withLeft(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right', () => {
                const constant = intConstant(5);
                const expression = lessThanOrEqual(intConstant(2), identifier('r'));
                const state = initialState({expression});
                const callback = () => mergeState(state, {expression: constant});

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
                const callback = () => mergeState(state, {expression: constant});

                const expectedExpression = withLeft(expression, constant);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant right', () => {
                const constant = intConstant(5);
                const expression = equal(intConstant(2), identifier('r'));
                const state = initialState({expression});
                const callback = () => mergeState(state, {expression: constant});

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
                const state = initialState({expression, variable: variable(name, value)});
                const callback = () => mergeState(state, {expression: value});

                const expectedExpression = withValue(expression, value);
                const expectedState = initialState({expression: expectedExpression, variable: variable(name, value)});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should change variable value and return value', () => {
                const name = identifier('n');
                const oldValue = intConstant(3);
                const newValue = intConstant(4);
                const expression = assign(name, newValue);
                const state = initialState({expression, variable: variable(name, oldValue)});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedState = initialState({expression: newValue, variable: variable(name, newValue)});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('add-assign operator', () => {
            it('should use callback on non-constant value', () => {
                const name = identifier('n');
                const value = intConstant(2);
                const expression = addAssign(name, identifier('v'));
                const state = initialState({expression, variables: [variable(name, value)]});
                const callback = () => mergeState(state, {expression: value});

                const expectedExpression = withValue(expression, value);
                const expectedState = initialState({expression: expectedExpression, variable: variable(name, value)});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should change variable value and return added value', () => {
                const name = identifier('n');
                const oldValue = intConstant(3);
                const exprValue = intConstant(4);
                const addValue = intConstant(7);
                const expression = addAssign(name, exprValue);
                const state = initialState({expression, variable: variable(name, oldValue)});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedState = initialState({expression: addValue, variable: variable(name, addValue)});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('increment operator', () => {
            it('should increment variable value and return original value', () => {
                const name = identifier('n');
                const oldValue = intConstant(3);
                const newValue = intConstant(4);
                const expression = increment(name);
                const state = initialState({expression, variable: variable(name, oldValue)});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedState = initialState({expression: oldValue, variable: variable(name, newValue)});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
        describe('invoke printf()', () => {
            it('should use callback on non-constant first argument', () => {
                const name = identifier('printf');
                const arg1 = identifier("arg1");
                const arg2 = identifier("arg2");
                const constant = stringConstant("\"%d\"");
                const expression = invoke(name, arg1, arg2);
                const state = initialState({expression});
                const callback = () => mergeState(state, {expression: constant});

                const expectedExpression = withArgument(expression, constant, 0);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should use callback on non-constant second argument when first argument is constant', () => {
                const name = identifier('printf');
                const arg1 = stringConstant("%d");
                const arg2 = identifier("arg2");
                const constant = intConstant(5);
                const expression = invoke(name, arg1, arg2);
                const state = initialState({expression});
                const callback = () => mergeState(state, {expression: constant});

                const expectedExpression = withArgument(expression, constant, 1);
                const expectedState = initialState({expression: expectedExpression});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should append stdout for string literals', () => {
                const name = identifier('printf');
                const arg = stringConstant("Hello world");
                const expression = invoke(name, arg);
                const state = initialState({expression});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedState = initialState({expression: undefined, stdout: "Hello world"});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should append stdout for %d', () => {
                const name = identifier('printf');
                const arg1 = stringConstant("%d");
                const arg2 = intConstant(5);
                const expression = invoke(name, arg1, arg2);
                const state = initialState({expression});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedState = initialState({expression: undefined, stdout: "5"});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
    });

    describe('findNextStatement', () => {
        it('should return next statement in root from root', () => {
            const statement1 = statement(identifier('a'));
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];
            const state = initialState({root, statement: statement1});

            assert.deepEqual(findNextStatement(state), statement2);
        });
        it('should return next statement in root from single block', () => {
            const statement1 = block(statement(identifier('a')));
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];
            const state = initialState({root, statement: statement1});

            assert.deepEqual(findNextStatement(state), statement2);
        });
        it('should return next statement in root from multiple block', () => {
            const statement1 = block(block(statement(identifier('a'))));
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];
            const state = initialState({root, statement: statement1});

            assert.deepEqual(findNextStatement(state), statement2);
        });
        it('should return next statement in root from multiple block 2', () => {
            const statement1a = statement(identifier('a'));
            const statement1b = statement(identifier('b'));
            const statement1 = block(block(statement1a, block(statement1b)));
            const statement2 = statement(identifier('c'));
            const root = [statement1, statement2];
            const state = initialState({root, statement: statement1});

            assert.deepEqual(findNextStatement(state), statement2);
        });
        it('should return next statement in single block from root', () => {
            const statement1 = statement(identifier('a'));
            const statement2 = block(statement(identifier('b')));
            const root = [statement1, statement2];
            const state = initialState({root, statement: statement1});

            assert.deepEqual(findNextStatement(state), statement2);
        });
        it('should return next statement in multiple block from root', () => {
            const statement1 = statement(identifier('a'));
            const statement2 = block(statement(identifier('b')));
            const root = [statement1, statement2];
            const state = initialState({root, statement: statement1});

            assert.deepEqual(findNextStatement(state), statement2);
        });
    });

    describe('evaluteStatement', () => {
       describe('expression statement', () => {
           it('should use callback on non-constant expression', () => {
               const originalStatement = statement(identifier('a'));
               const evaluatedStatement = withExpression(originalStatement, intConstant(5));
               const state = initialState({statement: originalStatement, expression: originalStatement});
               const callback = () => mergeState(state, {expression: evaluatedStatement});

               const expectedState = mergeState(state, {statement: originalStatement, expression: evaluatedStatement});
               assert.deepEqual(evaluateExpression(state, callback), expectedState);
           });

           it('should navigate to next statement in block on constant expression', () => {
               const statement1 = statement(intConstant(3));
               const statement2 = statement(identifier('b'));
               const root = [statement1, statement2];
               const state = initialState({root, statement: statement1, expression: statement1});
               const callback = () => { throw new Error("Invalid operation") };

               const expectedState = mergeState(state, {statement: statement2, expression: statement2});
               assert.deepEqual(evaluateExpression(state, callback), expectedState);
           });

           it('should navigate to end on constant expression and last statement', () => {
               const statement1 = statement(intConstant(3));
               const root = [statement1];
               const state = initialState({root, statement: statement1, expression: statement1});
               const callback = () => { throw new Error("Invalid operation") };

               const expectedState = mergeState(state, {statement: undefined, expression: undefined});
               assert.deepEqual(evaluateExpression(state, callback), expectedState);
           });
       });
        describe('declaration statement', () => {
            it('should use callback on non-constant expression', () => {
                const identifier1 = identifier('a');
                const identifier2 = identifier('b');
                const originalStatement = statement(declaration(identifier2, identifier1));
                const evaluatedStatement = withExpression(originalStatement, declaration(identifier2, intConstant(5)));
                const state = initialState({statement: originalStatement, expression: originalStatement});
                const callback = () => mergeState(state, {expression: evaluatedStatement});

                const expectedState = mergeState(state, {statement: originalStatement, expression: evaluatedStatement});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });

            it('should navigate to next statement in block on constant expression', () => {
                const identifier2 = identifier('b');
                const statement1 = statement(declaration(identifier2, intConstant(5)));
                const statement2 = statement(identifier2);
                const root = [statement1, statement2];
                const state = initialState({root, statement: statement1, expression: statement1});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedState = mergeState(state, {statement: statement2, expression: statement2});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });

            it('should navigate to end on constant expression and last statement', () => {
                const statement1 = statement(intConstant(3));
                const block1 = [statement1];
                const state = initialState({root, statement: statement1, expression: statement1});
                const callback = () => { throw new Error("Invalid operation") };

                const expectedState = mergeState(state, {statement: undefined, expression: undefined});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
        });
    });
});