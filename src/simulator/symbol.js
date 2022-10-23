import {flatten, isIdentifier} from './tree';

function indentation(depth) {
    let buffer = "";
    for(let i = 0; i < depth; i++) buffer += "  ";
    return buffer;
}

function symbolListExpression(node, depth) {
    if (!node) {
        return [
            { value: ";", node: node }
        ];
    }
    else {
        return [
            ...symbolList(node.value, depth),
            { value: ";", node: node }
        ];
    }
}

function symbolListAssignOperator(node, operator, depth) {
    return [
        ...symbolList(node.identifier, depth),
        { value: " " + operator + " ", node: node },
        ...symbolList(node.value, depth),
    ];
}

function symbolListBinaryOperator(node, operator, depth) {
    return [
        ...symbolList(node.left, depth),
        { value: " " + operator + " ", node: node },
        ...symbolList(node.right, depth),
    ];
}

function symbolListLeftOperator(node, operator, depth) {
    return [
        ...symbolList(node.identifier, depth),
        { value: operator, node: node }
    ];
}

function symbolListDeclaration(node, depth) {
    if (!node.value) {
        return [
            { value: node.datatype + " ", node: node },
            ...symbolList(node.identifier, depth),
            { value: ";", node: node }
        ];
    }
    else {
        return [
            { value: node.datatype + " ", node: node },
            ...symbolList(node.identifier, depth),
            { value: " = ", node: node },
            ...symbolList(node.value, depth),
            { value: ";", node: node }
        ];
    }
}

function symbolListInvocation(node, depth) {
    if (node.arguments.length === 0) {
        return [
            ...symbolList(node.identifier, depth),
            { value: "()", node: node },
        ];
    }
    else {
        const argumentList = [];
        for(let i = 0; i < node.arguments.length; i++) {
            symbolList(node.arguments[i], depth).forEach(s => argumentList.push(s));
            if (i !== node.arguments.length - 1) argumentList.push({ value: ", ", node });
        }

        return [
            ...symbolList(node.identifier, depth),
            { value: "(", node: node },
            ...argumentList,
            { value: ")", node: node }
        ];
    }
}

function symbolListForLoop(node, depth) {
    // Removing the semicolon from the updateStatement to comply with C# syntax
    const updateStatement = symbolList(node.update, depth);
    if(updateStatement[updateStatement.length - 1].value === ";")
        updateStatement.pop();

    if (node.body.type === "statement" && node.body.statementType === "block") {
        return [
            { value: "for (", node: node },
            ...symbolList(node.initializer, depth),
            { value: " ", node: node },
            ...symbolList(node.condition, depth),
            { value: " ", node: node },
            ...updateStatement,
            { value: ") ", node: node },
            ...symbolList(node.body, depth)
        ];
    }
    else {
        return [
            { value: "for (", node: node },
            ...symbolList(node.initializer, depth),
            { value: " ", node: node },
            ...symbolList(node.condition, depth),
            { value: " ", node: node },
            ...updateStatement,
            { value: ")\n" + indentation(depth + 1), node: node },
            ...symbolList(node.body, depth)
        ];
    }
}

function symbolListIff(node, depth) {
    if (node.body.type === "statement" && node.body.statementType === "block") {
        return [
            { value: "if (", node: node },
            ...symbolList(node.condition, depth),
            { value: ") ", node: node },
            ...symbolList(node.body, depth)
        ];
    }
    else {
        return [
            { value: "if (", node: node },
            ...symbolList(node.condition, depth),
            { value: ")\n" + indentation(depth + 1), node: node },
            ...symbolList(node.body, depth)
        ];
    }
}

function symbolListBlock(node, depth) {
    const statementList = [];
    for(let i = 0; i < node.statements.length; i++) {
        const newLine =  i !== 0 ? "\n" : "";
        statementList.push({ value: newLine + indentation(depth), node });
        symbolList(node.statements[i], depth).forEach(s => statementList.push(s));
    }

    return [
        { value: "{\n", node: node },
        ...statementList,
        { value: "\n" + indentation(depth - 1) + "}", node: node }
    ];
}

