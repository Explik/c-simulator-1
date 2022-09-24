import {
    flatten,
    declaration,
    addAssign,
    and,
    assign,
    intConstant,
    invoke,
    lessThanOrEqual,
    statement,
    iff,
    withLeft,
    withRight,
    isIdentifier,
    isBinary,
    isConstant,
    isExpression,
    isAnd,
    isTrue,
    numericalValue,
    isStatement,
    isEqual,
    isAssign,
    isAddAssign,
    withValue,
    isIncrement,
    hasLeft,
    hasRight,
    hasValue,
    isInvoke,
    withArguments,
    withArgument,
    isLessThanOrEqual, isFalse
} from "./tree";
import {call, mergeWithKey} from "ramda";

/** @typedef {Object} State
 *  @property {Object} expression
 *  @property {Object[]} variables
 *  @property {string} stdout
 */

/** @typedef {Object} StateChange
 *  @property {Object?} root
 *  @property {Object?} expression
 *  @property {Object[]?} variables
 *  @property {Object?} variable
 *  @property {string?} stdout
 */

/**
 *
 * @param {State} state
 * @param identifier
 * @returns {*}
 */
function getValue(state, identifier) {
    if (!state.variables.some(v => v.identifier === identifier)) throw new Error("Variable is not yet declared");
    const value = state.variables.find(v => v.identifier === identifier).value;
    if (!value) throw new Error("Variable has no value");
    return value;
}

function variable(identifier, constant) {
    if (!isIdentifier(identifier))
        throw new Error("identifier is not an identifier expression");
    if (!isConstant(constant))
        throw new Error("constant is not an constant expression");

    return { identifier, value: constant };
}


function isVariable(variable) {
    return isIdentifier(variable.identifier) && isConstant(variable.value);
}

/**
 *
 * @param {StateChange} state
 * @returns {State}
 */
function initialState(state) {
    const baseState = {
        stdout: "",
        variables: []
    }
    return mergeState(baseState, state);
}

/**
 *
 * @param {State} state
 * @param {StateChange} stateChange
 */
function mergeState(state, stateChange) {
    if (stateChange.expression && !isExpression(stateChange.expression))
        throw new Error("stateChange.expression is not an expression");
    if (stateChange.variables && stateChange.variables.some(v => !isVariable(v)))
        throw new Error("stateChange.variables contains non-variable");
    if (stateChange.variable && !isVariable(stateChange.variable))
        throw new Error("stateChange.variable is not a variable");

    const newState = {...state};

    // Absolute changes
    if (stateChange.root) newState.root = stateChange.root;
    if (stateChange.expression) newState.expression = stateChange.expression;
    if (stateChange.variables) newState.variables = stateChange.variables;

    // Relative changes 
    if (stateChange.variable) {
        const filteredVariables = state.variables.filter(v => v.identifier !== stateChange.variable.identifier);
        newState.variables = [...filteredVariables, stateChange.variable]
    } 
    if (stateChange.stdout) newState.stdout += stateChange.stdout;

    return newState;
}


function hasVariable(state, identifier) {
    return state.variables.some(v => v.identifier === identifier);
}

function isLeftConstant(state) {
    return isConstant(state.expression.left);
}

function isRightConstant(state) {
    return isConstant(state.expression.right);
}

function isValueConstant(state) {
    return isConstant(state.expression.value);
}

function areArgumentsConstant(state) {
    return state.expression.arguments.every(isConstant);
}

function evaluateLeft(state, callback) {
    if (!hasLeft(state.expression))
        throw new Error("state.expression has no left argument");

    const {expression, variables} = callback(state.expression.left);
    return mergeState(state, {
        expression: withLeft(state.expression, expression), variables
    });
}

function evaluateRight(state, callback) {
    if (!hasRight(state.expression))
        throw new Error("state.expression has no right argument");

    const {expression, variables} = callback(state.expression.right);
    return mergeState(state, {
        expression: withRight(state.expression, expression), variables
    });
}

function evaluateValue(state, callback) {
    if (!hasValue(state.expression))
        throw new Error("state.expression has no value argument");

    const {expression, variables} = callback(state.expression.value);
    return mergeState(state, {
        expression: withValue(state.expression, expression), variables
    });
}

