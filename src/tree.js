import {dec} from "ramda";

function identifier(name) {
    return {
        type: "identifier",
        name: name
    };
}

function constant(value, datatype) {
    return {
        type: "constant",
        value: value,
        datatype: datatype
    };
}

function intConstant(value) {
    return constant(value, "int");
}

function stringConstant(value) {
    return constant(value, "char*");
}

function statement(expression) {
    return {
        type: "statement",
        statementType: "expression",
        value: expression
    };
}

function nullStatement() {
    return statement();
}

function declaration(datatype, identifier, value) {
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
    return {
        type: "expression",
        operator: "and",
        left: left,
        right: right
    };
}

function lessThanOrEqual(left, right) {
    return {
        type: "expression",
        operator: "less-than-or-equal",
        left: left,
        right: right
    };
}

function equal(left, right) {
    return {
        type: "expression",
        operator: "equal",
        left: left,
        right: right
    };
}

function assign(identifier, value) {
    return {
        type: "expression",
        operator: "assign",
        identifier: identifier,
        value: value
    };
}

function addAssign(identifier, value) {
    return {
        type: "expression",
        operator: "add-assign",
        identifier: identifier,
        value: value
    };
}

function increment(identifier) {
    return {
        type: "expression",
        operator: "increment",
        identifier: identifier
    };
}

function invoke(identifier) {
    return {
        type: "expression",
        operator: "invoke",
        identifier: identifier,
        arguments: Array.from(arguments).slice(1)
    };
}

function forLoop(initializer, condition, update, body) {
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
                ...node.statements.map(flatten).flat()
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
                ...node.arguments.map(flatten).flat()
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
    flatten
};