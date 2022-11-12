/** @typedef {Object} State
 *  @property {Object[]} root
 *  @property {Object[]} evaluatedRoot
 *  @property {Object} evaluatedStatement
 *  @property {Object[]} variables
 *  @property {string} stdout
 */

/** @typedef {Object} StateChange
 *  @property {Object[]?} root
 *  @property {Object?} evaluatedStatement
 *  @property {Object[]?} variables
 *  @property {Object?} variable
 *  @property {string?} stdout
 */

import {
    hasLeft, hasRight, hasValue, isAddAssign, isAnd, isAssign,
    isConditionalJumpStatement,
    isConstant, isDeclaration, isEqual,
    isExpression, isExpressionStatement,
    isIdentifier, isIff, isIncrement, isInvoke, isJumpStatement, isLessThanOrEqual,
    isStatement,
    isTrue, isFalse
} from "@/simulator/treePredicates";
import {getEvaluationTree} from "@/simulator/treeTransformers";
import {numericalValue, withArgument, withCondition, withLeft, withRight, withValue} from "@/simulator/treeModifiers";
import {intConstant, voidConstant} from "@/simulator/treeNodes";

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
    if (stateChange.evaluatedStatement && !(isExpression(stateChange.evaluatedStatement) || isStatement(stateChange.evaluatedStatement)))
        throw new Error("stateChange.expression is not an expression or statement");
    if (stateChange.variables && stateChange.variables.some(v => !isVariable(v)))
        throw new Error("stateChange.variables contains non-variable");
    if (stateChange.variable && !isVariable(stateChange.variable))
        throw new Error("stateChange.variable is not a variable");

    const newState = {...state};

    // Absolute changes
    if (stateChange.root) newState.root = stateChange.root;
    if (stateChange.root) newState.statements = getEvaluationTree(stateChange.root);
    // eslint-disable-next-line
    if (stateChange.statement || stateChange.hasOwnProperty("statement")) newState.statement = stateChange.statement;
    // eslint-disable-next-line
    if (stateChange.evaluatedStatement || stateChange.hasOwnProperty("evaluatedStatement")) newState.evaluatedStatement = stateChange.evaluatedStatement;
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
    return isConstant(state.evaluatedStatement.left);
}

function isRightConstant(state) {
    return isConstant(state.evaluatedStatement.right);
}

function isValueConstant(state) {
    return isConstant(state.evaluatedStatement.value);
}

function areArgumentsConstant(state) {
    return state.evaluatedStatement.arguments.every(isConstant);
}

