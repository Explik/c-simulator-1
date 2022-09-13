import { assert } from 'chai';
import {
    declaration,
    identifier,
    intConstant,
    intDeclaration,
    stringConstant,
    stringDeclaration,
    and,
    lessThanOrEqual, assign, addAssign, increment, invoke, equal, statement, forLoop, block, nullStatement,
    iff
} from "../src/tree";
import { evaluate } from "../src/evaluator";

describe('evaluator', () => {
    it('should evaluate constant statement (step 1)', () => {
        const constantNode1 = intConstant(0);
        const constantNode2 = intConstant(1);
        const andNode = and(constantNode1, constantNode2);
        const statementNode = statement(andNode);

        const expectedState = {
            variables: [],
            stdout: "",
            currentStatement: statementNode,
            currentExpression: statement(intConstant(0)),
        };
        assert.deepEqual(evaluate(statementNode), expectedState);
    });

    it('should evaluate constant statement (step 2)', () => {
        const constantNode1 = intConstant(0);
        const constantNode2 = intConstant(1);
        const andNode = and(constantNode1, constantNode2);
        const statementNode = statement(andNode);

        const initialState = {
            variables: [],
            stdout: "",
            currentStatement: statementNode,
            currentExpression: statement(intConstant(0)),
        };

        const expectedState = {
            variables: [],
            stdout: "",
            currentStatement: undefined,
            currentExpression: undefined
        };
        assert.deepEqual(evaluate(statementNode, initialState), expectedState);
    });

    it('should evaluate constant declaration', () => {
        const identifierNode = identifier("name");
        const constantNode = intConstant(5);
        const declarationNode = declaration(identifierNode, constantNode);

        const expectedState = {
            variables: [
                { identifier: identifierNode, value: constantNode }
            ],
            currentExpression: undefined,
            currentStatement: undefined
        };
        assert.deepEqual(evaluate(declarationNode), expectedState);
    });

    it ('should evaluate calculated declaration (step 1)', () => {
        const identifierNode = identifier("name");
        const constantNode1 = intConstant(0);
        const constantNode2 = intConstant(1);
        const andNode = and(constantNode1, constantNode2);
        const declarationNode = declaration(identifierNode, andNode);

        const expectedState = {
            variables: [],
            currentExpression: declaration(identifierNode, intConstant(0)),
            currentStatement: declarationNode
        };
        assert.deepEqual(evaluate(declarationNode), expectedState);
    });

    it ('should evaluate calculated declaration (step 2)', () => {
        const identifierNode = identifier("name");
        const constantNode1 = intConstant(0);
        const constantNode2 = intConstant(1);
        const andNode = and(constantNode1, constantNode2);
        const declarationNode = declaration(identifierNode, andNode);

        const initialState = {
            variables: [],
            currentExpression: declaration(identifierNode, intConstant(0)),
            currentStatement: declarationNode
        };

        const expectedState = {
            variables: [
                { identifier: identifierNode, value: intConstant(0) }
            ],
            currentExpression: undefined,
            currentStatement: undefined
        };
        assert.deepEqual(evaluate(declarationNode, initialState), expectedState);
    });
});