function evaluateArguments(state, callback) {
    if (!isInvoke(state.expression))
        throw new Error("state.expression is not an invocation expression");

    const args = state.expression.arguments;
    const argIndex = args.findIndex(n => !isConstant(n));

    if (argIndex === -1)
        throw new Error("state.expression.arguments does not contain non-constant")

    const {expression, variables} = callback(args[argIndex]);
    return mergeState(state, {
        expression:withArgument(state.expression, expression, argIndex), variables
    });
}

function evaluateAndExpression(state, callback) {
    if (!isAnd(state.expression))
        throw new Error("state.expression is not an and expression");

    if (!isLeftConstant(state)) {
        return evaluateLeft(state, callback);
    }
    if (isFalse(state.expression.left)) {
        return mergeState(state, {
            expression: intConstant(false)
        });
    }
    if (!isRightConstant(state)) {
        return evaluateRight(state, callback);
    }
    return mergeState(state, {
        expression: intConstant(isTrue(state.expression.right))
    });
}

function evaluateLessThanOrEqualExpression(state, callback) {
    if (!isLessThanOrEqual(state.expression))
        throw new Error("state.expression is not an less-than-or-equal expression");

    if (!isLeftConstant(state)) {
        return evaluateLeft(state, callback);
    }
    if (!isRightConstant(state)) {
        return evaluateRight(state, callback);
    }
    return mergeState(state, {
        expression: intConstant(numericalValue(state.expression.left) <= numericalValue(state.expression.right))
    });
}

function evaluateEqualExpression(state, callback) {
    if (!isEqual(state.expression))
        throw new Error("state.expression is not an equal expression");

    if (!isLeftConstant(state)) {
        return evaluateLeft(state, callback);
    }
    if (!isRightConstant(state)) {
        return evaluateRight(state, callback);
    }
    return mergeState(state, {
        expression: intConstant(numericalValue(state.expression.left) === numericalValue(state.expression.right))
    });
}

function evaluateAssignExpression(state, callback) {
    if (!isAssign(state.expression))
        throw new Error("state.expression is not an assign expression");

    if (!hasVariable(state, state.expression.identifier))
        throw new Error("Identifier "+ state.expression.identifier.name + " has not been declared yet");

    if (!isValueConstant(state)) {
        return evaluateValue(state, callback);
    }
    return mergeState(state, {
        expression:  state.expression.value,
        variable: variable(state.expression.identifier, state.expression.value)
    });
}

function evaluateIncrementExpression(state, callback) {
    if (!isIncrement(state.expression))
        throw new Error("state.expression is not an increment expression");

    if (!hasVariable(state, state.expression.identifier))
        throw new Error("Identifier "+ state.expression.identifier.name + "has not been declared yet");

    const originalInt = numericalValue(getValue(state, state.expression.identifier));
    const incrementedInt = originalInt + 1;
    return mergeState(state, {
        expression:  intConstant(originalInt),
        variable: variable(state.expression.identifier, intConstant(incrementedInt))
    });
}

function evaluateAddAssignExpression(state, callback) {
    if (!isAddAssign(state.expression))
        throw new Error("state.expression is not an add-assign expression");

    if (!hasVariable(state, state.expression.identifier))
        throw new Error("Identifier " + state.expression.identifier.name + " has not been declared yet");

    if (!isValueConstant(state))
        return evaluateValue(state, callback);

    const originalInt = numericalValue(getValue(state, state.expression.identifier));
    const addedInt = originalInt + numericalValue(state.expression.value)
    return mergeState(state, {
        expression:  intConstant(addedInt),
        variable: variable(state.expression.identifier, intConstant(addedInt))
    });
}

function evaluateInvokeExpression(state, callback) {
    if (!isInvoke(state.expression))
        throw new Error("state.expression is not an invocation expression");

    if (!areArgumentsConstant(state.expression))
        return evaluateArguments(state, callback);

    if (isInvoke(state.expression, "printf")) {
        const args = state.expression.arguments;
        const printValue = args[0].value;
        if(args.length >= 1) printValue.replace("%d", args[1].value);

        return mergeState(state, {
            expression: undefined,
            stdout: printValue
        });
    }
    throw new Error("Unsupported function");
}

/**
 *
 * @param {State} state
 * @param callback
 * @returns {State}
 */
