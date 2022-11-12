// Tree components
import {isExpression, isIdentifier, isStatement} from "@/simulator/treePredicates";

function identifier(name) {
    if (typeof name !== "string") throw new Error("name is not a string");

    return {
        type: "identifier",
        name: name
    };
}

function label(name) {
    return {
        type: "label",
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

const voidConstant = constant(undefined, "void");

function intConstant(value) {
    if (typeof value === "boolean")
        return intConstant(value ? 1 : 0);
    if (typeof value === "number")
        return constant(value, "int");

    throw new Error("Unsupported value type " + typeof value);
}

function stringConstant(value) {
    const newValue = value.replace("\n", "\\n");
    return constant(newValue, "char*");
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

function jump(label) {
    return {
        type: "statement",
        statementType: "jump",
        label: label
    }
}

function conditionalJump(condition, trueLabel, falseLabel, originalStatement) {
    if (!isExpression(condition))
        throw new Error("condition is not an expression");
    if (!isStatement(originalStatement))
        throw new Error("originalStament is not a statement");

    return {
        type: "statement",
        statementType: "conditional-jump",
        condition: condition,
        trueLabel: trueLabel,
        falseLabel: falseLabel,
        originalStatement: originalStatement
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

// Pseudo element
function undeclaration(identifier) {
    if (!isIdentifier(identifier)) throw new Error("identifier is not an identifier");

    return {
        type: "statement",
        statementType: "undeclaration",
        identifier: identifier,
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
    undeclaration,
    label,
    jump,
    conditionalJump,
    voidConstant
};