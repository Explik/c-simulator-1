/**
 * @typedef {Object} Node
 * @property {string} type
 */

/**
 * Returns whether node represents an identifier
 * @param {Node} node
 * @returns {boolean}
 */
function isIdentifier(node) {
    return node.type === "identifier";
}

/**
 * Returns whether node represents a constant
 * @param {Node} node
 * @returns {boolean}
 */
function isConstant(node) {
    return node.type === "constant";
}

/**
 * Returns whether node represents an expression
 * @param {Node} node
 * @returns {boolean}
 */
function isExpression(node) {
    return node.type === "identifier" || node.type === "constant" || node.type === "expression";
}

/**
 * Returns whether node represents a statement
 * @param {Node} node
 * @returns {boolean}
 */
function isStatement(node) {
    return node.type === "statement";
}

function isJumpStatement(node) {
    return node.type === "statement" && node.statementType === "jump";
}

function isConditionalJumpStatement(node) {
    return node.type === "statement" && node.statementType === "conditional-jump";
}

function isDeclaration(node) {
    return node.type === "statement" && node.statementType === "declaration";
}

function isAnd(node) {
    return node.type === "expression" && node.operator === "and";
}

function isLessThanOrEqual(node) {
    return node.type === "expression" && node.operator === "less-than-or-equal";
}

function isEqual(node) {
    return node.type === "expression" && node.operator === "equal";
}

function isAssign(node) {
    return node.type === "expression" && node.operator === "assign";
}

function isAddAssign(node) {
    return node.type === "expression" && node.operator === "add-assign";
}

function isIncrement(node) {
    return node.type === "expression" && node.operator === "increment";
}

function isInvoke(node, name) {
    if (name) {
        return node.type === "expression" && node.operator === "invoke" && node.identifier.name === name;
    }
    return node.type === "expression" && node.operator === "invoke";
}

function isExpressionStatement(node) {
    return node.type === "statement" && node.statementType === "expression";
}

function isForLoop(node) {
    return node.type === "statement" && node.statementType === "for-loop";
}

function isIff(node) {
    return node.type === "statement" && node.statementType === "if";
}

function isBlock(node) {
    return node.type === "statement" && node.statementType === "block";
}

function isFalse(node) {
    if (!isConstant(node))
        throw new Error("node is not a constant");

    if (node.datatype === "int")
        return node.value === 0;
    if (node.datatype === "char*")
        return node.value === null;
    throw new Error("Unsupported datatype " + node.datatype);
}

function isTrue(node) {
    return !isFalse(node);
}

function isBinary(node) {
    return isAnd(node) || isLessThanOrEqual(node) || isEqual(node);
}

function hasLeft(node) {
    return isBinary(node);
}

function hasRight(node) {
    return isBinary(node);
}

function hasValue(node) {
    return isAssign(node) || isAddAssign(node) || isExpressionStatement(node) || isDeclaration(node);
}

export {
    isIdentifier,
    isConstant,
    isExpression,
    isStatement,
    isDeclaration,
    isAnd,
    isLessThanOrEqual,
    isEqual,
    isAssign,
    isAddAssign,
    isIncrement,
    isInvoke,
    isForLoop,
    isIff,
    isBlock,
    isFalse,
    isTrue,
    isBinary,
    isExpressionStatement,
    hasLeft,
    hasRight,
    hasValue,
    isJumpStatement,
    isConditionalJumpStatement,
};