function evaluateExpression(state, callback) {
    if (isAnd(state.expression)) return evaluateAndExpression(state, callback);
    if (isLessThanOrEqual(state.expression)) return evaluateLessThanOrEqualExpression(state, callback);
    if (isEqual(state.expression)) return evaluateEqualExpression(state, callback);
    if (isAssign(state.expression)) return evaluateAssignExpression(state, callback);
    if (isIncrement(state.expression)) return evaluateIncrementExpression(state, callback);
    if (isAddAssign(state.expression)) return evaluateAddAssignExpression(state, callback);
    if (isInvoke(state.expression)) return evaluateInvokeExpression(state, callback);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

function evaluateExpressionRecursively(state) {
    return evaluateExpression(state, evaluateExpressionRecursively);
}

function findNextStatement(root, node, state) {
    const allStatements = flatten(root).filter(n => n.type !== "statement");
    const currentIndex = allStatements.indexOf(n => n === node);
    const parentIndex = currentIndex - 1;
    const parentNode = allStatements[parentIndex];

    if (node.statementType === "if") {
        if (state.currentExpression.condition !== "constant")
            throw new Error("Condition in if statement is not calculated");

        const isTrue = state.currentExpression.value.value !== 0;
        return isTrue ? node.body : findNextStatement(parentNode);
    }
    if (node.statementType === "for-loop") {
        return node.initializer;
    }

    if (parentNode === undefined) {
        return undefined;
    }
    if(parentNode.statementType === "block") {
        const allStatementsInBlock = flatten(parentNode).filter(n => n.type !== "statements");
        const currentIndexInBlock = allStatementsInBlock.indexOf(n => n === node);
        const isLastStatementInBlock = currentIndexInBlock === (allStatementsInBlock.length - 1);

        if (!isLastStatementInBlock) {
            return allStatementsInBlock[currentIndexInBlock + 1];
        }
        else return findNextStatement(parentNode);
    }
    if(parentNode.statementType === "if") {
        return findNextStatement(parentNode);
    }
    if(parentNode.statementType === "for") {
        if (node === parentNode.initializer){
            return parentNode.condition;
        }
        if (node === parentNode.condition) {
            const isRunning = state.currentExpression.value.value !== 0;
            return isRunning ? parentNode.body : findNextStatement(parentNode);
        }
        if (node === parentNode.update){
            return parentNode.condition;
        }
        if (node === parentNode.body) {
            return parentNode.update;
        }
        throw new Error("Logic error");
    }

    if (currentIndex === allStatements.length - 1) {
        return undefined;
    }
}


// evaluate(root)
// evaluate(root, state)
// evaluate(root, node, state)
function evaluateRecursively(root, node, state) {
    return evaluate(root, node, state, evaluateRecursively);
}

function evaluate(root, node, state, callback) {
    if (arguments.length === 1) {
        node = root;
        state = { variables: [], currentStatement: root, currentExpression: root, stdout: "" }
    }
    if (arguments.length === 2) {
        node = root;
        state = node;
    }


    // Replaces statement
    if (node.type === "statement" && node.statementType === "expression") {
        const hasFinishedEvaluating = node.value === undefined || node.value.type === "constant";

        if(!hasFinishedEvaluating) {
            const newState = evaluate(root, node.value, state);
            return { ...newState, currentExpression: statement(newState.currentExpression) };
        }
    }
    if (node.type === "statement" && node.operator === "declaration") {
        if (node.value.type !== "constant") {
            const newState = evaluate(root, node.value, state);
            return { ...newState, currentExpression: declaration(node.datatype, node.identifier, newState.value) };
        }
        if (state.variables.some(v => v.identifier === node.identifier))
            throw new Error("Variable is already declared");
        const variables = [
            ...state.variables,
            { identifier: node.identifier, value: node.value }
        ];
        return { ...state, currentExpression: node.value, variables: variables };
    }
    if (node.type === "statement" && node.statementType === "if") {
        if(node.condition.type !== "constant") {
            const newState = evaluate(root, node.condition, state);
            return { ...newState, currentExpression: iff(newState.currentExpression, node.body) };
        }
    }
    if (node.type === "statement") {
        const nextStatement = findNextStatement(root, node, state);
        return { ...state, currentStatement: nextStatement, currentExpression: nextStatement };
    }
}

export { evaluate, evaluateExpression, initialState, mergeState, variable }