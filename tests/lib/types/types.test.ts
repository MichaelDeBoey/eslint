/**
 * @fileoverview This file contains code intended to test our types.
 * It was initially extracted from the `@types/eslint` package.
 */

/*
 * MIT License
 * Copyright (c) Microsoft Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE
 */

import {
	AST,
	ESLint,
	Linter,
	loadESLint,
	Rule,
	JSRuleDefinition,
	RuleTester,
	Scope,
	SourceCode,
	JSSyntaxElement,
} from "eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { ESLintRules } from "eslint/rules";
import { Linter as ESLinter } from "eslint/universal";
import {
	builtinRules,
	FileEnumerator,
	FlatESLint,
	LegacyESLint,
	shouldUseFlatConfig,
} from "eslint/use-at-your-own-risk";
import {
	Comment,
	PrivateIdentifier,
	PropertyDefinition,
	StaticBlock,
	WhileStatement,
} from "estree";
import { Language, RuleDefinition, SettingsConfig } from "@eslint/core";

const SOURCE = `var foo = bar;`;

const AST: AST.Program = {
	type: "Program",
	sourceType: "module",
	body: [],
	comments: [],
	tokens: [],
	loc: {
		start: { line: 0, column: 0 },
		end: { line: 0, column: 0 },
	},
	range: [0, 0],
};

const TOKEN: AST.Token = {
	type: "Identifier",
	value: "foo",
	loc: {
		start: { line: 0, column: 0 },
		end: { line: 0, column: 3 },
	},
	range: [0, 3],
};

const COMMENT: Comment = {
	type: "Block",
	value: "foo",
	loc: {
		start: { line: 0, column: 0 },
		end: { line: 0, column: 0 },
	},
	range: [0, 0],
};

// #region SourceCode

let sourceCode = new SourceCode(SOURCE, AST);

SourceCode.splitLines(SOURCE);

sourceCode.getText();
sourceCode.getText(AST);
sourceCode.getText(AST, 0);
sourceCode.getText(AST, 0, 0);

sourceCode.getLines();

sourceCode.getAllComments();

sourceCode.getJSDocComment(AST); // $ExpectType Comment | null

sourceCode.getNodeByRangeIndex(0);

sourceCode.getNodeByRangeIndex(0);

sourceCode.isSpaceBetweenTokens(TOKEN, TOKEN);

sourceCode.isSpaceBetween(TOKEN, TOKEN);
sourceCode.isSpaceBetween(AST, TOKEN);
sourceCode.isSpaceBetween(TOKEN, AST);

const loc = sourceCode.getLocFromIndex(0);
loc.line; // $ExpectType number
loc.column; // $ExpectType number

sourceCode.getIndexFromLoc({ line: 0, column: 0 });

sourceCode.getTokenByRangeStart(0); // $ExpectType Token | null
sourceCode.getTokenByRangeStart(0, { includeComments: true }); // $ExpectType Comment | Token | null
sourceCode.getTokenByRangeStart(0, { includeComments: false }); // $ExpectType Token | null
sourceCode.getTokenByRangeStart(0, { includeComments: false as boolean }); // $ExpectType Comment | Token | null

