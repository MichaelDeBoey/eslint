/**
 * @fileoverview Rule to disallow a negated condition
 * @author Alberto Rodríguez
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../types').Rule.RuleModule} */
module.exports = {
	meta: {
		type: "suggestion",

		docs: {
			description: "Disallow negated conditions",
			recommended: false,
			frozen: true,
			url: "https://eslint.org/docs/latest/rules/no-negated-condition",
		},

		schema: [],

		messages: {
			unexpectedNegated: "Unexpected negated condition.",
		},
	},

	create(context) {
		/**
		 * Determines if a given node is an if-else without a condition on the else
		 * @param {ASTNode} node The node to check.
		 * @returns {boolean} True if the node has an else without an if.
		 * @private
		 */
		function hasElseWithoutCondition(node) {
			return node.alternate && node.alternate.type !== "IfStatement";
		}

		/**
		 * Determines if a given node is a negated unary expression
		 * @param {Object} test The test object to check.
		 * @returns {boolean} True if the node is a negated unary expression.
		 * @private
		 */
		function isNegatedUnaryExpression(test) {
			return test.type === "UnaryExpression" && test.operator === "!";
		}

		/**
		 * Determines if a given node is a negated binary expression
		 * @param {Test} test The test to check.
		 * @returns {boolean} True if the node is a negated binary expression.
		 * @private
		 */
		function isNegatedBinaryExpression(test) {
			return (
				test.type === "BinaryExpression" &&
				(test.operator === "!=" || test.operator === "!==")
			);
		}

		/**
		 * Determines if a given node has a negated if expression
		 * @param {ASTNode} node The node to check.
		 * @returns {boolean} True if the node has a negated if expression.
		 * @private
		 */
		function isNegatedIf(node) {
			return (
				isNegatedUnaryExpression(node.test) ||
				isNegatedBinaryExpression(node.test)
			);
		}

		return {
			IfStatement(node) {
				if (!hasElseWithoutCondition(node)) {
					return;
				}

				if (isNegatedIf(node)) {
					context.report({
						node,
						messageId: "unexpectedNegated",
					});
				}
			},
			ConditionalExpression(node) {
				if (isNegatedIf(node)) {
					context.report({
						node,
						messageId: "unexpectedNegated",
					});
				}
			},
		};
	},
};
