import {getRange, symbolList} from "@/simulator/symbol";
import {highlightSyntax} from "@/simulator/symbolTransformers";
import {hasValue, isConditionalJumpStatement} from "@/simulator/treePredicates";
import {hasCondition, withCondition, withValue, substitute} from "@/simulator/treeModifiers";

function getExpressionFromConditionalJump(node) {
    if (hasValue(node.originalStatement))
        return node.originalStatement.value;
    if (hasCondition(node.originalStatement))
        return node.originalStatement.condition;

    throw new Error("Unsupported node: " + JSON.stringify(node));
}

function replaceConditionalJump(node) {
    if (hasValue(node.originalStatement))
        return withValue(node.originalStatement, node.condition);
    if (hasCondition(node.originalStatement))
        return withCondition(node.originalStatement, node.condition);

    throw new Error("Unsupported node: " + JSON.stringify(node));
}

function getEvaluatedRoot(root, statement, evaluatedStatement) {
    // Substitute current non-evaluated statement with evaluated statement
    const replacementStatement = isConditionalJumpStatement(evaluatedStatement) ? replaceConditionalJump(evaluatedStatement) : evaluatedStatement;
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
    const statement = isConditionalJumpStatement(state.statement) ? getExpressionFromConditionalJump(state.statement) : state.statement;
    const evaluatedStatement = isConditionalJumpStatement(state.evaluatedStatement) ? getExpressionFromConditionalJump(state.evaluatedStatement) : state.evaluatedStatement;

    const root = getEvaluatedRoot(state.root, statement, state.evaluatedStatement);
    const symbols = getSymbols(root);
    const range = getRange(symbols, evaluatedStatement);

    return {
      symbols: symbols,
      symbolRange: range
    };
}