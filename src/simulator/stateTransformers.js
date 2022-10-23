import {getRange, symbolList} from "@/simulator/symbol";
import {highlightSyntax} from "@/simulator/symbolTransformers";
import {
    hasCondition,
    hasValue,
    isConditionalGotoStatement,
    substitute,
    withCondition,
    withValue
} from "@/simulator/tree";

function replaceConditionalGoto(node) {
    if (hasValue(node.originalStatement))
        return withValue(node.originalStatement, node.condition);
    if (hasCondition(node.originalStatement))
        return withCondition(node.originalStatement, node.condition);

    throw new Error("Unsupported node: " + JSON.stringify(node));
}

export function getHighlightedSymbols(state) {
    // Substitute current non-evaluated statement with evaluated statement
    const root = state.root;
    const statement = state.statement;
    const evaluatedStatement = isConditionalGotoStatement(state.expression) ? replaceConditionalGoto(state.expression) : state.expression;
    const substituteExpression = n => substitute(n, statement, evaluatedStatement);
    const substitutedRoot = root.map(substituteExpression);

    // Calculate symbols of evaluated statements
    const getSymbolList = n => [...symbolList(n), { value: "\n", node: n }];
    const symbols = substitutedRoot.flatMap(getSymbolList);
    const highlightedSymbols = highlightSyntax(symbols);

    // Calculate range of current statement
    const range = getRange(highlightedSymbols, evaluatedStatement);

    return {
        symbols: highlightedSymbols,
        highlightedSymbolRange: range
    };
}