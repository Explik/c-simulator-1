import {
    flatten,
    intConstant,
    withLeft,
    withRight,
    isIdentifier,
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
    withArgument,
    isLessThanOrEqual,
    isFalse,
    isIff,
    isExpressionStatement,
    isDeclaration,
    isForLoop,
    isBlock,
    withCondition
} from "./tree";

/** @typedef {Object} State
 *  @property {Object} expression
 *  @property {Object[]} variables
 *  @property {string} stdout
 */

/** @typedef {Object} StateChange
 *  @property {Object[]?} root
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
    if (stateChange.root && !Array.isArray(stateChange.root))
        throw new Error("stateChange.expression is not an array");
    if (stateChange.root && stateChange.root.some(v => !isStatement(v)))
        throw new Error("stateChange.variables contains non-statement");
    if (stateChange.expression && !(isExpression(stateChange.expression) || isStatement(stateChange.expression)))
        throw new Error("stateChange.expression is not an expression or statement");
    if (stateChange.variables && stateChange.variables.some(v => !isVariable(v)))
        throw new Error("stateChange.variables contains non-variable");
    if (stateChange.variable && !isVariable(stateChange.variable))
        throw new Error("stateChange.variable is not a variable");

    const newState = {...state};

    // Absolute changes
    if (stateChange.root) newState.root = stateChange.root;
    // eslint-disable-next-line
    if (stateChange.statement || stateChange.hasOwnProperty("statement")) newState.statement = stateChange.statement;
    // eslint-disable-next-line
    if (stateChange.expression || stateChange.hasOwnProperty("expression")) newState.expression = stateChange.expression;
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
        expression: withValue(state.expression, expression),
        variables
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

//eslint-disable-next-line
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

    if (!areArgumentsConstant(state))
        return evaluateArguments(state, callback);

    if (isInvoke(state.expression, "printf")) {
        const args = state.expression.arguments;
        let printValue = args[0].value;

        if(args.length > 1)
            printValue = printValue.replace("%d", args[1].value);

        return mergeState(state, {
            expression: undefined,
            stdout: printValue
        });
    }
    throw new Error("Unsupported function");
}

function evaluateExpressionStatement(state, callback) {
    if (isConstant(state.expression.value))
        return state;

    const {expression, variables} = callback(state.expression.value);
    return mergeState(state, {
        expression: withValue(state.expression, expression),
        variables
    });
}

function evaluateDeclarationStatement(state, callback) {
    if (isConstant(state.expression.value))
        return state;

    let {expression, variables} = callback(state.expression.value);
    if (isConstant(expression)) variables.push(variable(state.expression.identifier, expression));
    return mergeState(state, {
        expression: withValue(state.expression, expression),
        variables
    });
}

function evaluateIffStatement(state, callback) {
    if (isConstant(state.expression.condition))
        return state;

    let {expression, variables} = callback(state.expression.condition);
    return mergeState(state, {
        expression: withCondition(state.expression, expression),
        variables
    });
}

/**
 *
 * @param {State} state
 * @param callback
 * @returns {*|{variables: Object[], expression: Object, stdout: string}}
 */
function evaluateExpression(state, callback) {
    // Expressions
    if (isAnd(state.expression)) return evaluateAndExpression(state, callback);
    if (isLessThanOrEqual(state.expression)) return evaluateLessThanOrEqualExpression(state, callback);
    if (isEqual(state.expression)) return evaluateEqualExpression(state, callback);
    if (isAssign(state.expression)) return evaluateAssignExpression(state, callback);
    if (isIncrement(state.expression)) return evaluateIncrementExpression(state, callback);
    if (isAddAssign(state.expression)) return evaluateAddAssignExpression(state, callback);
    if (isInvoke(state.expression)) return evaluateInvokeExpression(state, callback);

    // Statements
    if (isExpressionStatement(state.expression)) return evaluateExpressionStatement(state, callback);
    if (isDeclaration(state.expression)) return evaluateDeclarationStatement(state, callback);
    if (isIff(state.expression)) return evaluateIffStatement(state, callback);

    throw new Error("Unsupported node " + JSON.stringify(state.expression));
}

//eslint-disable-next-line
function evaluateExpressionRecursively(state) {
    return evaluateExpression(state, evaluateExpressionRecursively);
}

