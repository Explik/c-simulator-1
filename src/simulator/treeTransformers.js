import {isBlock, isDeclaration, isExpressionStatement, isForLoop, isIff} from "@/simulator/treePredicates";
import {conditionalJump, jump, label, undeclaration} from "@/simulator/treeNodes";

function getEvaluationTreeBlockStatement(node) {
    if (!isBlock(node))
        throw new Error("node is not a block statement");

    // All variables inside a block are "undeclared" at the end in order to be consistent with scoping rules
    const declarations = node.statements.filter(isDeclaration);
    const undeclarations = declarations.map(n => undeclaration(n.identifier));

    return [
        ...node.statements.flatMap(getEvaluationTreeStatement),
        ...undeclarations
    ];
}

function getEvaluationTreeIffStatement(node) {
    if (!isIff(node))
        throw new Error("node is not an if statement");

    const trueLabel = label("true");
    const falseLabel = label("false");
    const endLabel = label("end");

    // No support for else yet...
    return [
        conditionalJump(node.condition, trueLabel, falseLabel, node),
        trueLabel,
        ...getEvaluationTreeStatement(node.body),
        jump(endLabel),
        falseLabel,
        jump(endLabel),
        endLabel
    ];
}

function getEvaluationTreeForLoopStatement(node) {
    if (!isForLoop(node))
        throw new Error("node is not an for-loop statement");

    const beginLabel = label("begin");
    const bodyLabel = label("body");
    const endLabel = label("end");

    return [
        node.initializer,
        beginLabel,
        isExpressionStatement(node.condition) ? conditionalJump(node.condition.value, bodyLabel, endLabel, node.condition) : jump(bodyLabel),
        bodyLabel,
        ...getEvaluationTreeStatement(node.body),
        node.update,
        jump(bodyLabel),
        endLabel,
        undeclaration(node.initializer.identifier)
    ];
}

function getEvaluationTreeStatement(node) {
    if (isExpressionStatement(node))
        return [node];
    if (isDeclaration(node))
        return [node];
    if (isBlock(node))
        return getEvaluationTreeBlockStatement(node);
    if (isIff(node))
        return getEvaluationTreeIffStatement(node);
    if (isForLoop(node))
        return getEvaluationTreeForLoopStatement(node);

    throw new Error("Unsupported node " + JSON.stringify(node));
}

export function getEvaluationTree(root) {
    return root.flatMap(getEvaluationTreeStatement);
}