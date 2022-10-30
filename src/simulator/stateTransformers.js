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

function getExpressionFromConditionalGoto(node) {
    if (hasValue(node.originalStatement))
        return node.originalStatement.value;
    if (hasCondition(node.originalStatement))
        return node.originalStatement.condition;

    throw new Error("Unsupported node: " + JSON.stringify(node));
}

function replaceConditionalGoto(node) {
    if (hasValue(node.originalStatement))
        return withValue(node.originalStatement, node.condition);
    if (hasCondition(node.originalStatement))
        return withCondition(node.originalStatement, node.condition);

    throw new Error("Unsupported node: " + JSON.stringify(node));
}

function getEvaluatedRoot(root, statement, evaluatedStatement) {
    // Substitute current non-evaluated statement with evaluated statement
    const replacementStatement = isConditionalGotoStatement(evaluatedStatement) ? replaceConditionalGoto(evaluatedStatement) : evaluatedStatement;
    const substituteExpression = n => substitute(n, statement, replacementStatement);

    return root.map(substituteExpression);
}

function getSymbols(evaluatedStatements) {
    // Calculate symbols of evaluated statements
    const getSymbolList = n => [...symbolList(n), { value: "\n", node: n }];
    const symbols = evaluatedStatements.flatMap(getSymbolList);

    return highlightSyntax(symbols);
}

export function getSymbolState(state) {
    const statement = isConditionalGotoStatement(state.statement) ? getExpressionFromConditionalGoto(state.statement) : state.statement;
    const evaluatedStatement = isConditionalGotoStatement(state.evaluatedStatement) ? getExpressionFromConditionalGoto(state.evaluatedStatement) : state.evaluatedStatement;

    const root = getEvaluatedRoot(state.root, statement, evaluatedStatement);
    const symbols = getSymbols(root);
    const range = getRange(symbols, evaluatedStatement);

    return {
      symbols: symbols,
      symbolRange: range
    };
}