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
    iff, withLeft, withRight, withValue, withArgument, withExpression, withCondition
} from "@/simulator/treeNodes\'";
import {
    evaluate,
    evaluateExpression,
    findNextStatement,
    initialState, isFullyEvaluated,
    mergeState,
    variable
} from "../src/simulator/evaluator";

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
        describe('expression statement', () => {
            it('should use callback on non-constant expression', () => {
                const constant1 = intConstant(5);
                const originalStatement = statement(identifier('a'));
                const evaluatedStatement = withExpression(originalStatement, constant1);
                const state = initialState({statement: originalStatement, expression: originalStatement});
                const callback = () => mergeState(state, {expression: constant1});

                const expectedState = mergeState(state, {expression: evaluatedStatement});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should not do anything on constant expression', () => {
                const statement1 = statement(intConstant(3));
                const state = initialState({statement: statement1, expression: statement1});
                const callback = () => { throw new Error("Invalid operation") };

                assert.deepEqual(evaluateExpression(state, callback), state);
            });
        });
        describe('declaration statement', () => {
            it('should use callback on non-constant expression', () => {
                const constant1 = intConstant(5);
                const identifier1 = identifier('a');
                const identifier2 = identifier('b');
                const originalStatement = intDeclaration(identifier2, identifier1);
                const evaluatedStatement = withValue(originalStatement, constant1);
                const state = initialState({statement: originalStatement, expression: originalStatement});
                const callback = () => mergeState(state, {expression: constant1});

                const expectedState = mergeState(state, {statement: originalStatement, expression: evaluatedStatement});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });
            it('should navigate to next statement in block on constant expression', () => {
                const statement1 = intDeclaration(identifier('b'), intConstant(5));
                const state = initialState({statement: statement1, expression: statement1});
                const callback = () => { throw new Error("Invalid operation") };

                assert.deepEqual(evaluateExpression(state, callback), state);
            });
        });
        describe('if statement', () => {
            it('should use callback on non-constant condition', () => {
                const constant1 = intConstant(true);
                const identifier1 = identifier('a');
                const originalStatement = iff(identifier1, nullStatement());
                const evaluatedStatement = withCondition(originalStatement, constant1);
                const state = initialState({statement: originalStatement, expression: originalStatement});
                const callback = () => mergeState(state, {expression: constant1});

                const expectedState = mergeState(state, {statement: originalStatement, expression: evaluatedStatement});
                assert.deepEqual(evaluateExpression(state, callback), expectedState);
            });

            it('should not do anything on constant condition', () => {
                const statement1a = statement(identifier('a'));
                const statement1 = iff(intConstant(true), statement1a);
                const state = initialState({statement: statement1, expression: statement1});
                const callback = () => {
                    throw new Error("Invalid operation")
                };

                assert.deepEqual(evaluateExpression(state, callback), state);
            });
        });
    });

    describe('findNextStatement', () => {
        it('should return next statement in root from root', () => {
            const statement1 = statement(identifier('a'));
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1), statement2);
        });
        it('should return next statement in root from single block', () => {
            const statement1a = statement(identifier('a'));
            const statement1 = block(statement1a);
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1a), statement2);
        });
        it('should return next statement in root from multiple block', () => {
            const statement1a = statement(identifier('a'));
            const statement1 = block(block(statement1a));
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1a), statement2);
        });
        it('should return next statement in root from multiple block 2', () => {
            const statement1a = statement(identifier('a'));
            const statement1b = statement(identifier('b'));
            const statement1 = block(block(statement1a, block(statement1b)));
            const statement2 = statement(identifier('c'));
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1b), statement2);
        });
        it('should return next statement in single block from root', () => {
            const statement1 = statement(identifier('a'));
            const statement2a = statement(identifier('b'));
            const statement2 = block(statement2a);
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1), statement2a);
        });
        it('should return next statement in multiple block from root', () => {
            const statement1 = statement(identifier('a'));
            const statement2a = statement(identifier('b'));
            const statement2 = block(statement2a);
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1), statement2a);
        });

        it('should return body from for true condition in if (non-block)', () => {
            const statement1a = intConstant(true);
            const statement1b = statement(identifier('b'));
            const statement1 = iff( statement1a, statement1b);
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1), statement1b);
        });
        it('should return body from for true condition in if (block)', () => {
            const statement1a = intConstant(true);
            const statement1b = statement(identifier('b'));
            const statement1c = block(statement1b);
            const statement1 = iff(statement1a, statement1c);
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1), statement1b);
        });
        it('should return next statement from for false condition in if', () => {
            const statement1a = intConstant(false);
            const statement1 = iff(statement1a, nullStatement());
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1), statement2);
        });

        it('should return update from body in for loop', () => {
            const statement1a = statement(identifier('a'));
            const statement1b = statement(identifier('b'));
            const statement1 = forLoop(nullStatement(), nullStatement(), statement1a, statement1b);
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1b), statement1a);
        });
        it('should return initializer from root with for loop', () => {
            const statement1 = statement(identifier('a'));
            const statement2a = statement(identifier('b'));
            const statement2 = forLoop(statement2a, nullStatement(), nullStatement(), nullStatement());
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1), statement2a);
        });
        it('should return condition from for initializer in for loop', () => {
            const statement1a = statement(identifier('a'));
            const statement1b = statement(identifier('b'));
            const statement1 = forLoop(statement1a, statement1b, nullStatement(), nullStatement());
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1a), statement1b);
        });
        it('should return body from for true condition in for loop (non-block)', () => {
            const statement1a = statement(intConstant(true));
            const statement1b = statement(identifier('b'));
            const statement1 = forLoop(nullStatement(), statement1a, nullStatement(), statement1b);
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1a), statement1b);
        });
        it('should return body from for true condition in for loop (block)', () => {
            const statement1a = statement(intConstant(true));
            const statement1b = statement(identifier('b'));
            const statement1c = block(statement1b);
            const statement1 = forLoop(nullStatement(), statement1a, nullStatement(), statement1c);
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1a), statement1b);
        });
        it('should return next statement from for false condition in for loop', () => {
            const statement1a = statement(intConstant(false));
            const statement1 = forLoop(nullStatement(), statement1a, nullStatement(), nullStatement());
            const statement2 = statement(identifier('b'));
            const root = [statement1, statement2];

            assert.deepEqual(findNextStatement(root, statement1a), statement2);
        });
        it('should return update from body in for loop', () => {
            const statement1a = statement(identifier('a'));
            const statement1b = statement(identifier('b'));
            const statement1 = forLoop(nullStatement(), nullStatement(), statement1a, statement1b);
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1b), statement1a);
        });
        it('should return condition from update in for loop', () => {
            const statement1a = statement(identifier('a'));
            const statement1b = statement(identifier('b'));
            const statement1 = forLoop(nullStatement(), statement1a, statement1b, nullStatement());
            const root = [statement1];

            assert.deepEqual(findNextStatement(root, statement1b), statement1a);
        });
    });

    describe('isFullyEvaluated', () => {
        it('should return false for non-constant expression statement', () => {
           const node = statement(identifier('i'));
           assert.isFalse(isFullyEvaluated(node));
        });
        it('should return true for constant expression statement', () => {
            const node = statement(intConstant(0));
            assert.isTrue(isFullyEvaluated(node));
        });

        it('should return false for non-constant declaration statement', () => {
           const node = intDeclaration(identifier('i'), identifier('j'));
           assert.isFalse(isFullyEvaluated(node));
        });
        it('should return true for constant declaration statement', () => {
           const node = intDeclaration(identifier('i'), intConstant(0));
           assert.isTrue(isFullyEvaluated(node));
        });

        it('should return false for non-constant condition in if statement', () => {
           const node = iff(identifier('i'), nullStatement());
           assert.isFalse(isFullyEvaluated(node));
        });
        it('should return true for constant condition in if statement', () => {
            const node = iff(intConstant(true), nullStatement());
            assert.isTrue(isFullyEvaluated(node));
        });
    });
});