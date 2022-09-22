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
import {call} from "ramda";

/** @typedef {Object} State
 *  @property {Object} expression
 *  @property {Object[]} variables
 *  @property {string} stdout
 */

function getValue(state, identifier) {
    if (state.variables.some(v => v.identifier === identifier)) throw new Error("Variable is not yet declared");
    return state.variables.find(v => v.identifier === identifier).value;
}

function isVariable(variable) {
    return isIdentifier(variable.identifier) && isConstant(variable.value);
}

/**
 *
 * @param {State} state
 * @param expr
 * @returns {State}
 */
function withExpression(state, expr) {
    if (!isExpression(expr)) throw new Error("expr is not an expression");
    return { ...state, expression: expr };
}

/**
 *
 * @param {State} state
 * @param expr
 * @param variable
 * @returns {State}
 */
function withExpressionAndVariable(state, expr, variable) {
    if (!isExpression(expr)) throw new Error("expr is not an expression");
    if (!isVariable(variable)) throw new Error("variable is not an variable");
    const variables = [...state.variables.filter(v => v.identifier !== variable.identifier), variable.identifier];
    return { ...state, expression: expr, variables: variables };
}

/**
 *
 * @param {State} state
 * @param expr
 * @param variables
 * @returns {State}
 */
function withExpressionAndVariables(state, expr, variables) {
    if (!isExpression(expr)) throw new Error("expr is not an expression");
    if (variables.some(v => !isVariable(v))) throw new Error("variables contains non-variable");
    return { ...state, expression: expr, variables: variables };
}

/**
 *
 * @param {State} state
 * @param expr
 * @param output
 * @returns {State}
 */
function withExpressionAndStdout(state, expr, output) {
    if (!isExpression(expr)) throw new Error("expr is not an expression");
    if (typeof output !== "string") throw new Error("output is not a string");
    const stdout = state.stdout + output;
    return { ...state, expression: expr, stdout: stdout };
}

/**
 *
 * @param {State} state
 * @param statement
 * @returns {State}
 */
function withStatement(state, statement) {
    if (!isStatement(statement)) throw new Error("statement is not a statement");
    return { ...state, currentStatement: statement };
}

/**
 *
 * @param {Object} expr
 * @returns {State}
 */
function initialState(expr) {
    return {
        expression: expr,
        variables: [],
        stdout: ""
    };
}

function hasVariable(state, identifier) {
    return false;
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
    return withExpressionAndVariables(state, withLeft(state.expression, expression), variables);
}

function evaluateRight(state, callback) {
    if (!hasRight(state.expression))
        throw new Error("state.expression has no right argument");

    const {expression, variables} = callback(state.expression.right);
    return withExpressionAndVariables(state, withRight(state.expression, expression), variables);
}

function evaluateValue(state, callback) {
    if (!hasValue(state.expression))
        throw new Error("state.expression has no value argument");

    const {expression, variables} = callback(state.expression.value);
    return withExpressionAndVariables(state, withValue(state.expression, expression), variables);
}

function evaluateArguments(state, callback) {
    if (!isInvoke(state.expression))
        throw new Error("state.expression is not an invocation expression");

    const args = state.expression.arguments;
    const argIndex = args.findIndex(n => !isConstant(n));

    if (argIndex === -1)
        throw new Error("state.expression.arguments does not contain non-constant")

    const {expression, variables} = callback(args[argIndex]);
    return withExpressionAndVariables(state, withArgument(state.expression, expression, argIndex), variables);
}

function evaluateAndExpression(state, callback) {
    if (!isAnd(state.expression))
        throw new Error("state.expression is not an and expression");

    if (!isLeftConstant(state)) {
        return evaluateLeft(state, callback);
    }
    if (isFalse(state.expression.left)) {
        return withExpression(state, intConstant(0));
    }
    if (!isRightConstant(state)) {
        return evaluateRight(state, callback);
    }
    return withExpression(state, intConstant(isTrue(state.expression.right)));
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
    return withExpression(state, intConstant(numericalValue(state.expression.left) <= numericalValue(state.expression.right)));
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
    return withExpression(state, intConstant(numericalValue(state.expression.left) === numericalValue(state.expression.right)));
}

function evaluateAssignExpression(state, callback) {
    if (!isAssign(state.expression))
        throw new Error("state.expression is not an assign expression");

    if (!hasVariable(state, state.expression.identifier))
        throw new Error("Identifier "+ state.expression.identifier.name + "has not been declared yet");

    if (!isValueConstant(state)) {
        return evaluateValue(state);
    }
    return withExpressionAndVariable(state, state.expression.value, state.expression);
}

function evaluateIncrementExpression(state, callback) {
    if (!isAssign(state.expression))
        throw new Error("state.expression is not an increment expression");

    if (!hasVariable(state, state.expression.identifier))
        throw new Error("Identifier "+ state.expression.identifier.name + "has not been declared yet");

    const expression = intConstant(numericalValue(state.expression.identifier));
    const variable = intConstant(numericalValue(getValue(state.expression.identifier)) + 1);
    return withExpressionAndVariable(state, expression, variable);
}

function evaluateAddAssignExpression(state, callback) {
    if (!isAddAssign(state.expression))
        throw new Error("state.expression is not an add-assign expression");

    if (!hasVariable(state, state.expression.identifier))
        throw new Error("Identifier " + state.expression.identifier.name + " has not been declared yet");

    if (!isValueConstant(state))
        return evaluateValue(state, callback);

    const expression = intConstant(numericalValue(getValue(state.expression.identifier)) + numericalValue(state.expression.right))
    return withExpressionAndVariable(state, expression, expression);
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

        return withExpressionAndStdout(state, undefined, printValue);
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

export { evaluate, evaluateExpression, initialState, withExpression }