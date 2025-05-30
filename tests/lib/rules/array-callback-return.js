/**
 * @fileoverview Tests for array-callback-return rule.
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/array-callback-return"),
	RuleTester = require("../../../lib/rule-tester/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

const allowImplicitOptions = [{ allowImplicit: true }];

const checkForEachOptions = [{ checkForEach: true }];

const allowImplicitCheckForEach = [{ allowImplicit: true, checkForEach: true }];

const checkForEachAllowVoid = [{ checkForEach: true, allowVoid: true }];

ruleTester.run("array-callback-return", rule, {
	valid: [
		"foo.every(function(){}())",
		"foo.every(function(){ return function() { return true; }; }())",
		"foo.every(function(){ return function() { return; }; })",

		"foo.forEach(bar || function(x) { var a=0; })",
		"foo.forEach(bar || function(x) { return a; })",
		"foo.forEach(function() {return function() { var a = 0;}}())",
		"foo.forEach(function(x) { var a=0; })",
		"foo.forEach(function(x) { return a;})",
		"foo.forEach(function(x) { return; })",
		"foo.forEach(function(x) { if (a === b) { return;} var a=0; })",
		"foo.forEach(function(x) { if (a === b) { return x;} var a=0; })",
		"foo.bar().forEach(function(x) { return; })",
		'["foo","bar","baz"].forEach(function(x) { return x; })',
		{
			code: "foo.forEach(x => { var a=0; })",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach(x => { if (a === b) { return;} var a=0; })",
			languageOptions: { ecmaVersion: 6 },
		},
		{ code: "foo.forEach(x => x)", languageOptions: { ecmaVersion: 6 } },
		{
			code: "foo.forEach(val => y += val)",
			languageOptions: { ecmaVersion: 6 },
		},

		{
			code: "foo.map(async function(){})",
			languageOptions: { ecmaVersion: 8 },
		},
		{
			code: "foo.map(async () => {})",
			languageOptions: { ecmaVersion: 8 },
		},
		{
			code: "foo.map(function* () {})",
			languageOptions: { ecmaVersion: 6 },
		},

		// options: { allowImplicit: false }
		{
			code: "Array.from(x, function() { return true; })",
			options: [{ allowImplicit: false }],
		},
		{
			code: "Int32Array.from(x, function() { return true; })",
			options: [{ allowImplicit: false }],
		},
		"foo.every(function() { return true; })",
		"foo.filter(function() { return true; })",
		"foo.find(function() { return true; })",
		"foo.findIndex(function() { return true; })",
		"foo.findLast(function() { return true; })",
		"foo.findLastIndex(function() { return true; })",
		"foo.flatMap(function() { return true; })",
		"foo.forEach(function() { return; })",
		"foo.map(function() { return true; })",
		"foo.reduce(function() { return true; })",
		"foo.reduceRight(function() { return true; })",
		"foo.some(function() { return true; })",
		"foo.sort(function() { return 0; })",
		"foo.toSorted(function() { return 0; })",
		{
			code: "foo.every(() => { return true; })",
			languageOptions: { ecmaVersion: 6 },
		},
		"foo.every(function() { if (a) return true; else return false; })",
		"foo.every(function() { switch (a) { case 0: bar(); default: return true; } })",
		"foo.every(function() { try { bar(); return true; } catch (err) { return false; } })",
		"foo.every(function() { try { bar(); } finally { return true; } })",

		// options: { allowImplicit: true }
		{
			code: "Array.from(x, function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "Int32Array.from(x, function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.every(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.filter(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.find(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.findIndex(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.findLast(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.findLastIndex(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.flatMap(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.forEach(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.map(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.reduce(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.reduceRight(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.some(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.sort(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.toSorted(function() { return; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.every(() => { return; })",
			options: allowImplicitOptions,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.every(function() { if (a) return; else return a; })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.every(function() { switch (a) { case 0: bar(); default: return; } })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.every(function() { try { bar(); return; } catch (err) { return; } })",
			options: allowImplicitOptions,
		},
		{
			code: "foo.every(function() { try { bar(); } finally { return; } })",
			options: allowImplicitOptions,
		},

		// options: { checkForEach: true }
		{
			code: "foo.forEach(function(x) { return; })",
			options: checkForEachOptions,
		},
		{
			code: "foo.forEach(function(x) { var a=0; })",
			options: checkForEachOptions,
		},
		{
			code: "foo.forEach(function(x) { if (a === b) { return;} var a=0; })",
			options: checkForEachOptions,
		},
		{
			code: "foo.forEach(function() {return function() { if (a == b) { return; }}}())",
			options: checkForEachOptions,
		},
		{
			code: "foo.forEach(x => { var a=0; })",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach(x => { if (a === b) { return;} var a=0; })",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach(x => { x })",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach(bar || function(x) { return; })",
			options: checkForEachOptions,
		},
		{
			code: "Array.from(x, function() { return true; })",
			options: checkForEachOptions,
		},
		{
			code: "Int32Array.from(x, function() { return true; })",
			options: checkForEachOptions,
		},
		{
			code: "foo.every(() => { return true; })",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.every(function() { if (a) return 1; else return a; })",
			options: checkForEachOptions,
		},
		{
			code: "foo.every(function() { switch (a) { case 0: return bar(); default: return a; } })",
			options: checkForEachOptions,
		},
		{
			code: "foo.every(function() { try { bar(); return 1; } catch (err) { return err; } })",
			options: checkForEachOptions,
		},
		{
			code: "foo.every(function() { try { bar(); } finally { return 1; } })",
			options: checkForEachOptions,
		},
		{
			code: "foo.every(function() { return; })",
			options: allowImplicitCheckForEach,
		},

		// options: { checkForEach: true, allowVoid: true }
		{
			code: "foo.forEach((x) => void x)",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach((x) => void bar(x))",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach(function (x) { return void bar(x); })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach((x) => { return void bar(x); })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "foo.forEach((x) => { if (a === b) { return void a; } bar(x) })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
		},

		"Arrow.from(x, function() {})",
		"foo.abc(function() {})",
		"every(function() {})",
		"foo[every](function() {})",
		"var every = function() {}",
		{
			code: "foo[`${every}`](function() {})",
			languageOptions: { ecmaVersion: 6 },
		},
		{ code: "foo.every(() => true)", languageOptions: { ecmaVersion: 6 } },
	],
	invalid: [
		{
			code: "Array.from(x, function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: { name: "function", arrayMethodName: "Array.from" },
				},
			],
		},
		{
			code: "Array.from(x, function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.from",
					},
				},
			],
		},
		{
			code: "Int32Array.from(x, function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: { name: "function", arrayMethodName: "Array.from" },
				},
			],
		},
		{
			code: "Int32Array.from(x, function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.from",
					},
				},
			],
		},
		{
			code: "foo.every(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.filter(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
		{
			code: "foo.filter(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
		{
			code: "foo.find(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.find",
					},
				},
			],
		},
		{
			code: "foo.find(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.find",
					},
				},
			],
		},
		{
			code: "foo.findLast(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.findLast",
					},
				},
			],
		},
		{
			code: "foo.findLast(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.findLast",
					},
				},
			],
		},
		{
			code: "foo.findIndex(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.findIndex",
					},
				},
			],
		},
		{
			code: "foo.findIndex(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.findIndex",
					},
				},
			],
		},
		{
			code: "foo.findLastIndex(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.findLastIndex",
					},
				},
			],
		},
		{
			code: "foo.findLastIndex(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.findLastIndex",
					},
				},
			],
		},
		{
			code: "foo.flatMap(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.flatMap",
					},
				},
			],
		},
		{
			code: "foo.flatMap(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.flatMap",
					},
				},
			],
		},
		{
			code: "foo.map(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.map",
					},
				},
			],
		},
		{
			code: "foo.map(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.map",
					},
				},
			],
		},
		{
			code: "foo.reduce(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.reduce",
					},
				},
			],
		},
		{
			code: "foo.reduce(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.reduce",
					},
				},
			],
		},
		{
			code: "foo.reduceRight(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.reduceRight",
					},
				},
			],
		},
		{
			code: "foo.reduceRight(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.reduceRight",
					},
				},
			],
		},
		{
			code: "foo.some(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.some",
					},
				},
			],
		},
		{
			code: "foo.some(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.some",
					},
				},
			],
		},
		{
			code: "foo.sort(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.sort",
					},
				},
			],
		},
		{
			code: "foo.sort(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.sort",
					},
				},
			],
		},
		{
			code: "foo.toSorted(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.toSorted",
					},
				},
			],
		},
		{
			code: "foo.toSorted(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.toSorted",
					},
				},
			],
		},
		{
			code: "foo.bar.baz.every(function() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.bar.baz.every(function foo() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: 'foo["every"](function() {})',
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: 'foo["every"](function foo() {})',
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo[`every`](function() {})",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo[`every`](function foo() {})",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(() => {})",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					message:
						"Array.prototype.every() expects a return value from arrow function.",
					column: 14,
				},
			],
		},
		{
			code: "foo.every(function() { if (a) return true; })",
			errors: [
				{
					message:
						"Array.prototype.every() expects a value to be returned at the end of function.",
					column: 11,
				},
			],
		},
		{
			code: "foo.every(function cb() { if (a) return true; })",
			errors: [
				{
					message:
						"Array.prototype.every() expects a value to be returned at the end of function 'cb'.",
					column: 11,
				},
			],
		},
		{
			code: "foo.every(function() { switch (a) { case 0: break; default: return true; } })",
			errors: [
				{
					messageId: "expectedAtEnd",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function foo() { switch (a) { case 0: break; default: return true; } })",
			errors: [
				{
					messageId: "expectedAtEnd",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function() { try { bar(); } catch (err) { return true; } })",
			errors: [
				{
					messageId: "expectedAtEnd",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function foo() { try { bar(); } catch (err) { return true; } })",
			errors: [
				{
					messageId: "expectedAtEnd",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function() { return; })",
			errors: [
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function foo() { return; })",
			errors: [
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function() { if (a) return; })",
			errors: [
				"Array.prototype.every() expects a value to be returned at the end of function.",
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function foo() { if (a) return; })",
			errors: [
				"Array.prototype.every() expects a value to be returned at the end of function 'foo'.",
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function() { if (a) return; else return; })",
			errors: [
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(function foo() { if (a) return; else return; })",
			errors: [
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(cb || function() {})",
			errors: [
				"Array.prototype.every() expects a return value from function.",
			],
		},
		{
			code: "foo.every(cb || function foo() {})",
			errors: [
				"Array.prototype.every() expects a return value from function 'foo'.",
			],
		},
		{
			code: "foo.every(a ? function() {} : function() {})",
			errors: [
				"Array.prototype.every() expects a return value from function.",
				"Array.prototype.every() expects a return value from function.",
			],
		},
		{
			code: "foo.every(a ? function foo() {} : function bar() {})",
			errors: [
				"Array.prototype.every() expects a return value from function 'foo'.",
				"Array.prototype.every() expects a return value from function 'bar'.",
			],
		},
		{
			code: "foo.every(function(){ return function() {}; }())",
			errors: [
				{
					message:
						"Array.prototype.every() expects a return value from function.",
					column: 30,
				},
			],
		},
		{
			code: "foo.every(function(){ return function foo() {}; }())",
			errors: [
				{
					message:
						"Array.prototype.every() expects a return value from function 'foo'.",
					column: 30,
				},
			],
		},
		{
			code: "foo.every(() => {})",
			options: [{ allowImplicit: false }],
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					message:
						"Array.prototype.every() expects a return value from arrow function.",
				},
			],
		},
		{
			code: "foo.every(() => {})",
			options: [{ allowImplicit: true }],
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					message:
						"Array.prototype.every() expects a return value from arrow function.",
				},
			],
		},

		// options: { allowImplicit: true }
		{
			code: "Array.from(x, function() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: { name: "function", arrayMethodName: "Array.from" },
				},
			],
		},
		{
			code: "foo.every(function() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.filter(function foo() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
		{
			code: "foo.find(function foo() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.find",
					},
				},
			],
		},
		{
			code: "foo.map(function() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.map",
					},
				},
			],
		},
		{
			code: "foo.reduce(function() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.reduce",
					},
				},
			],
		},
		{
			code: "foo.reduceRight(function() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.reduceRight",
					},
				},
			],
		},
		{
			code: "foo.bar.baz.every(function foo() {})",
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.every(cb || function() {})",
			options: allowImplicitOptions,
			errors: [
				"Array.prototype.every() expects a return value from function.",
			],
		},
		{
			code: '["foo","bar"].sort(function foo() {})',
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.sort",
					},
				},
			],
		},
		{
			code: '["foo","bar"].toSorted(function foo() {})',
			options: allowImplicitOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.toSorted",
					},
				},
			],
		},
		{
			code: "foo.forEach(x => x)",
			options: allowImplicitCheckForEach,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							messageId: "wrapBraces",
							output: "foo.forEach(x => {x})",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach(function(x) { if (a == b) {return x;}})",
			options: allowImplicitCheckForEach,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "foo.forEach(function bar(x) { return x;})",
			options: allowImplicitCheckForEach,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},

		// // options: { checkForEach: true }
		{
			code: "foo.forEach(x => x)",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach(x => {x})",
							messageId: "wrapBraces",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach(x => (x))",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach(x => {(x)})",
							messageId: "wrapBraces",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach(val => y += val)",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach(val => {y += val})",
							messageId: "wrapBraces",
						},
					],
				},
			],
		},
		{
			code: '["foo","bar"].forEach(x => ++x)',
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: '["foo","bar"].forEach(x => {++x})',
							messageId: "wrapBraces",
						},
					],
				},
			],
		},
		{
			code: "foo.bar().forEach(x => x === y)",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.bar().forEach(x => {x === y})",
							messageId: "wrapBraces",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach(function() {return function() { if (a == b) { return a; }}}())",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "foo.forEach(function(x) { if (a == b) {return x;}})",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "foo.forEach(function(x) { if (a == b) {return undefined;}})",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "foo.forEach(function bar(x) { return x;})",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "foo.bar().forEach(function bar(x) { return x;})",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: '["foo","bar"].forEach(function bar(x) { return x;})',
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "foo.forEach((x) => { return x;})",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "Array.from(x, function() {})",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: { name: "function", arrayMethodName: "Array.from" },
				},
			],
		},
		{
			code: "foo.every(function() {})",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.every",
					},
				},
			],
		},
		{
			code: "foo.filter(function foo() {})",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
		{
			code: "foo.filter(function foo() { return; })",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function 'foo'",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
		{
			code: "foo.every(cb || function() {})",
			options: checkForEachOptions,
			errors: [
				"Array.prototype.every() expects a return value from function.",
			],
		},
		{
			code: "foo.forEach((x) => void x)",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							messageId: "wrapBraces",
							output: "foo.forEach((x) => {void x})",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => void bar(x))",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							messageId: "wrapBraces",
							output: "foo.forEach((x) => {void bar(x)})",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { return void bar(x); })",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},
		{
			code: "foo.forEach((x) => { if (a === b) { return void a; } bar(x) })",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
				},
			],
		},

		// options: { checkForEach: true, allowVoid: true }

		{
			code: "foo.forEach(x => x)",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach(x => {x})",
							messageId: "wrapBraces",
						},
						{
							output: "foo.forEach(x => void x)",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach(x => !x)",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach(x => {!x})",
							messageId: "wrapBraces",
						},
						{
							output: "foo.forEach(x => void !x)",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach(x => (x))",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach(x => {(x)})",
							messageId: "wrapBraces",
						},
						{
							output: "foo.forEach(x => void (x))",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { return x; })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach((x) => { return void x; })",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { return !x; })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach((x) => { return void !x; })",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { return(x); })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach((x) => { return void (x); })",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { return (x + 1); })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach((x) => { return void (x + 1); })",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { if (a === b) { return x; } })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach((x) => { if (a === b) { return void x; } })",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { if (a === b) { return !x; } })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach((x) => { if (a === b) { return void !x; } })",
							messageId: "prependVoid",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((x) => { if (a === b) { return (x + a); } })",
			options: checkForEachAllowVoid,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					suggestions: [
						{
							output: "foo.forEach((x) => { if (a === b) { return void (x + a); } })",
							messageId: "prependVoid",
						},
					],
				},
			],
		},

		// full location tests
		{
			code: "foo.filter(bar => { baz(); } )",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "ArrowFunctionExpression",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "foo.filter(\n() => {} )",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "ArrowFunctionExpression",
					line: 2,
					column: 4,
					endLine: 2,
					endColumn: 6,
				},
			],
		},
		{
			code: "foo.filter(bar || ((baz) => {}) )",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "ArrowFunctionExpression",
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: "foo.filter(bar => { return; })",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "ReturnStatement",
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: "Array.from(foo, bar => { bar })",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.from",
					},
					type: "ArrowFunctionExpression",
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "foo.forEach(bar => bar)",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					type: "ArrowFunctionExpression",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 19,
					suggestions: [
						{
							messageId: "wrapBraces",
							output: "foo.forEach(bar => {bar})",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((function () { return (bar) => bar; })())",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					type: "ArrowFunctionExpression",
					line: 1,
					column: 41,
					endLine: 1,
					endColumn: 43,
					suggestions: [
						{
							messageId: "wrapBraces",
							output: "foo.forEach((function () { return (bar) => {bar}; })())",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((() => {\n return bar => bar; })())",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					type: "ArrowFunctionExpression",
					line: 2,
					column: 13,
					endLine: 2,
					endColumn: 15,
					suggestions: [
						{
							messageId: "wrapBraces",
							output: "foo.forEach((() => {\n return bar => {bar}; })())",
						},
					],
				},
			],
		},
		{
			code: "foo.forEach((bar) => { if (bar) { return; } else { return bar ; } })",
			options: checkForEachOptions,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.forEach",
					},
					type: "ReturnStatement",
					line: 1,
					column: 52,
					endLine: 1,
					endColumn: 64,
				},
			],
		},
		{
			code: "foo.filter(function(){})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "FunctionExpression",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "foo.filter(function (){})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "FunctionExpression",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "foo.filter(function\n(){})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "FunctionExpression",
					line: 1,
					column: 12,
					endLine: 2,
					endColumn: 1,
				},
			],
		},
		{
			code: "foo.filter(function bar(){})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "FunctionExpression",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: "foo.filter(function bar  (){})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "FunctionExpression",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 26,
				},
			],
		},
		{
			code: "foo.filter(function\n bar() {})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "FunctionExpression",
					line: 1,
					column: 12,
					endLine: 2,
					endColumn: 5,
				},
			],
		},
		{
			code: "Array.from(foo, function bar(){})",
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.from",
					},
					type: "FunctionExpression",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
		{
			code: "Array.from(foo, bar ? function (){} : baz)",
			errors: [
				{
					messageId: "expectedInside",
					data: { name: "function", arrayMethodName: "Array.from" },
					type: "FunctionExpression",
					line: 1,
					column: 23,
					endLine: 1,
					endColumn: 32,
				},
			],
		},
		{
			code: "foo.filter(function bar() { return \n })",
			errors: [
				{
					messageId: "expectedReturnValue",
					data: {
						name: "function 'bar'",
						arrayMethodName: "Array.prototype.filter",
					},
					type: "ReturnStatement",
					line: 1,
					column: 29,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: "foo.forEach(function () { \nif (baz) return bar\nelse return\n })",
			options: checkForEachOptions,
			errors: [
				{
					messageId: "expectedNoReturnValue",
					data: {
						name: "function",
						arrayMethodName: "Array.prototype.forEach",
					},
					type: "ReturnStatement",
					line: 2,
					column: 10,
					endLine: 2,
					endColumn: 20,
				},
			],
		},

		// Optional chaining
		{
			code: "foo?.filter(() => { console.log('hello') })",
			languageOptions: { ecmaVersion: 2020 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
		{
			code: "(foo?.filter)(() => { console.log('hello') })",
			languageOptions: { ecmaVersion: 2020 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
		{
			code: "Array?.from([], () => { console.log('hello') })",
			languageOptions: { ecmaVersion: 2020 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.from",
					},
				},
			],
		},
		{
			code: "(Array?.from)([], () => { console.log('hello') })",
			languageOptions: { ecmaVersion: 2020 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.from",
					},
				},
			],
		},
		{
			code: "foo?.filter((function() { return () => { console.log('hello') } })?.())",
			languageOptions: { ecmaVersion: 2020 },
			errors: [
				{
					messageId: "expectedInside",
					data: {
						name: "arrow function",
						arrayMethodName: "Array.prototype.filter",
					},
				},
			],
		},
	],
});
