/**
 * @fileoverview Tests for no-inner-declarations rule.
 * @author Brandon Mills
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-inner-declarations"),
	RuleTester = require("../../../lib/rule-tester/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 5,
		sourceType: "script",
	},
});

ruleTester.run("no-inner-declarations", rule, {
	// Examples of code that should not trigger the rule
	valid: [
		"function doSomething() { }",
		"function doSomething() { function somethingElse() { } }",
		"(function() { function doSomething() { } }());",
		"if (test) { var fn = function() { }; }",
		"if (test) { var fn = function expr() { }; }",
		"function decl() { var fn = function expr() { }; }",
		"function decl(arg) { var fn; if (arg) { fn = function() { }; } }",
		{
			code: "var x = {doSomething() {function doSomethingElse() {}}}",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "function decl(arg) { var fn; if (arg) { fn = function expr() { }; } }",
			languageOptions: { ecmaVersion: 6 },
		},
		"function decl(arg) { var fn; if (arg) { fn = function expr() { }; } }",
		"if (test) { var foo; }",
		{
			code: "if (test) { let x = 1; }",
			options: ["both"],
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "if (test) { const x = 1; }",
			options: ["both"],
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "if (test) { using x = 1; }",
			options: ["both"],
			languageOptions: {
				ecmaVersion: 2026,
				sourceType: "module",
			},
		},
		{
			code: "if (test) { await using x = 1; }",
			options: ["both"],
			languageOptions: {
				ecmaVersion: 2026,
				sourceType: "module",
			},
		},
		"function doSomething() { while (test) { var foo; } }",
		{ code: "var foo;", options: ["both"] },
		{ code: "var foo = 42;", options: ["both"] },
		{ code: "function doSomething() { var foo; }", options: ["both"] },
		{ code: "(function() { var foo; }());", options: ["both"] },
		{
			code: "foo(() => { function bar() { } });",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "var fn = () => {var foo;}",
			options: ["both"],
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "var x = {doSomething() {var foo;}}",
			options: ["both"],
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "export var foo;",
			options: ["both"],
			languageOptions: { sourceType: "module", ecmaVersion: 6 },
		},
		{
			code: "export function bar() {}",
			options: ["both"],
			languageOptions: { sourceType: "module", ecmaVersion: 6 },
		},
		{
			code: "export default function baz() {}",
			options: ["both"],
			languageOptions: { sourceType: "module", ecmaVersion: 6 },
		},
		{
			code: "exports.foo = () => {}",
			options: ["both"],
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "exports.foo = function(){}",
			options: ["both"],
		},
		{
			code: "module.exports = function foo(){}",
			options: ["both"],
		},
		{
			code: "class C { method() { function foo() {} } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "class C { method() { var x; } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "class C { static { function foo() {} } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "class C { static { var x; } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "'use strict' \n if (test) { function doSomething() { } }",
			options: ["functions", { blockScopedFunctions: "allow" }],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "'use strict' \n if (test) { function doSomething() { } }",
			options: ["functions"],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function foo() {'use strict' \n if (test) { function doSomething() { } } }",
			options: ["functions", { blockScopedFunctions: "allow" }],
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "function foo() { { function bar() { } } }",
			options: ["functions", { blockScopedFunctions: "allow" }],
			languageOptions: { ecmaVersion: 2022, sourceType: "module" },
		},
		{
			code: "class C { method() { if(test) { function somethingElse() { } } } }",
			options: ["functions", { blockScopedFunctions: "allow" }],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "const C = class { method() { if(test) { function somethingElse() { } } } }",
			options: ["functions", { blockScopedFunctions: "allow" }],
			languageOptions: { ecmaVersion: 2022 },
		},
	],

	// Examples of code that should trigger the rule
	invalid: [
		{
			code: "if (test) { function doSomething() { } }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "if (foo) var a; ",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "program",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "if (foo) /* some comments */ var a; ",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "program",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "if (foo){ function f(){ if(bar){ var a; } } }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "function body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "if (foo) function f(){ if(bar) var a; }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "function body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "if (foo) { var fn = function(){} } ",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "program",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "if (foo)  function f(){} ",
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "function bar() { if (foo) function f(){}; }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "function body",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "function bar() { if (foo) var a; }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "function body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "if (foo) { var a; }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "program",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "function doSomething() { do { function somethingElse() { } } while (test); }",
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "function body",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "(function() { if (test) { function doSomething() { } } }());",
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "function body",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "while (test) { var foo; }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "program",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "function doSomething() { if (test) { var foo = 42; } }",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "function body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "(function() { if (test) { var foo; } }());",
			options: ["both"],
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "function body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "const doSomething = () => { if (test) { var foo = 42; } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "function body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "class C { method() { if(test) { var foo; } } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "function body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "class C { static { if (test) { var foo; } } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "class static block body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "class C { static { if (test) { function foo() {} } } }",
			options: ["both", { blockScopedFunctions: "disallow" }],
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "class static block body",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "class C { static { if (test) { if (anotherTest) { var foo; } } } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "variable",
						body: "class static block body",
					},
					type: "VariableDeclaration",
				},
			],
		},
		{
			code: "if (test) { function doSomething() { } }",
			options: ["both", { blockScopedFunctions: "allow" }],
			languageOptions: { ecmaVersion: 5 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "if (test) { function doSomething() { } }",
			options: ["both", { blockScopedFunctions: "disallow" }],
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "'use strict' \n if (test) { function doSomething() { } }",
			options: ["both", { blockScopedFunctions: "disallow" }],
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "'use strict' \n if (test) { function doSomething() { } }",
			options: ["both", { blockScopedFunctions: "disallow" }],
			languageOptions: { ecmaVersion: 5 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "'use strict' \n if (test) { function doSomething() { } }",
			options: ["both", { blockScopedFunctions: "allow" }],
			languageOptions: { ecmaVersion: 5 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "function foo() {'use strict' \n { function bar() { } } }",
			options: ["both", { blockScopedFunctions: "disallow" }],
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "function body",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "function foo() {'use strict' \n { function bar() { } } }",
			options: ["both", { blockScopedFunctions: "disallow" }],
			languageOptions: { ecmaVersion: 5 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "function body",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "function doSomething() { 'use strict' \n do { function somethingElse() { } } while (test); }",
			options: ["both", { blockScopedFunctions: "disallow" }],
			languageOptions: { ecmaVersion: 5 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "function body",
					},
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "{ function foo () {'use strict' \n console.log('foo called'); } }",
			options: ["both"],
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "moveDeclToRoot",
					data: {
						type: "function",
						body: "program",
					},
					type: "FunctionDeclaration",
				},
			],
		},
	],
});