sourceCode.getFirstToken(AST); // $ExpectType Token | null
sourceCode.getFirstToken(AST, 0);
sourceCode.getFirstToken(AST, { skip: 0 });
// $ExpectType (Token & { type: "Identifier"; }) | null
sourceCode.getFirstToken(
	AST,
	(t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
);
// $ExpectType (Token & { type: "Identifier"; }) | null
sourceCode.getFirstToken(AST, {
	filter: (t): t is AST.Token & { type: "Identifier" } =>
		t.type === "Identifier",
});
sourceCode.getFirstToken(AST, {
	skip: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getFirstToken(AST, { includeComments: true }); // $ExpectType Comment | Token | null
sourceCode.getFirstToken(AST, { includeComments: true, skip: 0 });
// prettier-ignore
sourceCode.getFirstToken(AST, { // $ExpectType (Token & { type: "Identifier"; }) | null
	includeComments: true,
	skip: 0,
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});

sourceCode.getFirstTokens(AST); // $ExpectType Token[]
sourceCode.getFirstTokens(AST, 0); // $ExpectType Token[]
sourceCode.getFirstTokens(AST, { count: 0 });
// $ExpectType (Token & { type: "Identifier"; })[]
sourceCode.getFirstTokens(
	AST,
	(t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
);
// $ExpectType (Token & { type: "Identifier"; })[]
sourceCode.getFirstTokens(AST, {
	filter: (t): t is AST.Token & { type: "Identifier" } =>
		t.type === "Identifier",
});
// prettier-ignore
sourceCode.getFirstTokens(AST, { // $ExpectType (Token & { type: "Identifier"; })[]
	count: 0,
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});
sourceCode.getFirstTokens(AST, { includeComments: true }); //  $ ExpectType (Comment | Token)[]
sourceCode.getFirstTokens(AST, { includeComments: true, count: 0 }); //  $ ExpectType (Comment | Token)[]
// prettier-ignore
sourceCode.getFirstTokens(AST, { // $ExpectType (Token & { type: "Identifier"; })[]
	includeComments: true,
	count: 0,
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});

sourceCode.getLastToken(AST);
sourceCode.getLastToken(AST, 0);
sourceCode.getLastToken(AST, { skip: 0 });
sourceCode.getLastToken(AST, t => t.type === "Identifier");
sourceCode.getLastToken(AST, { filter: t => t.type === "Identifier" });
sourceCode.getLastToken(AST, {
	skip: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getLastToken(AST, { includeComments: true });
sourceCode.getLastToken(AST, { includeComments: true, skip: 0 });
sourceCode.getLastToken(AST, {
	includeComments: true,
	skip: 0,
	filter: t => t.type === "Identifier",
});

sourceCode.getLastTokens(AST);
sourceCode.getLastTokens(AST, 0);
sourceCode.getLastTokens(AST, { count: 0 });
sourceCode.getLastTokens(AST, t => t.type === "Identifier");
sourceCode.getLastTokens(AST, { filter: t => t.type === "Identifier" });
sourceCode.getLastTokens(AST, {
	count: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getLastTokens(AST, { includeComments: true });
sourceCode.getLastTokens(AST, { includeComments: true, count: 0 });
sourceCode.getLastTokens(AST, {
	includeComments: true,
	count: 0,
	filter: t => t.type === "Identifier",
});

sourceCode.getTokenBefore(AST);
sourceCode.getTokenBefore(AST, 0);
sourceCode.getTokenBefore(AST, { skip: 0 });
sourceCode.getTokenBefore(AST, t => t.type === "Identifier");
sourceCode.getTokenBefore(AST, { filter: t => t.type === "Identifier" });
sourceCode.getTokenBefore(AST, {
	skip: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokenBefore(AST, { includeComments: true });
sourceCode.getTokenBefore(AST, { includeComments: true, skip: 0 });
sourceCode.getTokenBefore(AST, {
	includeComments: true,
	skip: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokenBefore(TOKEN, 0);
sourceCode.getTokenBefore(COMMENT, 0);

sourceCode.getTokensBefore(AST);
sourceCode.getTokensBefore(AST, 0);
sourceCode.getTokensBefore(AST, { count: 0 });
sourceCode.getTokensBefore(AST, t => t.type === "Identifier");
sourceCode.getTokensBefore(AST, { filter: t => t.type === "Identifier" });
sourceCode.getTokensBefore(AST, {
	count: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokensBefore(AST, { includeComments: true });
sourceCode.getTokensBefore(AST, { includeComments: true, count: 0 });
sourceCode.getTokensBefore(AST, {
	includeComments: true,
	count: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokensBefore(TOKEN, 0);
sourceCode.getTokensBefore(COMMENT, 0);

sourceCode.getTokenAfter(AST);
sourceCode.getTokenAfter(AST, 0);
sourceCode.getTokenAfter(AST, { skip: 0 });
sourceCode.getTokenAfter(AST, t => t.type === "Identifier");
sourceCode.getTokenAfter(AST, { filter: t => t.type === "Identifier" });
sourceCode.getTokenAfter(AST, {
	skip: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokenAfter(AST, { includeComments: true });
sourceCode.getTokenAfter(AST, { includeComments: true, skip: 0 });
sourceCode.getTokenAfter(AST, {
	includeComments: true,
	skip: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokenAfter(TOKEN, 0);
sourceCode.getTokenAfter(COMMENT, 0);

sourceCode.getTokensAfter(AST);
sourceCode.getTokensAfter(AST, 0);
sourceCode.getTokensAfter(AST, { count: 0 });
sourceCode.getTokensAfter(AST, t => t.type === "Identifier");
sourceCode.getTokensAfter(AST, { filter: t => t.type === "Identifier" });
sourceCode.getTokensAfter(AST, {
	count: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokensAfter(AST, { includeComments: true });
sourceCode.getTokensAfter(AST, { includeComments: true, count: 0 });
sourceCode.getTokensAfter(AST, {
	includeComments: true,
	count: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getTokensAfter(TOKEN, 0);
sourceCode.getTokensAfter(COMMENT, 0);

sourceCode.getFirstTokenBetween(AST, AST); // $ExpectType Token | null
sourceCode.getFirstTokenBetween(AST, AST, 0);
sourceCode.getFirstTokenBetween(AST, AST, { skip: 0 });
// $ExpectType (Token & { type: "Identifier"; }) | null
sourceCode.getFirstTokenBetween(
	AST,
	AST,
	(t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
);
// prettier-ignore
sourceCode.getFirstTokenBetween(AST, AST, { // $ExpectType (Token & { type: "Identifier"; }) | null
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});
sourceCode.getFirstTokenBetween(AST, AST, {
	skip: 0,
	filter: (t): t is AST.Token & { type: "Identifier" } =>
		t.type === "Identifier",
});
sourceCode.getFirstTokenBetween(AST, AST, { includeComments: true }); // $ExpectType Comment | Token | null
sourceCode.getFirstTokenBetween(AST, AST, { includeComments: true, skip: 0 });
// prettier-ignore
sourceCode.getFirstTokenBetween(AST, AST, { // $ExpectType (Token & { type: "Identifier"; }) | null
	includeComments: true,
	skip: 0,
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});

sourceCode.getFirstTokensBetween(AST, AST); // $ExpectType Token[]
sourceCode.getFirstTokensBetween(AST, AST, 0);
sourceCode.getFirstTokensBetween(AST, AST, { count: 0 });
// $ExpectType (Token & { type: "Identifier"; })[]
sourceCode.getFirstTokensBetween(
	AST,
	AST,
	(t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
);
// prettier-ignore
sourceCode.getFirstTokensBetween(AST, AST, { // $ExpectType (Token & { type: "Identifier"; })[]
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});
sourceCode.getFirstTokensBetween(AST, AST, {
	count: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getFirstTokensBetween(AST, AST, { includeComments: true }); // $ExpectType (Comment | Token)[]
sourceCode.getFirstTokensBetween(AST, AST, { includeComments: true, count: 0 });
// prettier-ignore
sourceCode.getFirstTokensBetween(AST, AST, { // $ExpectType (Token & { type: "Identifier"; })[]
	includeComments: true,
	count: 0,
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});

sourceCode.getLastTokenBetween(AST, AST);
sourceCode.getLastTokenBetween(AST, AST, 0);
sourceCode.getLastTokenBetween(AST, AST, { skip: 0 });
sourceCode.getLastTokenBetween(AST, AST, t => t.type === "Identifier");
sourceCode.getLastTokenBetween(AST, AST, {
	filter: t => t.type === "Identifier",
});
sourceCode.getLastTokenBetween(AST, AST, {
	skip: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getLastTokenBetween(AST, AST, { includeComments: true });
sourceCode.getLastTokenBetween(AST, AST, { includeComments: true, skip: 0 });
sourceCode.getLastTokenBetween(AST, AST, {
	includeComments: true,
	skip: 0,
	filter: t => t.type === "Identifier",
});

sourceCode.getLastTokensBetween(AST, AST);
sourceCode.getLastTokensBetween(AST, AST, 0);
sourceCode.getLastTokensBetween(AST, AST, { count: 0 });
sourceCode.getLastTokensBetween(AST, AST, t => t.type === "Identifier");
sourceCode.getLastTokensBetween(AST, AST, {
	filter: t => t.type === "Identifier",
});
sourceCode.getLastTokensBetween(AST, AST, {
	count: 0,
	filter: t => t.type === "Identifier",
});
sourceCode.getLastTokensBetween(AST, AST, { includeComments: true });
sourceCode.getLastTokensBetween(AST, AST, { includeComments: true, count: 0 });
sourceCode.getLastTokensBetween(AST, AST, {
	includeComments: true,
	count: 0,
	filter: t => t.type === "Identifier",
});

sourceCode.getTokensBetween(AST, AST);
sourceCode.getTokensBetween(AST, AST, 0);

sourceCode.getTokens(AST); // $ExpectType Token[]
sourceCode.getTokens(AST, 0);
sourceCode.getTokens(AST, 0, 0);
// $ExpectType (Token & { type: "Identifier"; })[]
sourceCode.getTokens(
	AST,
	(t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
);
// $ExpectType (Token & { type: "Identifier"; })[]
sourceCode.getTokens(AST, {
	filter: (t): t is AST.Token & { type: "Identifier" } =>
		t.type === "Identifier",
});
sourceCode.getTokens(AST, { includeComments: true }); // $ExpectType (Comment | Token)[]
// prettier-ignore
sourceCode.getTokens(AST, { // $ExpectType (Token & { type: "Identifier"; })[]
	includeComments: true,
	filter: (t): t is AST.Token & { type: "Identifier" } => t.type === "Identifier",
});

sourceCode.commentsExistBetween(AST, AST);
sourceCode.commentsExistBetween(TOKEN, TOKEN);
sourceCode.commentsExistBetween(COMMENT, COMMENT);

sourceCode.getCommentsBefore(AST);
sourceCode.getCommentsBefore(TOKEN);

sourceCode.getCommentsAfter(AST);
sourceCode.getCommentsAfter(TOKEN);

sourceCode.getCommentsInside(AST);

sourceCode.markVariableAsUsed("foo");
sourceCode.markVariableAsUsed("foo", AST);

sourceCode.getDeclaredVariables(AST); // $ExpectType Variable[]

sourceCode.getAncestors(AST); // $ExpectType Node[]

// #endregion

// #region Scope

const scopeManager: Scope.ScopeManager = {
	scopes: [],
	globalScope: null,
	acquire(node, inner) {
		return scopeManager.scopes[0];
	},
	getDeclaredVariables() {
		return [];
	},
};

const scope = scopeManager.scopes[0];

const variable = scope.variables[0];

variable.name = "foo";

variable.identifiers[0].type = "Identifier";

variable.defs[0].name.type = "Identifier";
variable.defs[0].type;
variable.defs[0].node;
variable.defs[0].parent;

const reference = scope.references[0];

reference.from = scope;
reference.identifier.type = "Identifier";
reference.resolved = variable;
reference.writeExpr = AST;
reference.init = true;

reference.isRead();
reference.isReadOnly();
reference.isWrite();
reference.isWriteOnly();
reference.isReadWrite();

// #endregion

// #region Rule

const oldStyleRule = (context: Rule.RuleContext) => ({});

let rule: Rule.RuleModule;

// @ts-expect-error
rule = oldStyleRule;

rule = {
	create(context) {
		return {};
	},
};
rule = {
	create(context) {
		return {};
	},
	meta: {},
};
rule = {
	create(context) {
		return {};
	},
	meta: {
		docs: {
			description: "disallow the use of `console`",
			category: "Possible Errors",
			recommended: true,
			url: "https://eslint.org/docs/rules/no-console",
		},
		hasSuggestions: true,
	},
};
rule = {
	create(context) {
		return {};
	},
	meta: { fixable: "whitespace" },
};
rule = {
	create(context) {
		return {};
	},
	meta: { fixable: "code" },
};
rule = {
	create(context) {
		return {};
	},
	meta: { schema: [{ enum: ["always", "never"] }] },
};
rule = {
	create(context) {
		return {};
	},
	meta: { schema: false },
};
rule = {
	create(context) {
		return {};
	},
	meta: { deprecated: true, replacedBy: ["other-rule-name"] },
};
rule = {
	create(context) {
		return {};
	},
	meta: { deprecated: { message: "message", url: "https://example.com" } },
};
rule = {
	create(context) {
		return {};
	},
	meta: { deprecated: { availableUntil: "10.0.0" } },
};
rule = {
	create(context) {
		return {};
	},
	meta: { deprecated: { availableUntil: null } },
};
rule = {
	create(context) {
		return {};
	},
	meta: { deprecated: { deprecatedSince: "9.0.0" } },
};
rule = {
	create(context) {
		return {};
	},
	meta: { deprecated: { replacedBy: [] } },
};
rule = {
	create(context) {
		return {};
	},
	meta: {
		deprecated: {
			replacedBy: [{ message: "message", url: "https://example.com" }],
		},
	},
};
rule = {
	create(context) {
		return {};
	},
	meta: {
		deprecated: {
			replacedBy: [{ plugin: { name: "eslint-plugin-example" } }],
		},
	},
};
rule = {
	create(context) {
		return {};
	},
	meta: {
		deprecated: {
			replacedBy: [
				{ rule: { name: "rule-id", url: "https://example.com" } },
			],
		},
	},
};
rule = {
	create(context) {
		return {};
	},
	meta: { type: "layout" },
};
rule = {
	create(context) {
		return {};
	},
	meta: {
		docs: {
			description: "disallow the use of `console`",
			category: "Possible Errors",
			recommended: true,
			url: "https://eslint.org/docs/rules/no-console",
		},
		hasSuggestions: true,
	},
};
rule = {
	create(context) {
		const foo: string = context.options[0];
		const baz: number = context.options[1]?.baz ?? false;
		return {};
	},
};

rule = {
	create(context: Rule.RuleContext) {
		context.filename;

		context.getFilename();

		context.physicalFilename;

		context.getPhysicalFilename();

		context.cwd;

		context.getCwd();

		context.languageOptions;
		context.languageOptions
			.ecmaVersion satisfies Linter.LanguageOptions["ecmaVersion"];

		context.options; // $ExpectType any[]

		context.sourceCode;
		context.sourceCode.getLocFromIndex(42);

		context.getSourceCode();
		context.getSourceCode().getLocFromIndex(42);

		if (typeof context.parserPath === "string") {
			context.parserPath;
		} else {
			context.languageOptions?.parser;
		}

		// @ts-expect-error wrong `node` type
		context.report({ message: "foo", node: {} });

		context.report({ message: "foo", node: AST });
		context.report({
			message: "foo",
			loc: { start: { line: 0, column: 0 }, end: { line: 1, column: 1 } },
		});
		context.report({ message: "foo", node: AST, data: { foo: "bar" } });
		context.report({ message: "foo", node: AST, fix: () => null });
		context.report({
			message: "foo",
			node: AST,
			fix: ruleFixer => ruleFixer.replaceText(AST, "foo"),
		});

		context.report({
			message: "foo",
			node: AST,
			fix: ruleFixer => {
				ruleFixer.insertTextAfter(AST, "foo");
				ruleFixer.insertTextAfter(TOKEN, "foo");

				ruleFixer.insertTextAfterRange([0, 0], "foo");

				ruleFixer.insertTextBefore(AST, "foo");
				ruleFixer.insertTextBefore(TOKEN, "foo");

				ruleFixer.insertTextBeforeRange([0, 0], "foo");

				ruleFixer.remove(AST);
				ruleFixer.remove(TOKEN);

				ruleFixer.removeRange([0, 0]);

				ruleFixer.replaceText(AST, "foo");
				ruleFixer.replaceText(TOKEN, "foo");

				ruleFixer.replaceTextRange([0, 0], "foo");

				return null;
			},
		});

		context.report({
			message: "foo",
			node: AST,
			fix: ruleFixer => {
				return [
					ruleFixer.insertTextAfter(AST, "foo"),
					ruleFixer.insertTextAfter(TOKEN, "foo"),
				];
			},
		});

		context.report({
			message: "foo",
			node: AST,
			suggest: [
				{
					desc: "foo",
					fix: ruleFixer => {
						return [
							ruleFixer.insertTextAfter(AST, "foo"),
							ruleFixer.insertTextAfter(TOKEN, "foo"),
						];
					},
				},
				{
					messageId: "foo",
					fix: ruleFixer => {
						return [
							ruleFixer.insertTextAfter(AST, "foo"),
							ruleFixer.insertTextAfter(TOKEN, "foo"),
						];
					},
				},
				{
					desc: "foo",
					fix: ruleFixer => null,
				},
			],
		});

		(violation: Rule.ReportDescriptor) => context.report(violation);

		return {
			onCodePathStart(codePath, node) {
				const origin: Rule.CodePathOrigin = codePath.origin;
			},
			onCodePathEnd(codePath, node) {
				const origin: Rule.CodePathOrigin = codePath.origin;
			},
			onCodePathSegmentStart(segment, node) {},
			onCodePathSegmentEnd(segment, node) {},
			onCodePathSegmentLoop(fromSegment, toSegment, node) {},
			IfStatement(node) {
				node.parent;
			},
			WhileStatement(node: WhileStatement) {},
			Program(node) {
				// @ts-expect-error
				node.parent;
			},
			"Program:exit"(node) {
				node.body;
			},
			"IfStatement:exit"(node) {
				node.parent;
			},
			'MemberExpression[object.name="req"]': (node: Rule.Node) => {
				node.parent;
			},
			PrivateIdentifier(node) {
				const expected: PrivateIdentifier & Rule.NodeParentExtension =
					node;
				expected.parent;
			},
			PropertyDefinition(node) {
				const expected: PropertyDefinition & Rule.NodeParentExtension =
					node;
				expected.parent;
			},
			StaticBlock(node) {
				const expected: StaticBlock & Rule.NodeParentExtension = node;
				expected.parent;
			},
		};
	},
};

let rule2: RuleDefinition;
rule2 = {
	create(context) {
		return {};
	},
	meta: {},
};
type DeprecatedRuleContextKeys =
	| "getAncestors"
	| "getDeclaredVariables"
	| "getScope"
	| "markVariableAsUsed";
(): RuleDefinition => ({
	create(context) {
		// Ensure that deprecated RuleContext methods are not defined when using RuleDefinition
		context satisfies {
			[Key in keyof typeof context]: Key extends DeprecatedRuleContextKeys
				? never
				: (typeof context)[Key];
		};
		return {};
	},
});

// All options optional - JSRuleDefinition and JSRuleDefinition<{}>
// should be the same type.
(rule1: JSRuleDefinition, rule2: JSRuleDefinition<{}>) => {
	rule1 satisfies typeof rule2;
	rule2 satisfies typeof rule1;
};

// Type restrictions should be enforced
(): JSRuleDefinition<{
	RuleOptions: [string, number];
	MessageIds: "foo" | "bar";
	ExtRuleDocs: { foo: string; bar: number };
}> => ({
	meta: {
		messages: {
			foo: "FOO",

			// @ts-expect-error Wrong type for message ID
			bar: 42,
		},
		docs: {
			foo: "FOO",

			// @ts-expect-error Wrong type for declared property
			bar: "BAR",

			// @ts-expect-error Wrong type for predefined property
			description: 42,
		},
	},
	create({ options }) {
		// Types for rule options
		options[0] satisfies string;
		options[1] satisfies number;

		return {};
	},
});

// Undeclared properties should produce an error
(): JSRuleDefinition<{
	MessageIds: "foo" | "bar";
	ExtRuleDocs: { foo: number; bar: string };
}> => ({
	meta: {
		messages: {
			foo: "FOO",

			// Declared message ID is not required
			// bar: "BAR",

			// @ts-expect-error Undeclared message ID is not allowed
			baz: "BAZ",
		},
		docs: {
			foo: 42,

			// Declared property is not required
			// bar: "BAR",

			// @ts-expect-error Undeclared property key is not allowed
			baz: "BAZ",

			// Predefined property is allowed
			description: "Lorem ipsum",
		},
	},
	create() {
		return {};
	},
});

(): JSRuleDefinition => ({
	create(context) {
		context.cwd satisfies string; // $ExpectType string
		context.filename satisfies string; // $ExpectType string
		context.id satisfies string; // $ExpectType string
		context.languageOptions satisfies Linter.LanguageOptions; // $ExpectType LanguageOptions
		context.options satisfies unknown[]; // $ExpectType unknown[]
		context.physicalFilename satisfies string; // $ExpectType string
		context.settings satisfies SettingsConfig; // $ExpectType SettingsConfig
		context.sourceCode satisfies SourceCode; // $ExpectType SourceCode

		return {};
	},
});

// #endregion

// #region Linter

const linter = new Linter();
const eslinter = new ESLinter();

linter.version;

linter.verify(SOURCE, {});
linter.verify(new SourceCode(SOURCE, AST), {});

linter.verify(SOURCE, {}, "test.js");
linter.verify(SOURCE, {}, {});
linter.verify(SOURCE, {}, { filename: "test.js" });
linter.verify(SOURCE, {}, { allowInlineConfig: false });
linter.verify(SOURCE, {}, { reportUnusedDisableDirectives: true });
linter.verify(SOURCE, {}, { preprocess: input => input.split(" ") });
linter.verify(SOURCE, {}, { postprocess: problemList => problemList[0] });

linter.verify(SOURCE, { parserOptions: { ecmaVersion: 2021 } }, "test.js");
linter.verify(SOURCE, { parserOptions: { ecmaVersion: 2022 } }, "test.js");
linter.verify(SOURCE, { parserOptions: { ecmaVersion: 2023 } }, "test.js");
linter.verify(SOURCE, { parserOptions: { ecmaVersion: 2024 } }, "test.js");
linter.verify(SOURCE, { parserOptions: { ecmaVersion: 2025 } }, "test.js");
linter.verify(SOURCE, { parserOptions: { ecmaVersion: 2026 } }, "test.js");
linter.verify(SOURCE, { parserOptions: { ecmaVersion: "latest" } }, "test.js");
linter.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 6, ecmaFeatures: { globalReturn: true } } },
	"test.js",
);
linter.verify(
	SOURCE,
	{
		parserOptions: {
			ecmaVersion: 3,
			allowReserved: true,
		},
	},
	"test.js",
);
linter.verify(SOURCE, { env: { node: true } }, "test.js");
linter.verify(SOURCE, { globals: { foo: true } }, "test.js");
linter.verify(SOURCE, { globals: { foo: "off" } }, "test.js");
linter.verify(SOURCE, { globals: { foo: "readonly" } }, "test.js");
linter.verify(SOURCE, { globals: { foo: "readable" } }, "test.js");
linter.verify(SOURCE, { globals: { foo: "writable" } }, "test.js");
linter.verify(SOURCE, { globals: { foo: "writeable" } }, "test.js");
linter.verify(SOURCE, { parser: "custom-parser" }, "test.js");
linter.verify(SOURCE, { settings: { info: "foo" } }, "test.js");
linter.verify(SOURCE, { processor: "a-plugin/a-processor" }, "test.js");
linter.verify(SOURCE, { plugins: ["a-plugin"] }, "test.js");
linter.verify(SOURCE, { root: true }, "test.js");
linter.verify(SOURCE, { extends: "eslint-config-bad-guy" }, "test.js");
linter.verify(
	SOURCE,
	{ extends: ["eslint-config-bad-guy", "eslint-config-roblox"] },
	"test.js",
);

linter.verify(SOURCE, { rules: {} }, "test.js");
linter.verify(SOURCE, { rules: { quotes: 2 } }, "test.js");
linter.verify(SOURCE, { rules: { quotes: [2, "double"] } }, "test.js");
linter.verify(
	SOURCE,
	{ rules: { "no-unused-vars": [2, { vars: "all" }] } },
	"test.js",
);
linter.verify(SOURCE, { rules: { "no-console": 1 } }, "test.js");
linter.verify(SOURCE, { rules: { "no-console": 0 } }, "test.js");
linter.verify(SOURCE, { rules: { "no-console": "error" } }, "test.js");
linter.verify(
	SOURCE,
	{
		rules: { "no-console": "error" },
		overrides: [
			{
				extends: ["eslint-config-bad-guy"],
				excludedFiles: ["*-test.js", "*.spec.js"],
				files: ["*-test.js", "*.spec.js"],
				rules: {
					"no-unused-expressions": "off",
				},
			},
		],
	},
	"test.js",
);
linter.verify(SOURCE, { rules: { "no-console": "warn" } }, "test.js");
linter.verify(SOURCE, { rules: { "no-console": "off" } }, "test.js");
linter.verify(
	SOURCE,
	{ rules: { "no-void": [2, { allowAsStatement: true }] } },
	"test.js",
);

const lintingResult = linter.verify(SOURCE, {});

for (const msg of lintingResult) {
	msg.severity = 1;
	msg.severity = 2;

	msg.ruleId = "foo";

	msg.fatal = true;

	msg.message = "foo";
	msg.messageId = "foo";

	msg.line = 0;
	msg.endLine = 0;
	msg.column = 0;
	msg.endColumn = 0;

	if (msg.fix) {
		msg.fix.text = "foo";
		msg.fix.range = [0, 0];
	}

	if (msg.suggestions) {
		for (const suggestion of msg.suggestions) {
			suggestion.desc = "foo";
			suggestion.messageId = "foo";
			suggestion.fix.text = "foo";
			suggestion.fix.range = [0, 0];
		}
	}
}

linter.verifyAndFix(SOURCE, {});
linter.verifyAndFix(SOURCE, {}, "test.js");
linter.verifyAndFix(SOURCE, {}, { fix: false });

const fixResult = linter.verifyAndFix(SOURCE, {});

fixResult.fixed = true;
fixResult.output = "foo";

for (const msg of fixResult.messages) {
	msg.ruleId = "foo";
}

sourceCode = linter.getSourceCode();

linter.defineRule("test", rule);

linter.defineRules({
	foo: rule,
	bar: rule,
});

linter.getRules();

linter.defineParser("custom-parser", {
	name: "foo",
	version: "1.2.3",
	meta: {
		name: "foo",
		version: "1.2.3",
	},
	parse: (src, opts) => AST,
});
linter.defineParser("custom-parser", {
	name: "foo",
	version: "1.2.3",
	meta: {
		name: "foo",
		version: "1.2.3",
	},
	parseForESLint(src, opts): Linter.ESLintParseResult {
		return {
			ast: AST,
			visitorKeys: {},
			services: {},
			scopeManager,
		};
	},
});

linter.getFixPassCount(); // $ExpectType number

(index: number, ruleId: string) => {
	const pass = linter.getTimes().passes[index];
	pass.fix.total; // $ExpectType number
	pass.parse.total; // $ExpectType number
	pass.rules![ruleId].total; // $ExpectType number
	delete pass.rules;
	pass.total; // $ExpectType number
};

const _processor: Linter.Processor = {
	name: "foo",
	version: "1.2.3",
	meta: {
		name: "foo",
		version: "1.2.3",
	},
	supportsAutofix: true,
	preprocess(text, filename) {
		return [
			text,
			{
				text: "",
				filename: "1.js",
			},
		];
	},
	postprocess(messages, filename) {
		return ([] as Linter.LintMessage[]).concat(...messages);
	},
};

// #region Linter with flat config

const linterWithFlatConfig = new Linter({ configType: "flat" });

linterWithFlatConfig.version;

linterWithFlatConfig.verify(SOURCE, [{}]);
linterWithFlatConfig.verify(new SourceCode(SOURCE, AST), [{}]);

linterWithFlatConfig.verify(SOURCE, [{}], "test.js");
linterWithFlatConfig.verify(SOURCE, [{}], {});
linterWithFlatConfig.verify(SOURCE, [{}], { filename: "test.js" });
linterWithFlatConfig.verify(SOURCE, [{}], { allowInlineConfig: false });
linterWithFlatConfig.verify(SOURCE, [{}], {
	reportUnusedDisableDirectives: true,
});
linterWithFlatConfig.verify(SOURCE, [{}], {
	preprocess: input => input.split(" "),
});
linterWithFlatConfig.verify(SOURCE, [{}], {
	postprocess: problemList => problemList[0],
});
linterWithFlatConfig.verify(SOURCE, [{}], {
	filterCodeBlock(filename) {
		return filename.endsWith(".js");
	},
});

linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: 2021 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: 2022 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: 2023 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: 2024 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: 2025 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: 2026 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: "latest" } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ languageOptions: { ecmaVersion: 6 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[
		{
			languageOptions: {
				ecmaVersion: 6,
				globals: {
					true: true,
					false: false,
					foo: "readonly",
					bar: "writable",
					baz: "off",
				},
			},
		},
	],
	"test.js",
);

linterWithFlatConfig.verify(SOURCE, [{ rules: {} }], "test.js");
linterWithFlatConfig.verify(SOURCE, [{ rules: { quotes: 2 } }], "test.js");
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { quotes: [2, "double"] } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { "no-unused-vars": [2, { vars: "all" }] } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { "no-console": 1 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { "no-console": 0 } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { "no-console": "error" } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[
		{
			rules: { "no-console": "error" },
		},
		{
			files: ["*-test.js", "*.spec.js"],
			rules: {
				"no-unused-expressions": "off",
			},
		},
	],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { "no-console": "warn" } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { "no-console": "off" } }],
	"test.js",
);
linterWithFlatConfig.verify(
	SOURCE,
	[{ rules: { "no-void": [2, { allowAsStatement: true }] } }],
	"test.js",
);

linterWithFlatConfig.verify(SOURCE, { linterOptions: {} }, "test.js");
linterWithFlatConfig.verify(
	SOURCE,
	{ linterOptions: {} },
	{ filename: "test.js" },
);
linterWithFlatConfig.verifyAndFix(SOURCE, { linterOptions: {} }, "test.js");
linterWithFlatConfig.verifyAndFix(
	SOURCE,
	{ linterOptions: {} },
	{ filename: "test.js" },
);
linterWithFlatConfig.verifyAndFix(
	SOURCE,
	{ linterOptions: {} },
	{
		filterCodeBlock(filename) {
			return filename.endsWith(".js");
		},
	},
);

// #endregion Linter with flat config

// #region Linter with eslintrc config

const linterWithEslintrcConfig = new Linter({ configType: "eslintrc" });

linterWithEslintrcConfig.version;

linterWithEslintrcConfig.verify(SOURCE, {});
linterWithEslintrcConfig.verify(new SourceCode(SOURCE, AST), {});

linterWithEslintrcConfig.verify(SOURCE, {}, "test.js");
linterWithEslintrcConfig.verify(SOURCE, {}, {});
linterWithEslintrcConfig.verify(SOURCE, {}, { filename: "test.js" });
linterWithEslintrcConfig.verify(SOURCE, {}, { allowInlineConfig: false });
linterWithEslintrcConfig.verify(
	SOURCE,
	{},
	{ reportUnusedDisableDirectives: true },
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{},
	{ preprocess: input => input.split(" ") },
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{},
	{ postprocess: problemList => problemList[0] },
);

linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 2021 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 2022 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 2023 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 2024 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 2025 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 2026 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: "latest" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ parserOptions: { ecmaVersion: 6, ecmaFeatures: { globalReturn: true } } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{
		parserOptions: {
			ecmaVersion: 3,
			allowReserved: true,
		},
	},
	"test.js",
);
linterWithEslintrcConfig.verify(SOURCE, { env: { node: true } }, "test.js");
linterWithEslintrcConfig.verify(SOURCE, { globals: { foo: true } }, "test.js");
linterWithEslintrcConfig.verify(SOURCE, { globals: { foo: "off" } }, "test.js");
linterWithEslintrcConfig.verify(
	SOURCE,
	{ globals: { foo: "readonly" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ globals: { foo: "readable" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ globals: { foo: "writable" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ globals: { foo: "writeable" } },
	"test.js",
);
linterWithEslintrcConfig.verify(SOURCE, { parser: "custom-parser" }, "test.js");
linterWithEslintrcConfig.verify(
	SOURCE,
	{ settings: { info: "foo" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ processor: "a-plugin/a-processor" },
	"test.js",
);
linterWithEslintrcConfig.verify(SOURCE, { plugins: ["a-plugin"] }, "test.js");
linterWithEslintrcConfig.verify(SOURCE, { root: true }, "test.js");
linterWithEslintrcConfig.verify(
	SOURCE,
	{ extends: "eslint-config-bad-guy" },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ extends: ["eslint-config-bad-guy", "eslint-config-roblox"] },
	"test.js",
);

linterWithEslintrcConfig.verify(SOURCE, { rules: {} }, "test.js");
linterWithEslintrcConfig.verify(SOURCE, { rules: { quotes: 2 } }, "test.js");
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { quotes: [2, "double"] } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { "no-unused-vars": [2, { vars: "all" }] } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { "no-console": 1 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { "no-console": 0 } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { "no-console": "error" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{
		rules: { "no-console": "error" },
		overrides: [
			{
				extends: ["eslint-config-bad-guy"],
				excludedFiles: ["*-test.js", "*.spec.js"],
				files: ["*-test.js", "*.spec.js"],
				rules: {
					"no-unused-expressions": "off",
				},
			},
		],
	},
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { "no-console": "warn" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { "no-console": "off" } },
	"test.js",
);
linterWithEslintrcConfig.verify(
	SOURCE,
	{ rules: { "no-void": [2, { allowAsStatement: true }] } },
	"test.js",
);

linterWithEslintrcConfig.getRules();

// #endregion Linter with eslintrc config

// #endregion Linter

// #region ESLint

{
	let eslint: ESLint;

	eslint = new ESLint();
	eslint = new ESLint({ allowInlineConfig: false });
	eslint = new ESLint({ baseConfig: {} });
	eslint = new ESLint({ cache: true });
	eslint = new ESLint({ cacheLocation: "foo" });
	eslint = new ESLint({ cacheStrategy: "content" });
	eslint = new ESLint({ cwd: "foo" });
	eslint = new ESLint({ errorOnUnmatchedPattern: true });
	eslint = new ESLint({ fix: true });
	eslint = new ESLint({ fix: message => false });
	eslint = new ESLint({ fixTypes: ["directive", "problem"] });
	eslint = new ESLint({ flags: ["foo", "bar"] });
	eslint = new ESLint({ globInputPaths: true });
	eslint = new ESLint({ ignore: true });
	eslint = new ESLint({ ignorePatterns: ["foo", "bar"] });
	eslint = new ESLint({ overrideConfig: {} });

	eslint = new ESLint({ overrideConfigFile: "foo" });
	eslint = new ESLint({ overrideConfigFile: true });
	eslint = new ESLint({ overrideConfigFile: null });
	// @ts-expect-error `overrideConfigFile` cannot be `false`
	eslint = new ESLint({ overrideConfigFile: false });

	eslint = new ESLint({ plugins: { foo: {} } });
	eslint = new ESLint({
		ruleFilter({ severity }) {
			return severity === 1;
		},
	});
	eslint = new ESLint({ stats: true });
	eslint = new ESLint({
		plugins: {
			bar: {
				name: "bar",
				version: "1.0.0",
				meta: {
					name: "bar",
					namespace: "bar",
					version: "1.0.0",
				},
				configs: {
					myConfig: {
						noInlineConfig: true,
					},
					production: {
						languageOptions: {
							ecmaVersion: 6,
						},
					},
				},
				processors: {
					myProcessor: {
						name: "blah",
						version: "1.2.3",
						meta: {
							name: "blah",
							version: "1.2.3",
						},
						supportsAutofix: false,
					},
				},
				rules: {
					myRule: {
						create(context) {
							return {};
						},
						meta: {},
					},
				},
			},
		},
	});

	let resultsPromise = eslint.lintFiles(["myfile.js", "lib/"]);

	resultsPromise = eslint.lintText(SOURCE, { filePath: "foo" });

	eslint.calculateConfigForFile("./config.json");

	eslint.isPathIgnored("./dist/index.js");

	let formatterPromise: Promise<ESLint.Formatter>;

	formatterPromise = eslint.loadFormatter("codeframe");
	formatterPromise = eslint.loadFormatter();

	const customFormatter1: ESLint.Formatter = { format: () => "ok" };
	const customFormatter2: ESLint.Formatter = {
		format: () => Promise.resolve("ok"),
	};

	let resultsMeta: ESLint.ResultsMeta;
	const meta: Rule.RuleMetaData = {
		type: "suggestion",
		docs: {
			description: "disallow unnecessary semicolons",
			category: "Possible Errors",
			recommended: true,
			url: "https://eslint.org/docs/rules/no-extra-semi",
		},
		fixable: "code",
		schema: [],
		messages: {
			unexpected: "Unnecessary semicolon.",
		},
	};

	resultsMeta = {
		maxWarningsExceeded: { maxWarnings: 42, foundWarnings: 43 },
	};

	const version: string = ESLint.version;

	(async () => {
		const results: ESLint.LintResult[] = await resultsPromise;
		const formatter = await formatterPromise;

		const output: string = await formatter.format(results, resultsMeta);

		eslint.getRulesMetaForResults(results);

		ESLint.getErrorResults(results);

		ESLint.outputFixes(results);
	})();

	const hasFooFlag: boolean = eslint.hasFlag("foo");
}

// #endregion

// #region LegacyESLint

{
	let eslint: LegacyESLint;

	eslint = new LegacyESLint();
	eslint = new LegacyESLint({ allowInlineConfig: false });
	eslint = new LegacyESLint({ baseConfig: {} });
	eslint = new LegacyESLint({ overrideConfig: {} });
	eslint = new LegacyESLint({ overrideConfigFile: "foo" });
	eslint = new LegacyESLint({ cache: true });
	eslint = new LegacyESLint({ cacheLocation: "foo" });
	eslint = new LegacyESLint({ cacheStrategy: "content" });
	eslint = new LegacyESLint({ cwd: "foo" });
	eslint = new LegacyESLint({ errorOnUnmatchedPattern: true });
	eslint = new LegacyESLint({ extensions: ["js"] });
	eslint = new LegacyESLint({ fix: true });
	eslint = new LegacyESLint({ fix: message => false });
	eslint = new LegacyESLint({ fixTypes: ["directive", "problem"] });
	eslint = new LegacyESLint({ flags: ["foo", "bar"] });
	eslint = new LegacyESLint({ globInputPaths: true });
	eslint = new LegacyESLint({ ignore: true });
	eslint = new LegacyESLint({ ignorePath: "foo" });
	eslint = new LegacyESLint({ useEslintrc: false });
	eslint = new LegacyESLint({ plugins: { foo: {} } });
	eslint = new LegacyESLint({
		plugins: {
			bar: {
				name: "bar",
				version: "1.0.0",
				meta: {
					name: "bar",
					version: "1.0.0",
				},
				configs: {
					myConfig: {
						noInlineConfig: true,
					},
				},
				environments: {
					production: {
						parserOptions: {
							ecmaVersion: 6,
						},
					},
				},
				processors: {
					myProcessor: {
						name: "blah",
						version: "1.2.3",
						meta: {
							name: "blah",
							version: "1.2.3",
						},
						supportsAutofix: false,
					},
				},
				rules: {
					myRule: {
						create(context) {
							return {};
						},
						meta: {},
					},
				},
			},
		},
	});
	eslint = new LegacyESLint({ reportUnusedDisableDirectives: "error" });
	// @ts-expect-error
	eslint = new LegacyESLint({ reportUnusedDisableDirectives: 2 });
	eslint = new LegacyESLint({ resolvePluginsRelativeTo: "test" });
	eslint = new LegacyESLint({ rulePaths: ["foo"] });

	let resultsPromise = eslint.lintFiles(["myfile.js", "lib/"]);

	resultsPromise = eslint.lintText(SOURCE, { filePath: "foo" });

	eslint.calculateConfigForFile("./config.json");

	eslint.isPathIgnored("./dist/index.js");

	let formatterPromise: Promise<ESLint.Formatter>;

	formatterPromise = eslint.loadFormatter("codeframe");
	formatterPromise = eslint.loadFormatter();

	const customFormatter1: ESLint.Formatter = { format: () => "ok" };
	const customFormatter2: ESLint.Formatter = {
		format: () => Promise.resolve("ok"),
	};

	let resultsMeta: ESLint.ResultsMeta;
	const meta: Rule.RuleMetaData = {
		type: "suggestion",
		docs: {
			description: "disallow unnecessary semicolons",
			category: "Possible Errors",
			recommended: true,
			url: "https://eslint.org/docs/rules/no-extra-semi",
		},
		fixable: "code",
		schema: [],
		messages: {
			unexpected: "Unnecessary semicolon.",
		},
	};

	resultsMeta = {
		maxWarningsExceeded: { maxWarnings: 42, foundWarnings: 43 },
	};

	const version: string = LegacyESLint.version;

	(async () => {
		const results: ESLint.LintResult[] = await resultsPromise;
		const formatter = await formatterPromise;

		const output: string = await formatter.format(results, resultsMeta);

		eslint.getRulesMetaForResults(results);

		LegacyESLint.getErrorResults(results);

		LegacyESLint.outputFixes(results);
	})();

	const hasFooFlag: false = eslint.hasFlag("foo");
}

// #endregion

// #region ESLint.Formatter

function jsonFormatter(results: ESLint.LintResult[]) {
	return JSON.stringify(results, null, 2);
}

const customFormatter: ESLint.FormatterFunction = jsonFormatter;

function wrapperFormatter(
	results: ESLint.LintResult[],
	{ cwd, maxWarningsExceeded, rulesMeta }: ESLint.LintResultData,
) {
	customFormatter(results, { cwd, maxWarningsExceeded, rulesMeta });
}

// #endregion ESLint.Formatter

// #region ESLint.LintResult

let results!: ESLint.LintResult[];

for (const result of results) {
	result.filePath = "foo.js";

	result.fatalErrorCount = 0;
	result.errorCount = 1;
	result.warningCount = 2;
	result.fixableErrorCount = 3;
	result.fixableWarningCount = 4;

	result.source = "foo";
	result.output = "foo";

	result.stats = {
		fixPasses: 2,
		times: {
			passes: [
				{
					parse: { total: 1 },
					fix: { total: 2 },
					total: 3,
				},
				{
					parse: { total: 4 },
					rules: { foo: { total: 0.5 } },
					fix: { total: 5 },
					total: 9,
				},
			],
		},
	};
	delete result.stats;

	const deprecatedRule = result.usedDeprecatedRules[0];
	deprecatedRule.ruleId = "foo";
	deprecatedRule.replacedBy = ["bar"];
	deprecatedRule.info = {
		message: "use bar instead",
		replacedBy: [
			{
				rule: {
					name: "bar",
				},
			},
		],
	};

	for (const message of result.messages) {
		message.ruleId = "foo";
	}

	for (const suppressedMessage of result.suppressedMessages) {
		suppressedMessage.suppressions = [
			{
				kind: "foo",
				justification: "just cuz",
			},
		];
	}
}

// #endregion ESLint.LintResult

// #region ESLintRules

let eslintConfig: Linter.Config<ESLintRules>[];

eslintConfig = [
	{
		rules: {
			"capitalized-comments": [
				2,
				"always",
				{ ignorePattern: "const|let" },
			],
			"no-promise-executor-return": [2, { allowVoid: true }],
			"sort-keys": [2, "asc", { allowLineSeparatedGroups: true }],
		},
	},
	{
		files: ["**/*.json"],
		rules: {
			"no-restricted-syntax": 0,
		},
	},
	{
		files: ["**/*.ts"],
		rules: {
			"@typescript-eslint/no-invalid-void-type": [
				2,
				{ allowAsThisParameter: true },
			],
		},
	},
];

(configIndex: number) => {
	eslintConfig[configIndex].rules; // $ExpectType Partial<ESLintRules> | undefined
};

interface TSLinterRules {
	"@typescript-eslint/no-invalid-void-type"?: Linter.RuleEntry<
		[
			Partial<{
				allowInGenericTypeArguments: boolean | string[];
				allowAsThisParameter: boolean;
			}>,
		]
	>;
}

const eslintConfig2: Linter.Config<ESLintRules & TSLinterRules>[] =
	eslintConfig;

(configIndex: number) => {
	eslintConfig2[configIndex].rules; // $ExpectType Partial<ESLintRules & TSLinterRules> | undefined
};

(configIndex: number) => {
	const rules: Partial<Linter.RulesRecord> | undefined =
		eslintConfig2[configIndex].rules;
};

// #endregion

// #region RuleTester

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2015 } });

ruleTester.run("my-rule", rule, {
	valid: [
		{ code: "foo" },
		{ code: "foo", options: [{ allowFoo: true }] },
		{ code: "foo", filename: "test.js" },
		{ code: "foo", languageOptions: { globals: { foo: true } } },
		{ code: "foo", settings: { foo: true } },
		RuleTester.only("foo"),
	],

	invalid: [
		{ code: "foo", errors: 1 },
		{ code: "foo", errors: 1, output: "foo" },
		{ code: "foo", errors: ["foo"] },
		{ code: "foo", errors: [{ message: "foo" }] },
		{ code: "foo", errors: [{ message: "foo", type: "foo" }] },
		{ code: "foo", errors: [{ message: "foo", data: { foo: true } }] },
		{ code: "foo", errors: [{ message: "foo", line: 0 }] },
		{
			code: "foo",
			errors: [
				{
					message: "foo",
					suggestions: [
						{
							desc: "foo",
							output: "foo",
						},
						{
							messageId: "foo",
							output: "foo",
						},
					],
				},
			],
		},
		{ code: "foo", errors: 1, only: true },
		// @ts-expect-error // `message` cannot be `undefined`
		{ code: "foo", errors: [{ message: undefined }], only: true },
		// @ts-expect-error // `messageId` cannot be `undefined`
		{ code: "foo", errors: [{ messageId: undefined }], only: true },
		{
			code: "foo",
			errors: [
				{
					message: "foo",
					suggestions: [
						// @ts-expect-error // `desc` cannot be `undefined`
						{ desc: undefined, output: "foo" },
						// @ts-expect-error // `messageId` cannot be `undefined`
						{ messageId: undefined, output: "foo" },
					],
				},
			],
		},
	],
});

RuleTester.describe = null;

RuleTester.it = RuleTester.itOnly = function (
	text: string,
	fn: () => Promise<void>,
) {};

ruleTester.run("simple-valid-test", rule, {
	valid: ["foo", "bar", { code: "foo", options: [{ allowFoo: true }] }],
	invalid: [{ code: "bar", errors: ["baz"] }],
});

ruleTester.run("simple-valid-test", rule2, {
	valid: ["foo", "bar", { code: "foo", options: [{ allowFoo: true }] }],
	invalid: [{ code: "bar", errors: ["baz"] }],
});

// #endregion

// #region Config

(): Linter.Config => ({
	language: "js/js",
});

(): Linter.Config => ({
	// @ts-expect-error
	language: null,
});

(): Linter.Config => ({
	languageOptions: {
		parser: {
			parse: () => AST,
		},
	},
});

(): Linter.Config => ({
	languageOptions: {
		parser: {
			parseForESLint: () => ({ ast: AST }),
		},
	},
});

(): Linter.Config => ({
	languageOptions: {
		// @ts-expect-error
		parser: "foo-parser",
	},
});

(): Linter.Config => ({ files: ["abc"] });
(): Linter.Config => ({ files: [["abc"]] });

(): Linter.Config => ({
	// @ts-expect-error // Second level of nesting is not allowed
	files: ["abc", ["abc"], [["abc"]]],
});

(): Linter.Config => ({ ignores: ["abc"] });

(): Linter.Config => ({
	// @ts-expect-error // No nesting
	ignores: ["abc", ["abc"]],
});

// @ts-expect-error // Must be an array
(): Linter.Config => ({ files: "abc" });

// @ts-expect-error // Must be an array
(): Linter.Config => ({ ignores: "abc" });

(): Linter.Config => ({
	linterOptions: { reportUnusedDisableDirectives: "error" },
});
(): Linter.Config => ({
	linterOptions: { reportUnusedDisableDirectives: "warn" },
});
(): Linter.Config => ({
	linterOptions: { reportUnusedDisableDirectives: "off" },
});
(): Linter.Config => ({ linterOptions: { reportUnusedDisableDirectives: 2 } });
(): Linter.Config => ({ linterOptions: { reportUnusedDisableDirectives: 1 } });
(): Linter.Config => ({ linterOptions: { reportUnusedDisableDirectives: 0 } });
(): Linter.Config => ({
	linterOptions: { reportUnusedDisableDirectives: true },
});
(): Linter.Config => ({
	linterOptions: { reportUnusedDisableDirectives: false },
});

(): Linter.Config => ({
	// @ts-expect-error
	linterOptions: { reportUnusedDisableDirectives: "on" },
});

// @ts-expect-error
(): Linter.Config => ({ linterOptions: { reportUnusedDisableDirectives: 3 } });

(): Linter.Config => ({
	// @ts-expect-error
	linterOptions: { reportUnusedDisableDirectives: null },
});

(): Linter.Config => ({ name: "eslint:js" });

(): Linter.Config => ({ basePath: "subdir" });

(): Linter.Config => ({
	// @ts-expect-error
	basePath: null,
});

(): Linter.Config => ({
	// @ts-expect-error
	basePath: 42,
});

(): Linter.Config => ({
	// @ts-expect-error
	basePath: {},
});

// @ts-expect-error // Generic passed in does not match the RuleEntry schema
(): Linter.Config<{ foo?: "bar" }> => ({
	rules: {},
});

(): Linter.Config<{ foo?: Linter.RuleEntry<[1 | 2]> }> => ({
	rules: {
		foo: "error",
	},
});

(): Linter.Config<{ foo?: Linter.RuleEntry<[1 | 2]> }> => ({
	rules: {
		// @ts-expect-error // Invalid value
		foo: ["error", 3],
	},
});

(): Linter.Config<{ foo?: Linter.RuleEntry }> => ({
	rules: {
		// @ts-expect-error // Unspecified value
		bar: "error",
	},
});

(): Linter.Config<{
	foo: Linter.RuleEntry<[1 | 2]>;
	[x: string]: Linter.RuleEntry;
}> => ({
	rules: {
		// @ts-expect-error // Invalid value
		foo: ["error", 3],
		// Wildcard values are supported
		bar: 2,
		baz: "off",
		// @ts-expect-error // Invalid value
		"foo/bar": "bar",
	},
});

// The following are only errors when `exactOptionalPropertyTypes` is `true`.
// The error can't be enforced on consumers.
// @ts-expect-error
(): Linter.Config => ({ files: undefined });
// @ts-expect-error
(): Linter.Config => ({ ignores: undefined });

(): ESLint.Plugin => ({
	configs: {
		"old-style": {
			parser: "foo-parser",
		},

		// @ts-expect-error
		"old-style-array": [{ parser: "foo-parser" }],

		"new-style": {
			languageOptions: {
				parser: {
					parseForESLint: () => ({ ast: AST }),
				},
			},
		},

		"new-style-array": [
			{
				languageOptions: {
					parser: {
						parseForESLint: () => ({ ast: AST }),
					},
				},
			},
		],
	},
});

let config!: Linter.Config;
let flatConfig!: Linter.FlatConfig;
config = flatConfig;
flatConfig = config;

let configWithRules!: Linter.Config<ESLintRules>;
let flatConfigWithRules!: Linter.FlatConfig<ESLintRules>;
configWithRules = flatConfigWithRules;
flatConfigWithRules = configWithRules;
flatConfigWithRules.rules; // $ExpectType Partial<ESLintRules> | undefined

// #endregion Config

// #region Plugins

(): ESLint.Plugin => ({
	languages: {
		js: {} as Language,
	},
});

// #endregion Plugins

async (useFlatConfig?: boolean) => {
	await loadESLint(); // $ExpectType typeof ESLint | typeof LegacyESLint
	await loadESLint({}); // $ExpectType typeof ESLint | typeof LegacyESLint
	await loadESLint({ useFlatConfig: undefined }); // $ExpectType typeof ESLint | typeof LegacyESLint
	await loadESLint({ useFlatConfig: true }); // $ExpectType typeof ESLint
	await loadESLint({ useFlatConfig: false }); // $ExpectType typeof LegacyESLint
	await loadESLint({ useFlatConfig }); // $ExpectType typeof ESLint | typeof LegacyESLint

	const DefaultESLint = await loadESLint();
	if (DefaultESLint.configType === "flat") {
		const eslint = new DefaultESLint({ stats: true }); // $ExpectType ESLint
	} else {
		const eslint = new DefaultESLint({ useEslintrc: false }); // $ExpectType LegacyESLint
	}
};

// #region use-at-your-own-risk

builtinRules; // $ExpectType Map<string, RuleModule>

new FileEnumerator();

FlatESLint; // $ExpectType typeof ESLint

shouldUseFlatConfig(); // $ExpectType Promise<boolean>

// #endregion

// #region defineConfig

defineConfig([
	{
		files: ["*.js"],
		rules: {
			"no-console": "error",
		},
	},
]);

defineConfig([
	globalIgnores(["*.js"]),
	{
		files: ["*.js"],
		rules: {
			"no-console": "error",
		},
	},
	{
		files: ["*.ts"],
		rules: {
			"@typescript-eslint/no-unused-vars": "error",
		},
	},
]);

// #endregion

// #region JSSyntaxElement

const fooRule1: Rule.RuleModule = {
	create(context) {
		return {
			Program(node) {
				for (const comment of node.comments ?? []) {
					context.report({
						node: comment,
						messageId: "foo",
					});
				}
			},
		};
	},
};

const fooRule2: JSRuleDefinition = {
	create(context) {
		return {
			Program(node) {
				for (const comment of node.comments ?? []) {
					context.report({
						node: comment,
						messageId: "foo",
					});
				}
			},
		};
	},
};

const SYNTAX_ELEMENT_COMMENT: JSSyntaxElement = COMMENT;
const SYNTAX_ELEMENT_TOKEN: JSSyntaxElement = TOKEN;

// #endregion JSSyntaxElement
