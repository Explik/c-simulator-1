import {flatten, declaration, addAssign, and, assign, intConstant, invoke, lessThanOrEqual, statement, iff} from "./tree";

function findNextStatement(root, node, state) {
    const allStatements = flatten(root).filter(n => n.type !== "statement");
    const currentIndex = allStatements.indexOf(n => n === node);
    const parentIndex = currentIndex - 1;
    const parentNode = allStatements[parentIndex];

    if (node.statementType === "if") {
        if (state.currentExpression.condition !== "constant")
            throw new Error("Condition in if statement is not calculated");

        const isTrue = state.currentExpression.value.value !== 0;
        return isTrue ? node.body : findNextStatement(parentNode);
    }
    if (node.statementType === "for-loop") {
        return node.initializer;
    }

    if (parentNode === undefined) {
        return undefined;
    }
    if(parentNode.statementType === "block") {
        const allStatementsInBlock = flatten(parentNode).filter(n => n.type !== "statements");
        const currentIndexInBlock = allStatementsInBlock.indexOf(n => n === node);
        const isLastStatementInBlock = currentIndexInBlock === (allStatementsInBlock.length - 1);

        if (!isLastStatementInBlock) {
            return allStatementsInBlock[currentIndexInBlock + 1];
        }
        else return findNextStatement(parentNode);
    }
    if(parentNode.statementType === "if") {
        return findNextStatement(parentNode);
    }
    if(parentNode.statementType === "for") {
        if (node === parentNode.initializer){
            return parentNode.condition;
        }
        if (node === parentNode.condition) {
            const isRunning = state.currentExpression.value.value !== 0;
            return isRunning ? parentNode.body : findNextStatement(parentNode);
        }
        if (node === parentNode.update){
            return parentNode.condition;
        }
        if (node === parentNode.body) {
            return parentNode.update;
        }
        throw new Error("Logic error");
    }

    if (currentIndex === allStatements.length - 1) {
        return undefined;
    }
}

