import {
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
    withCondition, isConditionalGotoStatement, isGotoStatement, voidConstant
} from "./tree";
import {getEvaluationTree} from "@/simulator/treeTransformers";

/** @typedef {Object} State
 *  @property {Object[]} root
 *  @property {Object[]} evaluatedRoot
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
        throw new Error("stateChange.root is not an array");
    if (stateChange.root && stateChange.root.some(v => !isStatement(v)))
        throw new Error("stateChange.root contains non-statement");
    if (stateChange.expression && !(isExpression(stateChange.expression) || isStatement(stateChange.expression)))
        throw new Error("stateChange.expression is not an expression or statement");
    if (stateChange.variables && stateChange.variables.some(v => !isVariable(v)))
        throw new Error("stateChange.variables contains non-variable");
    if (stateChange.variable && !isVariable(stateChange.variable))
        throw new Error("stateChange.variable is not a variable");

    const newState = {...state};

    // Absolute changes
    if (stateChange.root) newState.root = stateChange.root;
    if (stateChange.root) newState.evaluationRoot = getEvaluationTree(stateChange.root);
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

    const {expression, variables} = callback(mergeState(state, {expression: state.expression.left}));
    return mergeState(state, {
        expression: withLeft(state.expression, expression), variables
    });
}

function evaluateRight(state, callback) {
    if (!hasRight(state.expression))
        throw new Error("state.expression has no right argument");

    const {expression, variables} = callback(mergeState(state, {expression: state.expression.right}));
    return mergeState(state, {
        expression: withRight(state.expression, expression), variables
    });
}

function evaluateValue(state, callback) {
    if (!hasValue(state.expression))
        throw new Error("state.expression has no value argument");

    const {expression, variables} = callback(mergeState(state, {expression: state.expression.value}));
    return mergeState(state, {
        expression: withValue(state.expression, expression),
        variables
    });
}

function evaluateCondition(state, callback) {
    if (!isIff(state.expression) && !isConditionalGotoStatement(state.expression))
        throw new Error("state.expression has no iff");

    const {expression, variables} = callback(mergeState(state, {expression: state.expression.condition}));
    return mergeState(state, {
        expression: withCondition(state.expression, expression),
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

    const {expression, variables} = callback(mergeState(state, {expression: args[argIndex]}));
    return mergeState(state, {
        expression:withArgument(state.expression, expression, argIndex), variables
    });
}

function evaluateIdentifier(state) {
    if (!isIdentifier(state.expression))
        throw new Error("state.expression is not an identifier");

    if (!hasVariable(state, state.expression))
        throw new Error("Identifier " + state.expression.name + " has not been declared yet");

    return mergeState(state, {
       expression: getValue(state, state.expression)
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
            expression: voidConstant,
            stdout: printValue
        });
    }
    throw new Error("Unsupported function");
}

function evaluateExpressionStatement(state, callback) {
    if (!isConstant(state.expression.value))
        return evaluateValue(state, callback);

    const indexInRoot = state.evaluationRoot.findIndex(s => s === state.statement);
    if (indexInRoot === -1) throw new Error("Statement does not exist in tree");
    const nextStatements = state.evaluationRoot.slice(indexInRoot + 1);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        expression: nextStatement,
    });
}

function evaluateDeclarationStatement(state, callback) {
    if (!isConstant(state.expression.value))
        return evaluateValue(state, callback);

    const variables = [...state.variables, variable(state.expression.identifier, state.expression.value)];

    const indexInRoot = state.evaluationRoot.findIndex(s => s === state.statement);
    if (indexInRoot === -1) throw new Error("Statement does not exist in tree");
    const nextStatements = state.evaluationRoot.slice(indexInRoot + 1);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        expression: nextStatement,
        variables: variables
    });
}

function evaluateGotoStatement(state) {
    const label = state.expression.label;
    const indexInRoot = state.evaluationRoot.findIndex(s => s === label);
    if (indexInRoot === -1) throw new Error("Label " + label.name + "does not exist in tree");

    // Finds first non-label
    const nextStatements = state.evaluationRoot.slice(indexInRoot);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        expression: nextStatement
    });
}

function evaluateConditionalGotoStatement(state, callback) {
    if (!isConstant(state.expression.condition))
        return evaluateCondition(state, callback);

    const label = isTrue(state.expression.condition) ? state.expression.trueLabel : state.expression.falseLabel;
    const indexInRoot = state.evaluationRoot.findIndex(s => s === label);
    if (indexInRoot === -1) throw new Error("Label " + label.name + "does not exist in tree");

    // Finds first non-label
    const nextStatements = state.evaluationRoot.slice(indexInRoot);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        expression: nextStatement
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
    if (isIdentifier(state.expression)) return evaluateIdentifier(state, callback);
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
    if (isGotoStatement(state.expression)) return evaluateGotoStatement(state, callback);
    if (isConditionalGotoStatement(state.expression)) return evaluateConditionalGotoStatement(state, callback);

    throw new Error("Unsupported node " + JSON.stringify(state.expression));
}

function evaluateExpressionRecursively(state) {
    return evaluateExpression(state, evaluateExpressionRecursively);
}

function isFullyEvaluated(node) {
    if (isExpressionStatement(node)) return isConstant(node.value);
    if (isDeclaration(node)) return isConstant(node.value);
    if (isIff(node)) return isConstant(node.condition);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

export { evaluateExpression, evaluateExpressionRecursively, initialState, mergeState, variable, isFullyEvaluated }