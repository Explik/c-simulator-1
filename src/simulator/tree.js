// Tree components
function identifier(name) {
    if (typeof name !== "string") throw new Error("name is not a string");

    return {
        type: "identifier",
        name: name
    };
}

function constant(value, datatype) {
    if (typeof datatype !== "string") throw new Error("datatype is not a string");

    return {
        type: "constant",
        value: value,
        datatype: datatype
    };
}

function intConstant(value) {
    if (typeof value === "boolean")
        return intConstant(value ? 1 : 0);
    if (typeof value === "number")
        return constant(value, "int");

    throw new Error("Unsupported value type " + typeof value);
}

function stringConstant(value) {
    return constant(value, "char*");
}

function statement(expr) {
    if (!isExpression(expr)) throw new Error("expr is not an expression");

    return {
        type: "statement",
        statementType: "expression",
        value: expr
    };
}

function nullStatement() {
    return {
        type: "statement",
        statementType: "expression",
        value: undefined
    };
}

function declaration(datatype, identifier, value) {
    if (typeof datatype !== "string") throw new Error("datatype is not a string");
    if (!isIdentifier(identifier)) throw new Error("identifier is not an identifier");
    if (value && !isExpression(value)) throw new Error("value is not an expression");

    return {
        type: "statement",
        statementType: "declaration",
        identifier: identifier,
        datatype: datatype,
        value: value
    };
}

function intDeclaration(identifier, value) {
    return declaration("int", identifier, value);
}

function stringDeclaration(identifier, value) {
    return declaration("char*", identifier, value);
}

function and(left, right) {
    if (!isExpression(left)) throw new Error("left is not an expression");
    if (!isExpression(right)) throw new Error("right is not an expression");

    return {
        type: "expression",
        operator: "and",
        left: left,
        right: right
    };
}

function lessThanOrEqual(left, right) {
    if (!isExpression(left)) throw new Error("left is not an expression");
    if (!isExpression(right)) throw new Error("right is not an expression");

    return {
        type: "expression",
        operator: "less-than-or-equal",
        left: left,
        right: right
    };
}

function equal(left, right) {
    if (!isExpression(left)) throw new Error("left is not an expression");
    if (!isExpression(right)) throw new Error("right is not an expression");

    return {
        type: "expression",
        operator: "equal",
        left: left,
        right: right
    };
}

function assign(identifier, value) {
    if (!isIdentifier(identifier)) throw new Error("identifier is not an identifier");
    if (!isExpression(value)) throw new Error("value is not an expression");

    return {
        type: "expression",
        operator: "assign",
        identifier: identifier,
        value: value
    };
}

function addAssign(identifier, value) {
    if (!isIdentifier(identifier)) throw new Error("identifier is not an identifier");
    if (!isExpression(value)) throw new Error("value is not an expression");

    return {
        type: "expression",
        operator: "add-assign",
        identifier: identifier,
        value: value
    };
}

function increment(identifier) {
    if (!isIdentifier(identifier)) throw new Error("identifier is not an identifier");

    return {
        type: "expression",
        operator: "increment",
        identifier: identifier
    };
}

function invoke(identifier) {
    if (!isIdentifier(identifier)) throw new Error("identifier is not an identifier");

    return {
        type: "expression",
        operator: "invoke",
        identifier: identifier,
        arguments: Array.from(arguments).slice(1)
    };
}

function forLoop(initializer, condition, update, body) {
    if (!isStatement(initializer)) throw new Error("initializer is not a statement");
    if (!isStatement(condition)) throw new Error("condition is not a statement");
    if (!isStatement(update)) throw new Error("initializer is not a statement");
    if (!isStatement(body)) throw new Error("initializer is not a statement");

    return {
        type: "statement",
        statementType: "for-loop",
        initializer: initializer,
        condition: condition,
        update: update,
        body: body
    }
}

function iff(condition, body) {
    if (!isExpression(condition)) throw new Error("condition is not an expression");
    if (!isStatement(body)) throw new Error("body is not a statement");

    return {
        type: "statement",
        statementType: "if",
        condition: condition,
        body: body
    };
}

function block() {
    return {
        type: "statement",
        statementType: "block",
        statements: Array.from(arguments)
    };
}

// Tree node evaluators
function isIdentifier(node) {
    return node.type === "identifier";
}

function isConstant(node) {
    return node.type === "constant";
}

function isExpression(node) {
    return node.type === "identifier" || node.type === "constant" || node.type === "expression";
}

function isStatement(node) {
    return node.type === "statement";
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

function numericalValue(node) {
    if (!isConstant(node))
        throw new Error("node is not a constant");

    if (node.datatype === "int") return node.value;
    if (node.datatype === "char*") return node.value === null ? 0 : 99;
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
    return isAssign(node) || isAddAssign(node);
}

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
        ...node.arguments.slice(0, position - 1),
        arg.expression,
        ...node.arguments.slice(position + 1)
    ];
    if (isInvoke(node)) return invoke(node.identifier, newArguments);

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

function withCondition(node, condition) {
    if (isForLoop(node)) return forLoop(node.initializer, condition, node.update, node.body);
    if (isIff(node)) return iff(condition, node.body);
    throw new Error("Unsupported node " + JSON.stringify(node));
}

function withUpdate(node, update) {
    if (isForLoop(node)) return forLoop(node.initializer, node.constructor, update, node.body);
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

export {
    identifier,
    declaration,
    constant,
    intConstant,
    stringConstant,
    intDeclaration,
    stringDeclaration,
    and,
    equal,
    lessThanOrEqual,
    assign,
    addAssign,
    increment,
    invoke,
    block,
    forLoop,
    iff,
    statement,
    nullStatement,
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
    withIdentifier,
    withValue,
    withRight,
    withArgument,
    withArguments,
    withInitializer,
    withCondition,
    withUpdate,
    withBody,
    withStatements,
    numericalValue,
    flatten
};