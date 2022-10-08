import {
    isAddAssign,
    isAnd,
    isAssign,
    isConstant,
    isEqual,
    isExpression,
    isForLoop,
    isIdentifier,
    isIncrement,
    isLessThanOrEqual,
    isStatement,
    isIff,
    isDeclaration
} from "./tree";

function stringify(symbols) {
    return symbols.map(s => s.value).join("");
}

function isBracket(c) {
    const brackets = ['(', ')', '[', ']', '{', '}'];
    return brackets.includes(c);
}

function isWhitespace(c) {
    return c.trim() === "";
}

function filter(str, predicate) {
    return str.split('').filter(predicate).join('');
}

function filterWhen(str, predicate) {
    let buffer = "";

    let i = 0;
    while(i < str.length && predicate(str[i])) {
        buffer += str[i];
        i++;
    }
    return buffer;
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function highlightTrivia(str) {
    const buffer = [];
    let currentType = undefined;
    let previousType = undefined;

    for(let i = 0; i < str.length; i++) {
        if (isBracket(str[i])) {
            previousType = currentType;
            currentType = 'bracket';
        }
        if (isWhitespace(str[i])) {
            previousType = currentType;
            currentType = 'whitespace';
        }

       if (currentType !== previousType) {
           buffer.push({ type: currentType, value: str[i] });
       }
       else buffer[buffer.length - 1].value += str[i];
    }
    return buffer;
}

function highlightSymbol(symbol) {
    const buffer = [];
    const node = symbol.node;
    const isTrivia = c => isWhitespace(c) || isBracket(c);
    const startTrivia = filterWhen(symbol.value, isTrivia);
    const trimmedValue = filter(symbol.value,c => !isTrivia(c));
    const endTrivia = trimmedValue ? reverseString(filterWhen(reverseString(symbol.value), c =>  isTrivia(c))) : undefined;

    // Highlight whitespace and brackets prior to content
    if (startTrivia) {
        for(let item of highlightTrivia(startTrivia))
            buffer.push(item);
    }

    // Highlight content
    if (isIdentifier(node)) {
        buffer.push({ type: "identifier", value: trimmedValue });
    }
    if (isConstant(node)) {
        if (node.datatype === "int") {
            if (trimmedValue[0] === '-') {
                buffer.push({ type: "operator", value: trimmedValue[0] });
                buffer.push({ type: "numeral", value: trimmedValue.slice(1) });
            }
            else buffer.push({ type: "numeral", value: trimmedValue });
        }
        else if (node.datatype === "char*") {
            buffer.push({ type: "string", value: trimmedValue });
        }
        else throw new Error("Unsupported symbol " + JSON.stringify(symbol));
    }
    if (isExpression(node)) {
        if (isAnd(node)) buffer.push({ type: "operator", value: trimmedValue });
        if (isAssign(node)) buffer.push({ type: "operator", value: trimmedValue });
        if (isAddAssign(node)) buffer.push({ type: "operator", value: trimmedValue });
        if (isEqual(node)) buffer.push({ type: "operator", value: trimmedValue });
        if (isIncrement(node)) buffer.push({ type: "operator", value: trimmedValue });
        if (isLessThanOrEqual(node)) buffer.push({ type: "operator", value: trimmedValue });
    }
    if (isStatement(node)) {
        if (isDeclaration(node)) {
            if (trimmedValue === '=') buffer.push({ type: "operator", value: trimmedValue });
            if (trimmedValue === node.datatype) buffer.push({ type: "type", value: trimmedValue });
        }
        if (isIff(node) && trimmedValue === "if") buffer.push({ type: "keyword", value: trimmedValue });
        if (isForLoop(node) && trimmedValue === "for") buffer.push({ type: "keyword", value: trimmedValue });

        if (trimmedValue === ';') buffer.push({ type: 'semicolon', value: trimmedValue });
    }

    // Highlight whitespace and brackets after content
    if (endTrivia) {
        for(let item of highlightTrivia(endTrivia))
            buffer.push(item);
    }

    return buffer;
}

// [{type, value}]
function highlightSyntax(symbols) {
    return symbols.flatMap(highlightSymbol);
}

export {stringify, highlightSyntax};