function isCompositeStatement(statement) {
    return isBlock(statement) || isForLoop(statement);
}

function findParentStatement(root, statement) {
    //console.log(root);

    if (!Array.isArray(root))
        throw new Error("Root is not an array");

    // Verifies that statement has parent
    const indexInRoot = root.findIndex(s => s === statement);
    if(indexInRoot !== -1) {
        return undefined;
    }

    // Attempts to find parent
    const statements = root.flatMap(flatten);
    //console.log(statements);
    //console.log(statement);
    //console.log(statements);
    const indexInStatements = statements.findIndex(s => s === statement);
    //console.log("indexOfStatements: "+indexInStatements);
    if (indexInStatements === -1) throw new Error("Statement is not located in root tree");

    const priorStatements = statements.slice(0, indexInStatements);
    //console.log(priorStatements);
    const priorCompositeStatements = priorStatements.filter(s => isIff(s) || isBlock(s) || isForLoop(s));
    //console.log(priorCompositeStatements);

    for(let i = priorCompositeStatements.length - 1; i >= 0; i--) {
        const compositeStatement = priorCompositeStatements[i];
        //console.log(compositeStatement);

        //if (isBlock(compositeStatement)) console.log(compositeStatement.statements);

        if (isIff(compositeStatement) && compositeStatement.body === statement)
            return compositeStatement;
        if (isBlock(compositeStatement) && compositeStatement.statements.some(s => s === statement))
            return compositeStatement;
        if (isForLoop(compositeStatement)) {
            if (compositeStatement.initializer === statement) return compositeStatement;
            if (compositeStatement.condition === statement) return compositeStatement;
            if (compositeStatement.update === statement) return compositeStatement;
            if (compositeStatement.body === statement) return compositeStatement;
        }
    }
    throw new Error("Unable to determine parent");
}

function findNextStatement(root, node, isGoingUp) {
    isGoingUp = !!isGoingUp;

    if (!Array.isArray(root))
        throw new Error("Root is not an array");

    // Going down for recursion
    if (!isGoingUp && isBlock(node) && node.statements.length > 0)
        return isBlock(node.statements[0]) ? findNextStatement(root, node.statements[0]) : node.statements[0];
    if (!isGoingUp && isForLoop(node))
        return node.initializer;
    if (!isGoingUp && isIff(node)) {
        if (isTrue(node.condition))
            return isCompositeStatement(node.body) ? findNextStatement(root, node.body) : node.body;
        else
            return findNextStatement(root, node, true);
    }

    // Finding next statement in root
    const indexInRoot = root.findIndex(s => s === node);
    if (indexInRoot !== -1) {
        if (indexInRoot === root.length - 1) {
            return undefined;
        }
        const nextStatementInRoot = root[indexInRoot + 1];
        return isCompositeStatement(nextStatementInRoot) ? findNextStatement(root, nextStatementInRoot) : nextStatementInRoot;
    }

    // Finding next statement for specific parent
    const parentNode = findParentStatement(root, node);
    if (!parentNode) throw new Error("Could not find parent for " + JSON.stringify(node));
    if (isBlock(parentNode)) {
        const indexInBlock = parentNode.statements.findIndex(s => s === node);
        return (indexInBlock !== parentNode.statements.length - 1) ? parentNode.statements[indexInBlock + 1] : findNextStatement(root, parentNode, true);
    }
    if (isForLoop(parentNode)) {
        if (parentNode.initializer === node) return parentNode.condition;
        if (parentNode.condition === node) {
            if (isExpressionStatement(parentNode.condition) && isTrue(parentNode.condition.value))
                return isCompositeStatement(parentNode.body) ? findNextStatement(root, parentNode.body) : parentNode.body;
            else
                return findNextStatement(root, parentNode, true);
        }
        if (parentNode.update === node) return parentNode.condition;
        if (parentNode.body === node) return parentNode.update;
    }
    throw new Error("Could not determine next statement");
}

function isFullyEvaluated(node) {
    if (isExpressionStatement(node)) return isConstant(node.value);
    if (isDeclaration(node)) return isConstant(node.value);
    if (isIff(node)) return isConstant(node.condition);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

export { evaluateExpression, findNextStatement, initialState, mergeState, variable, isFullyEvaluated }