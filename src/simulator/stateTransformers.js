import {substitute} from "@/simulator/tree";
import {getRange, symbolList} from "@/simulator/symbol";
import {highlightSyntax} from "@/simulator/symbolTransformers";

export function getHighlightedSymbols(state) {
    // Substitute current non-evaluated statement with evaluated statement
    const root = state.root;
    const statement = state.statement;
    const evaluatedStatement = state.expression;
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