function symbolList(node, depth) {
    if (!depth) depth = 0;

    if(node.type === "statement") {
        if (node.statementType === "block") {
            return symbolListBlock(node, depth + 1);
        }
        if (node.statementType === "declaration") {
            return symbolListDeclaration(node, depth);
        }
        if (node.statementType === "expression") {
            return symbolListExpression(node, depth);
        }
        if (node.statementType === "for-loop") {
            return symbolListForLoop(node, depth);
        }
        if (node.statementType === "if") {
            return symbolListIff(node, depth);
        }

        throw new Error("Unsupported statementType " + node.statementType);
    }
    if (node.type === "expression") {
        if (node.operator === "and") {
            return symbolListBinaryOperator(node, "&&", depth);
        }
        if (node.operator === "equal") {
            return symbolListBinaryOperator(node, "==", depth);
        }
        if (node.operator === "less-than-or-equal") {
            return symbolListBinaryOperator(node, "<=", depth);
        }
        if (node.operator === "assign") {
            return symbolListAssignOperator(node, "=", depth);
        }
        if (node.operator === "add-assign") {
            return symbolListAssignOperator(node, "+=", depth);
        }
        if (node.operator === "increment") {
            return symbolListLeftOperator(node, "++", depth);
        }
        if (node.operator === "invoke") {
            return symbolListInvocation(node, depth);
        }
        throw new Error("Unsupported operator " + node.operator);
    }
    if (node.type === "constant") {
        if (node.datatype === "int") return [{ value: node.value + "", node: node }];
        if (node.datatype === "char*") return [{ value: "\"" + node.value + "\"", node: node }];
        throw new Error("Unsupported datatype " + node.datatype);
    }
    if (node.type === "identifier") {
        return [{ value: node.name, node: node }];
    }
    throw new Error("Unsupported node " + JSON.stringify(node));
}

function symbolMap(node, symbols) {
    // Associate length info to symbols
    let counter = 0;
    const buffer1 = [];
    for(let i = 0; i < symbols.length; i++) {
        const symbolLength = symbols[i].value.length;
        const symbol = {
            value: symbols[i].value,
            node: symbols[i].node,
            start: counter,
            end: counter + symbolLength
        };
        buffer1.push(symbol);
        counter += symbolLength;
    }

    // Associated symbols with nodes
    const buffer2 = [];
    const allNodes = flatten(node).filter(n => n.type !== "identifier");
    for(let i = 0; i < allNodes.length; i++) {
        const allAssociatedNodes = flatten(allNodes[i]).filter(n => n.type !== "identifier");
        const allAssociatedSymbols = buffer1.filter(s => allAssociatedNodes.some(n => s.node === n));

        const start = Math.min(...allAssociatedSymbols.map(s => s.start));
        const end = Math.max(...allAssociatedSymbols.map(s => s.end));

        const symbolMap = {
            node: allNodes[i],
            start: start,
            end: end
        };
        buffer2.push(symbolMap);
    }
    return buffer2;
}

function findFirstIndex(arr, predicate) {
    return arr.findIndex(predicate);
}

function findLastIndex(arr, predicate) {
    for(let i = arr.length - 1; i > 0; i--) {
        if (predicate[arr[i]])
            return i;
    }
    return -1;
}

function getRange(symbols, node) {
    const nodeAndDescendents = flatten(node);
    const nodeAndDescendentsWithoutIdentifiers = nodeAndDescendents.filter(s => !isIdentifier(s));
    const middle = symbols.findIndex(s => nodeAndDescendentsWithoutIdentifiers.includes(s.node));
    const widthLeft = findLastIndex(symbols.slice(0, middle), s => nodeAndDescendents.includes(s.node));
    const widthRight = findFirstIndex(symbols.slice(middle), s => !nodeAndDescendents.includes(s.node));

    return {
        start: middle - widthLeft - 1,
        end: middle + widthRight - 1
    };
}

function transformRange(range, symbols, mapCallback) {
    const symbolsPriorToStart = symbols.slice(0, range.start);
    const symbolsPriorToEnd = symbols.slice(0, range.end + 1);

    const transformedStart =  mapCallback(symbolsPriorToStart).length;
    const transformedEnd = mapCallback(symbolsPriorToEnd).length;
    const transformedWidth = transformedEnd - transformedStart;

    return {
        start: transformedStart,
        end: transformedStart + transformedWidth - 1
    };
}

function getTransformedRange(symbols, node, mapCallback) {
    const range = getRange(symbols, node);
    return transformRange(range, symbols, mapCallback);
}

export { symbolList, symbolMap, getRange, transformRange, getTransformedRange };