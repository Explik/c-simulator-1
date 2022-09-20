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
    isAddAssign, withValue, isIncrement, hasLeft, hasRight, hasValue, isInvoke, withArguments, withArgument
} from "./tree";

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

function hasVariable(state, identifier) {
    return false;
}

/**
 *
 * @param {State} state
 * @param callback
 * @returns {State}
 */
function evaluateExpression(state, callback) {
    let applyCallback = (node) => callback(withExpression(state, node));

    // Replaces variables, operands and arguments with constants
    if (isIdentifier(state.expression)) {
        const variable = state.variables.find(v => v.identifier === node);
        if (!variable) throw new Error("Unrecognized identifier " + node.name);
        return withExpressionAndVariables(state.expression, variable.value, state.variables);
    }
    if (hasLeft(state.expression) && !isConstant(state.expression.left)) {
        const {expression, variables} = applyCallback(state.expression.left);
        return withExpressionAndVariables(state, withLeft(state.expression, expression), variables);
    }
    if (hasRight(state.expression) && !isConstant(state.expression.right)) {
        const {expression, variables} = applyCallback(state.expression.right);
        return withExpressionAndVariables(state, withLeft(state.expression, expression), variables);
    }
    if (hasValue(state.expression) && !isConstant(state.expression.value)) {
        const {expression, variables} = applyCallback(state.expression.value);
        return withExpressionAndVariables(state, withValue(state.expression, expression), variables);
    }
    if (isInvoke(state.expression)) {
        const args = state.expression.arguments;
        const argIndex = args.findIndex(n => !isConstant(n));

        if (argIndex !== -1) {
            const {expression, variables} = applyCallback(args[argIndex]);
            return withExpressionAndVariables(state, withArgument(state.expression, expression, argIndex), variables);
        }
    }

    // Replaces operations with constants
    if (isAnd(state.expression)) {
        const expression = intConstant(isTrue(state.expression.left) && isTrue(state.expression.right) ? 1 : 0);
        return withExpression(state, expression);
    }
    if (lessThanOrEqual(state.expression)) {
        const expression = intConstant(numericalValue(state.expression.left) <= numericalValue(state.expression.right) ? 1 : 0);
        return withExpression(state, expression);
    }
    if (isEqual(state.expression)) {
        const expression = intConstant(numericalValue(state.expression.left) === numericalValue(state.expression.right) ? 1 : 0);
        return withExpression(state, expression);
    }
    if (isAssign(state.expression)) {
        if (!hasVariable(state, state.expression.identifier))
            throw new Error("Identifier " + JSON.stringify(state.expression.identifier) + "has not been declared yet");

        return withExpressionAndVariable(state, state.expression.value, state.expression);
    }
    if (isAddAssign(state.expression)) {
        if (!hasVariable(state, state.expression.identifier))
            throw new Error("Identifier " + JSON.stringify(state.expression.identifier) + "has not been declared yet");

        const expression = intConstant(numericalValue(getValue(state.expression.identifier)) + numericalValue(state.expression.right))
        return withExpressionAndVariable(state, expression, expression);
    }
    if (isIncrement(state.expression)) {
        if (!hasVariable(state, state.expression.identifier))
            throw new Error("Identifier " + JSON.stringify(state.expression.identifier) + "has not been declared yet");

        const expression = intConstant(numericalValue(getValue(state.expression.identifier)));
        const variable = intConstant(numericalValue(getValue(state.expression.identifier)) + 1);
        return withExpressionAndVariable(state, expression, variable);
    }
    if (isInvoke(state.expression, "printf")) {
        const args = state.expression.arguments;
        const printValue = args[0].value;
        if(args.length >= 1) printValue.replace("%d", args[1].value);

        return withExpressionAndStdout(state, undefined, printValue);
    }

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

export { evaluate }