// evaluate(root)
// evaluate(root, state)
// evaluate(root, node, state)
function evaluate(root, node, state) {
    if (arguments.length === 1) {
        node = root;
        state = { variables: [], currentStatement: root, currentExpression: root, stdout: "" }
    }
    if (arguments.length === 2) {
        node = root;
        state = node;
    }

    if (node.type === "identifier") {
        const variable = node.variables.find(v => v.identifier === node);
        if (!variable) throw new Error("Unrecognized identifier " + node.name);
        return { ...state, currentExpression: variable.value };
    }
    if (node.type === "expression" && node.operator === "and") {
        if(node.left.type !== "constant") {
            const newState = evaluate(root, node.left, state);
            return { ...newState, currentExpression: and(newState.currentExpression, node.right) };
        }
        if (node.right.type !== "constant") {
            const newState = evaluate(root, node.right, state);
            return { ...newState, currentExpression: and(node.left, newState.currentExpression) };
        }
        const value = ((node.left.value !== 0 && node.left.value !== null) && (node.right.value !== 0 && node.right.value !== null)) ? 1 : 0;
        return { ...state, currentExpression: intConstant(value) };
    }
    if (node.type === "expression" && node.operator === "less-than-or-equal") {
        if(node.left.type !== "constant") {
            const newState = evaluate(root, node.left, state);
            return { ...newState, currentExpression: lessThanOrEqual(newState.currentExpression, node.right) };
        }
        if (node.right.type !== "constant") {
            const newState = evaluate(root, node.right, state);
            return { ...newState, currentExpression: lessThanOrEqual(node.left, newState.currentExpression) };
        }
        const value = node.left.value <= node.right.value;
        return { ...state, currentExpression: intConstant(value) };
    }
    if (node.type === "expression" && node.operator === "equal") {
        if(node.left.type !== "constant") {
            const newState = evaluate(root, node.left, state);
            return { ...newState, currentExpression: equal(newState.currentExpression, node.right) };
        }
        if (node.right.type !== "constant") {
            const newState = evaluate(root, node.right, state);
            return { ...newState, currentExpression: equal(node.left, newState.currentExpression) };
        }
        const value = node.left.value === node.right.value;
        return { ...state, currentExpression: intConstant(value) };
    }
    if (node.type === "expression" && node.operator === "assign") {
        if (node.value.type !== "constant") {
            const newState = evaluate(root, node.value, state);
            return { ...newState, currentExpression: assign(node.identifier, newState.value) };
        }
        const variables = node.variables.filter(v => v.identifier !== node.identifier);
        variables.push({ identifier: node.identifier, value: node.value })
        return { ...state, currentExpression: node.value, variables: variables };
    }
    if (node.type === "expression" && node.operator === "add-assign") {
        if (node.value.type !== "constant") {
            const newState = evaluate(root, node.value, state);
            return { ...newState, currentExpression: addAssign(node.identifier, newState.value) };
        }
        const identifierValue = node.variables.find(v => v.identifier === node).value.value;
        const valueValue = node.value.value;
        const variables = node.variables.filter(v => v.identifier !== node.identifier);
        variables.push({ identifier: node.identifier, value: intConstant(identifierValue + valueValue) });
        return { ...state, currentExpression: intConstant(identifierValue + valueValue), variables: variables };
    }
    if (node.type === "expression" && node.operator === "increment") {
        const identifierValue = node.variables.find(v => v.identifier === node).value.value;
        const variables = node.variables.filter(v => v.identifier !== node.identifier);
        variables.push({ identifier: node.identifier, value: intConstant(identifierValue) + 1 });
        return { ...state, currentExpression: intConstant(identifierValue), variables: variables };
    }
    if (node.type === "expression" && node.operator === "invoke") {
        // Calculate arguments
        for(let i = 0; i < node.arguments.length; i++){
            if(node.arguments[i].type !== "constant") {
                const newState = evaluate(node.arguments[i], state);
                const newArguments = [
                    ...node.arguments.slice(0, i - 1),
                    newState.currentExpression,
                    ...node.arguments.slice(i + 1)
                ];
                return { ...newState, currentExpression: invoke(node.identifier, newArguments) }
            }
        }

        if (node.identifier.name === "printf") {
            const printValue = node.arguments[0].value;
            if(node.arguments.length >= 1) printValue.replace("%d", node.arguments[1].value);

            return {
                ...state,
                currentExpression: undefined,
                stdout: state.stdout + printValue
            }
        }
        throw new Error("Unsupported function " + node.identifier.name);
    }
    if (node.type === "statement" && node.statementType === "expression") {
        const hasFinishedEvaluating = node.value === undefined || node.value.type === "constant";

        if(!hasFinishedEvaluating) {
            const newState = evaluate(root, node.value, state);
            return { ...newState, currentExpression: statement(newState.currentExpression) };
        }
    }
    if (node.type === "statement" && node.operator === "declaration") {
        if (node.value.type !== "constant") {
            const newState = evaluate(root, node.value, state);
            return { ...newState, currentExpression: declaration(node.datatype, node.identifier, newState.value) };
        }
        if (state.variables.some(v => v.identifier === node.identifier))
            throw new Error("Variable is already declared");
        const variables = [
            ...state.variables,
            { identifier: node.identifier, value: node.value }
        ];
        return { ...state, currentExpression: node.value, variables: variables };
    }
    if (node.type === "statement" && node.statementType === "if") {
        if(node.condition.type !== "constant") {
            const newState = evaluate(root, node.condition, state);
            return { ...newState, currentExpression: iff(newState.currentExpression, node.body) };
        }
    }
    if (node.type === "statement") {
        const nextStatement = findNextStatement(root, node, state);
        return { ...state, currentStatement: nextStatement, currentExpression: nextStatement };
    }
}

export { evaluate }