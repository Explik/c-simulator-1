import {
    addAssign,
    and,
    assign,
    block,
    conditionalJump,
    declaration,
    equal,
    forLoop,
    iff,
    increment,
    invoke,
    lessThanOrEqual,
    statement
} from "@/simulator/treeNodes";
import {
    isAddAssign, isAnd,
    isAssign, isBlock, isConditionalJumpStatement, isConstant,
    isDeclaration, isEqual, isExpression,
    isExpressionStatement, isForLoop, isIff,
    isIncrement,
    isInvoke, isLessThanOrEqual
} from "@/simulator/treePredicates";

function withIdentifier(node, identifier) {
    if (isDeclaration(node)) return declaration(node.datatype, identifier, node.value);
    if (isAssign(node)) return assign(identifier, node.value);
    if (isAddAssign(node)) return addAssign(identifier, node.value);
    if (isIncrement(node)) return increment(identifier);
    if (isInvoke(node)) return invoke(identifier, node.arguments);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withValue(node, value) {
    if (isDeclaration(node)) return declaration(node.datatype, node.identifier, value);
    if (isAssign(node)) return assign(node.identifier, value);
    if (isAddAssign(node)) return addAssign(node.identifier, value);
    if (isExpressionStatement(node)) return statement(value);
    if (isDeclaration(node)) return declaration(node.datatype, node.identifier, value);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

export function withLeft(node, left) {
    if (isAnd(node)) return and(left, node.right);
    if (isLessThanOrEqual(node)) return lessThanOrEqual(left, node.right);
    if (isEqual(node)) return equal(left, node.right);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withRight(node, right) {
    if (isAnd(node)) return and(node.left, right);
    if (isLessThanOrEqual(node)) return lessThanOrEqual(node.left, right);
    if (isEqual(node)) return equal(node.left, right);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withArgument(node, arg, position) {
    if (!isExpression(arg)) throw new Error("arg is not an expression");

    const newArguments = [
        ...node.arguments.slice(0, position),
        arg,
        ...node.arguments.slice(position + 1)
    ];
    if (isInvoke(node)) return invoke(node.identifier, ...newArguments);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withArguments(node, args) {
    if (!Array.isArray(args)) throw new Error("args is not an array");

    if (isInvoke(node)) return invoke(node.identifier, args);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

export function withExpression(node, expr) {
    if (!isExpression(expr)) throw new Error("arg is not an expression");

    if(isExpressionStatement(node)) return statement(expr);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withInitializer(node, initializer) {
    if (isForLoop(node)) return forLoop(initializer, node.condition, node.update, node.body);
    throw new Error("Unsupported node " + JSON.stringify(node));
}

export function hasCondition(node) {
    return isForLoop(node) || isIff(node) || isConditionalJumpStatement(node);
}

function withCondition(node, condition) {
    if (isForLoop(node)) return forLoop(node.initializer, condition, node.update, node.body);
    if (isIff(node)) return iff(condition, node.body);
    if (isConditionalJumpStatement(node)) return conditionalJump(condition, node.trueLabel, node.falseLabel, node.originalStatement);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withUpdate(node, update) {
    if (isForLoop(node)) return forLoop(node.initializer, node.condition, update, node.body);
    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withBody(node, body) {
    if (isForLoop(node)) return forLoop(node.initializer, node.condition, node.update, body);
    if (isIff(node)) return iff(node.condition, body);
    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withStatements(node, statements) {
    if (isBlock(node)) return block(statements);
}


function numericalValue(node) {
    if (!isConstant(node))
        throw new Error("node is not a constant");

    if (node.datatype === "int") return node.value;
    if (node.datatype === "char*") return node.value === null ? 0 : 99;
}

function flattenBinaryOperator(node) {
    return [
        node,
        ...flatten(node.left),
        ...flatten(node.right)
    ];
}

function flattenLeftOperator(node) {
    return [
        node,
        ...flatten(node.identifier)
    ];
}

function flattenAssignOperator(node) {
    return [
        node,
        ...flatten(node.identifier),
        ...flatten(node.value)
    ];
}

function flatten(node) {
    if (!node)
        return [];

    if(node.type === "statement") {
        if (node.statementType === "block") {
            return [
                node,
                ...node.statements.flatMap(flatten)
            ];
        }
        if (node.statementType === "declaration") {
            return [
                node,
                ...flatten(node.identifier),
                ...flatten(node.value)
            ];
        }
        if (node.statementType === "expression") {
            return [
                node,
                ...flatten(node.value)
            ];
        }
        if (node.statementType === "for-loop") {
            return [
                node,
                ...flatten(node.initializer),
                ...flatten(node.condition),
                ...flatten(node.update),
                ...flatten(node.body)
            ];
        }
        if (node.statementType === "if") {
            return [
                node,
                ...flatten(node.condition),
                ...flatten(node.body)
            ];
        }
        throw new Error("Unsupported statementType " + node.statementType);
    }
    if (node.type === "expression") {
        if (node.operator === "and") {
            return flattenBinaryOperator(node);
        }
        if (node.operator === "equal") {
            return flattenBinaryOperator(node);
        }
        if (node.operator === "less-than-or-equal") {
            return flattenBinaryOperator(node);
        }
        if (node.operator === "assign") {
            return flattenAssignOperator(node);
        }
        if (node.operator === "add-assign") {
            return flattenAssignOperator(node);
        }
        if (node.operator === "increment") {
            return flattenLeftOperator(node);
        }
        if (node.operator === "invoke") {
            return [
                node,
                ...flatten(node.identifier),
                ...node.arguments.flatMap(flatten)
            ];
        }
        throw new Error("Unsupported operator " + node.operator);
    }
    if (node.type === "constant") {
        return [node];
    }
    if (node.type === "identifier") {
        return [node];
    }
    throw new Error("Unsupported node " + JSON.stringify(node));
}

function substituteBlock(node, target, replacement) {
    const statements = node.statements.map(s => substitute(s, target, replacement));
    return block(...statements);
}

function substituteExpressionStatement(node, target, replacement) {
    const value = substitute(node.value, target, replacement);
    return withValue(node, value);
}

function substituteForLoopStatement(node, target, replacement) {
    const initializer = substitute(node.initializer, target, replacement);
    const condition = substitute(node.condition, target, replacement);
    const update = substitute(node.update, target, replacement);
    const body = substitute(node.body, target, replacement);

    return forLoop(initializer, condition, update, body);
}

function substituteIfStatement(node, target, replacement) {
    const condition = substitute(node.condition, target, replacement);
    const body = substitute(node.body, target, replacement);
    return iff(condition, body);
}

function substituteBinaryOperator(node, target, replacement) {
    const left = substitute(node.left, target, replacement);
    const right = substitute(node.right, target, replacement);
    return withRight(withLeft(node, left), right);
}

function substituteLeftOperator(node, target, replacement) {
    const identifier = substitute(node.identifier, target, replacement);
    return withIdentifier(node, identifier);
}

function substituteAssignOperator(node, target, replacement) {
    const identifier = substitute(node.identifier, target, replacement);
    const value = substitute(node.value, target, replacement);
    return withValue(withIdentifier(node, identifier), value);
}

function substituteInvokeOperator(node, target, replacement) {
    const identifier = substitute(node.identifier, target, replacement);
    const args = node.arguments.map(s => substitute(s, target, replacement));
    return invoke(identifier, ...args);
}

function substitute(node, target, replacement) {
    if (node === target)
        return replacement;

    if(node.type === "statement") {
        if (node.statementType === "block")
            return substituteBlock(node, target, replacement);
        if (node.statementType === "declaration")
            return substituteAssignOperator(node, target, replacement);
        if (node.statementType === "expression")
            return substituteExpressionStatement(node, target, replacement);
        if (node.statementType === "for-loop")
            return substituteForLoopStatement(node, target, replacement);
        if (node.statementType === "if")
            return substituteIfStatement(node, target, replacement);
        throw new Error("Unsupported statementType " + node.statementType);
    }
    if (node.type === "expression") {
        if (node.operator === "and")
            return substituteBinaryOperator(node, target, replacement);
        if (node.operator === "equal")
            return substituteBinaryOperator(node, target, replacement);
        if (node.operator === "less-than-or-equal")
            return substituteBinaryOperator(node, target, replacement);
        if (node.operator === "assign")
            return substituteAssignOperator(node, target, replacement);
        if (node.operator === "add-assign")
            return substituteAssignOperator(node, target, replacement);
        if (node.operator === "increment")
            return substituteLeftOperator(node, target, replacement);
        if (node.operator === "invoke")
            return substituteInvokeOperator(node, target, replacement);
        throw new Error("Unsupported operator " + node.operator);
    }
    if (node.type === "constant")
        return node;
    if (node.type === "identifier")
        return node;
    throw new Error("Unsupported node " + JSON.stringify(node));
}


export {
    numericalValue,
    flatten,
    substitute,
    withIdentifier,
    withValue,
    withRight,
    withArgument,
    withArguments,
    withInitializer,
    withCondition,
    withUpdate,
    withBody,
    withStatements
};