function evaluateLeft(state, callback) {
    if (!hasLeft(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement has no left argument");

    const {evaluatedStatement, variables} = callback(mergeState(state, {evaluatedStatement: state.evaluatedStatement.left}));
    return mergeState(state, {
        evaluatedStatement: withLeft(state.evaluatedStatement, evaluatedStatement), variables
    });
}

function evaluateRight(state, callback) {
    if (!hasRight(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement has no right argument");

    const {evaluatedStatement, variables} = callback(mergeState(state, {evaluatedStatement: state.evaluatedStatement.right}));
    return mergeState(state, {
        evaluatedStatement: withRight(state.evaluatedStatement, evaluatedStatement), variables
    });
}

function evaluateValue(state, callback) {
    if (!hasValue(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement has no value argument");

    const {evaluatedStatement, variables} = callback(mergeState(state, {evaluatedStatement: state.evaluatedStatement.value}));
    return mergeState(state, {
        evaluatedStatement: withValue(state.evaluatedStatement, evaluatedStatement),
        variables
    });
}

function evaluateCondition(state, callback) {
    if (!isIff(state.evaluatedStatement) && !isConditionalJumpStatement(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement has no iff");

    const {evaluatedStatement, variables} = callback(mergeState(state, {evaluatedStatement: state.evaluatedStatement.condition}));
    return mergeState(state, {
        evaluatedStatement: withCondition(state.evaluatedStatement, evaluatedStatement),
        variables
    });
}

function evaluateArguments(state, callback) {
    if (!isInvoke(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an invocation expression");

    const args = state.evaluatedStatement.arguments;
    const argIndex = args.findIndex(n => !isConstant(n));

    if (argIndex === -1)
        throw new Error("state.evaluatedStatement.arguments does not contain non-constant")

    const {evaluatedStatement, variables} = callback(mergeState(state, {evaluatedStatement: args[argIndex]}));
    return mergeState(state, {
        evaluatedStatement:withArgument(state.evaluatedStatement, evaluatedStatement, argIndex), variables
    });
}

function evaluateIdentifier(state) {
    if (!isIdentifier(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an identifier");

    if (!hasVariable(state, state.evaluatedStatement))
        throw new Error("Identifier " + state.evaluatedStatement.name + " has not been declared yet");

    return mergeState(state, {
        evaluatedStatement: getValue(state, state.evaluatedStatement)
    });
}

function evaluateAndExpression(state, callback) {
    if (!isAnd(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an and expression");

    if (!isLeftConstant(state)) {
        return evaluateLeft(state, callback);
    }
    if (isFalse(state.evaluatedStatement.left)) {
        return mergeState(state, {
            evaluatedStatement: intConstant(false)
        });
    }
    if (!isRightConstant(state)) {
        return evaluateRight(state, callback);
    }
    return mergeState(state, {
        evaluatedStatement: intConstant(isTrue(state.evaluatedStatement.right))
    });
}

function evaluateLessThanOrEqualExpression(state, callback) {
    if (!isLessThanOrEqual(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an less-than-or-equal expression");

    if (!isLeftConstant(state)) {
        return evaluateLeft(state, callback);
    }
    if (!isRightConstant(state)) {
        return evaluateRight(state, callback);
    }
    return mergeState(state, {
        evaluatedStatement: intConstant(numericalValue(state.evaluatedStatement.left) <= numericalValue(state.evaluatedStatement.right))
    });
}

function evaluateEqualExpression(state, callback) {
    if (!isEqual(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an equal expression");

    if (!isLeftConstant(state)) {
        return evaluateLeft(state, callback);
    }
    if (!isRightConstant(state)) {
        return evaluateRight(state, callback);
    }
    return mergeState(state, {
        evaluatedStatement: intConstant(numericalValue(state.evaluatedStatement.left) === numericalValue(state.evaluatedStatement.right))
    });
}

function evaluateAssignExpression(state, callback) {
    if (!isAssign(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an assign expression");

    if (!hasVariable(state, state.evaluatedStatement.identifier))
        throw new Error("Identifier "+ state.evaluatedStatement.identifier.name + " has not been declared yet");

    if (!isValueConstant(state)) {
        return evaluateValue(state, callback);
    }
    return mergeState(state, {
        evaluatedStatement:  state.evaluatedStatement.value,
        variable: variable(state.evaluatedStatement.identifier, state.evaluatedStatement.value)
    });
}

//eslint-disable-next-line
function evaluateIncrementExpression(state, callback) {
    if (!isIncrement(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an increment expression");

    if (!hasVariable(state, state.evaluatedStatement.identifier))
        throw new Error("Identifier "+ state.evaluatedStatement.identifier.name + "has not been declared yet");

    const originalInt = numericalValue(getValue(state, state.evaluatedStatement.identifier));
    const incrementedInt = originalInt + 1;
    return mergeState(state, {
        evaluatedStatement:  intConstant(originalInt),
        variable: variable(state.evaluatedStatement.identifier, intConstant(incrementedInt))
    });
}

function evaluateAddAssignExpression(state, callback) {
    if (!isAddAssign(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an add-assign expression");

    if (!hasVariable(state, state.evaluatedStatement.identifier))
        throw new Error("Identifier " + state.evaluatedStatement.identifier.name + " has not been declared yet");

    if (!isValueConstant(state))
        return evaluateValue(state, callback);

    const originalInt = numericalValue(getValue(state, state.evaluatedStatement.identifier));
    const addedInt = originalInt + numericalValue(state.evaluatedStatement.value)
    return mergeState(state, {
        evaluatedStatement:  intConstant(addedInt),
        variable: variable(state.evaluatedStatement.identifier, intConstant(addedInt))
    });
}

function evaluateInvokeExpression(state, callback) {
    if (!isInvoke(state.evaluatedStatement))
        throw new Error("state.evaluatedStatement is not an invocation expression");

    if (!areArgumentsConstant(state))
        return evaluateArguments(state, callback);

    if (isInvoke(state.evaluatedStatement, "printf")) {
        const args = state.evaluatedStatement.arguments;
        let printValue = args[0].value;

        if(args.length > 1)
            printValue = printValue.replace("%d", args[1].value);

        return mergeState(state, {
            evaluatedStatement: voidConstant,
            stdout: printValue
        });
    }
    throw new Error("Unsupported function");
}

function evaluateExpressionStatement(state, callback) {
    if (!isConstant(state.evaluatedStatement.value))
        return evaluateValue(state, callback);

    const indexInRoot = state.statements.findIndex(s => s === state.statement);
    if (indexInRoot === -1) throw new Error("Statement does not exist in tree");
    const nextStatements = state.statements.slice(indexInRoot + 1);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        evaluatedStatement: nextStatement,
    });
}

function evaluateDeclarationStatement(state, callback) {
    if (!isConstant(state.evaluatedStatement.value))
        return evaluateValue(state, callback);

    const variables = [...state.variables, variable(state.evaluatedStatement.identifier, state.evaluatedStatement.value)];

    const indexInRoot = state.statements.findIndex(s => s === state.statement);
    if (indexInRoot === -1) throw new Error("Statement does not exist in tree");
    const nextStatements = state.statements.slice(indexInRoot + 1);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        evaluatedStatement: nextStatement,
        variables: variables
    });
}

function evaluateJumpStatement(state) {
    const label = state.evaluatedStatement.label;
    const indexInRoot = state.statements.findIndex(s => s === label);
    if (indexInRoot === -1) throw new Error("Label " + label.name + "does not exist in tree");

    // Finds first non-label
    const nextStatements = state.statements.slice(indexInRoot);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        evaluatedStatement: nextStatement
    });
}

function evaluateConditionalJumpStatement(state, callback) {
    if (!isConstant(state.evaluatedStatement.condition))
        return evaluateCondition(state, callback);

    const label = isTrue(state.evaluatedStatement.condition) ? state.evaluatedStatement.trueLabel : state.evaluatedStatement.falseLabel;
    const indexInRoot = state.statements.findIndex(s => s === label);
    if (indexInRoot === -1) throw new Error("Label " + label.name + "does not exist in tree");

    // Finds first non-label
    const nextStatements = state.statements.slice(indexInRoot);
    const nextStatement = nextStatements.find(isStatement);

    return mergeState(state, {
        statement: nextStatement,
        evaluatedStatement: nextStatement
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
    if (isIdentifier(state.evaluatedStatement)) return evaluateIdentifier(state, callback);
    if (isAnd(state.evaluatedStatement)) return evaluateAndExpression(state, callback);
    if (isLessThanOrEqual(state.evaluatedStatement)) return evaluateLessThanOrEqualExpression(state, callback);
    if (isEqual(state.evaluatedStatement)) return evaluateEqualExpression(state, callback);
    if (isAssign(state.evaluatedStatement)) return evaluateAssignExpression(state, callback);
    if (isIncrement(state.evaluatedStatement)) return evaluateIncrementExpression(state, callback);
    if (isAddAssign(state.evaluatedStatement)) return evaluateAddAssignExpression(state, callback);
    if (isInvoke(state.evaluatedStatement)) return evaluateInvokeExpression(state, callback);

    // Statements
    if (isExpressionStatement(state.evaluatedStatement)) return evaluateExpressionStatement(state, callback);
    if (isDeclaration(state.evaluatedStatement)) return evaluateDeclarationStatement(state, callback);
    if (isJumpStatement(state.evaluatedStatement)) return evaluateJumpStatement(state, callback);
    if (isConditionalJumpStatement(state.evaluatedStatement)) return evaluateConditionalJumpStatement(state, callback);

    throw new Error("Unsupported node " + JSON.stringify(state.evaluatedStatement));
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