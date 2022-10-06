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
    flatten, iff
} from "../src/simulator/tree";

describe('tree', () => {
   it('should flatten tree with identifier', () => {
       const identifierNode = identifier("name");

       const expectedList = [
           identifierNode
       ];
       assert.deepEqual(flatten(identifierNode), expectedList);
   });

    it('should flatten tree with constant', () => {
        const constantNode = intConstant(5);

        const expectedList = [
            constantNode
        ];
        assert.deepEqual(flatten(constantNode), expectedList);
    });

    it('should flatten tree with statement', () => {
        const constantNode = intConstant(5);
        const statementNode = statement(constantNode);

        const expectedList = [
            statementNode,
            constantNode
        ];
        assert.deepEqual(flatten(statementNode), expectedList);
    });

    it('should flatten tree with declaration', () => {
        const identifierNode = identifier("name");
        const constantNode = intConstant(5);
        const declarationNode = intDeclaration(identifierNode, constantNode);

        const expectedList = [
            declarationNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(declarationNode), expectedList);
    });

    it('should flatten tree with and operator', () => {
        const identifierNode = identifier("name");
        const constantNode = intConstant(5);
        const andNode = and(identifierNode, constantNode);

        const expectedList = [
            andNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(andNode), expectedList);
    });

    it('should flatten tree with less than or equal operator', () => {
        const identifierNode = identifier("name");
        const constantNode = intConstant(5);
        const lessThanOrEqualNode = lessThanOrEqual(identifierNode, constantNode);

        const expectedList = [
            lessThanOrEqualNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(lessThanOrEqualNode), expectedList);
    });

    it('should flatten tree with less than or equal operator', () => {
        const identifierNode = identifier("name");
        const constantNode = intConstant(5);
        const equalNode = equal(identifierNode, constantNode);

        const expectedList = [
            equalNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(equalNode), expectedList);
    });

    it('should flatten tree with less than or assign operator', () => {
        const identifierNode = identifier("name");
        const constantNode = intConstant(5);
        const assignNode = assign(identifierNode, constantNode);

        const expectedList = [
            assignNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(assignNode), expectedList);
    });

    it('should flatten tree with less than or add assign operator', () => {
        const identifierNode = identifier("name");
        const constantNode = intConstant(5);
        const assignNode = addAssign(identifierNode, constantNode);

        const expectedList = [
            assignNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(assignNode), expectedList);
    });

    it('should flatten tree with increment operator', () => {
        const identifierNode = identifier("name");
        const incrementNode = increment(identifierNode);

        const expectedList = [
            incrementNode,
            identifierNode
        ];
        assert.deepEqual(flatten(incrementNode), expectedList);
    });

    it('should flatten tree with invocation (without arguments)', () => {
        const identifierNode = identifier("method");
        const invocationNode = invoke(identifierNode);

        const expectedList = [
            invocationNode,
            identifierNode
        ];
        assert.deepEqual(flatten(invocationNode), expectedList);
    });

    it('should flatten tree with invocation (with 1 arguments)', () => {
        const identifierNode = identifier("method");
        const constantNode = intConstant(0);
        const invocationNode = invoke(identifierNode, constantNode);

        const expectedList = [
            invocationNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(invocationNode), expectedList);
    });

    it('should flatten tree with invocation (with 2 arguments)', () => {
        const identifierNode = identifier("method");
        const constantNode1 = intConstant(0);
        const constantNode2 = intConstant(1);
        const invocationNode = invoke(identifierNode, constantNode1, constantNode2);

        const expectedList = [
            invocationNode,
            identifierNode,
            constantNode1,
            constantNode2
        ];
        assert.deepEqual(flatten(invocationNode), expectedList);
    });

    it('should flatten tree with for loop', () => {
        const identifierNode1 = identifier("i");
        const identifierNode2 = identifier("printf");
        const constantNode1 = intConstant(0);
        const constantNode2 = intConstant(5);
        const initializerNode = intDeclaration(identifierNode1, constantNode1);
        const lessThanNode = lessThanOrEqual(identifierNode1, constantNode2);
        const conditionNode = statement(lessThanNode);
        const incrementNode = increment(identifierNode1);
        const updateNode = statement(incrementNode);
        const invocationNode = invoke(identifierNode2, identifierNode1);
        const bodyNode = statement(invocationNode);
        const forLoopNode = forLoop(initializerNode, conditionNode, updateNode, bodyNode);

        const expectedList = [
            forLoopNode,
            initializerNode,
            identifierNode1,
            constantNode1,
            conditionNode,
            lessThanNode,
            identifierNode1,
            constantNode2,
            updateNode,
            incrementNode,
            identifierNode1,
            bodyNode,
            invocationNode,
            identifierNode2,
            identifierNode1
        ];
        assert.deepEqual(flatten(forLoopNode), expectedList);
    });

    it('should flatten tree with if statement', () => {
        const identifierNode1 = identifier("i");
        const identifierNode2 = identifier("printf");
        const constantNode2 = intConstant(5);
        const conditionNode = lessThanOrEqual(identifierNode1, constantNode2);
        const invocationNode = invoke(identifierNode2, identifierNode1);
        const statementNode = statement(invocationNode);
        const ifNode = iff(conditionNode, statementNode);

        const expectedList = [
            ifNode,
            conditionNode,
            identifierNode1,
            constantNode2,
            invocationNode,
            identifierNode2,
            identifierNode1
        ];
        assert.deepEqual(flatten(ifNode), expectedList);
    });

    it('should flatten tree with block statement', () => {
        const identifierNode = identifier("printf");
        const constantNode = intConstant(5);
        const invocationNode = invoke(identifierNode, constantNode);
        const statementNode = statement(invocationNode);
        const bodyNode = block(statementNode);

        const expectedList = [
            bodyNode,
            statementNode,
            invocationNode,
            identifierNode,
            constantNode
        ];
        assert.deepEqual(flatten(bodyNode), expectedList);
    });
});