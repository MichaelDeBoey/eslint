/**
 * @fileoverview Build file
 * @author nzakas
 */

/* eslint no-use-before-define: "off", no-console: "off" -- CLI */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const checker = require("npm-license"),
	ReleaseOps = require("eslint-release"),
	fs = require("node:fs"),
	glob = require("glob"),
	marked = require("marked"),
	matter = require("gray-matter"),
	path = require("node:path"),
	semver = require("semver"),
	ejs = require("ejs"),
	builtinRules = require("./lib/rules"),
	childProcess = require("node:child_process");

require("shelljs/make");
/* global target -- global.target is declared in `shelljs/make.js` */
/**
 * global.target = {};
 * @see https://github.com/shelljs/shelljs/blob/124d3349af42cb794ae8f78fc9b0b538109f7ca7/make.js#L4
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3aa2d09b6408380598cfb802743b07e1edb725f3/types/shelljs/make.d.ts#L8-L11
 */
const {
	cat,
	cd,
	echo,
	exec,
	exit,
	find,
	mkdir,
	pwd,
	test,
} = require("shelljs");

//------------------------------------------------------------------------------
// Settings
//------------------------------------------------------------------------------

const OPEN_SOURCE_LICENSES = [
	/MIT/u,
	/BSD/u,
	/Apache/u,
	/ISC/u,
	/WTF/u,
	/Public Domain/u,
	/LGPL/u,
	/Python/u,
	/BlueOak/u,
];

const MAIN_GIT_BRANCH = "main";

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

const NODE_MODULES = "./node_modules/",
	TEMP_DIR = "./tmp/",
	DEBUG_DIR = "./debug/",
	BUILD_DIR = "build",
	SITE_DIR = "../eslint.org",
	DOCS_DIR = "./docs",
	DOCS_SRC_DIR = path.join(DOCS_DIR, "src"),
	DOCS_DATA_DIR = path.join(DOCS_SRC_DIR, "_data"),
	PERF_TMP_DIR = path.join(TEMP_DIR, "eslint", "performance"),
	// Utilities - intentional extra space at the end of each string
	MOCHA = `${NODE_MODULES}mocha/bin/_mocha `,
	// Files
	RULE_FILES = glob
		.sync("lib/rules/*.js")
		.filter(filePath => path.basename(filePath) !== "index.js"),
	TEST_FILES = '"tests/{bin,conf,lib,tools}/**/*.js"',
	PERF_ESLINT_CONFIG = path.join(PERF_TMP_DIR, "eslint.config.js"),
	PERF_MULTIFILES_TARGET_DIR = path.join(PERF_TMP_DIR, "eslint"),
	CHANGELOG_FILE = "./CHANGELOG.md",
	VERSIONS_FILE = "./docs/src/_data/versions.json",
	// Settings
	MOCHA_TIMEOUT = parseInt(process.env.ESLINT_MOCHA_TIMEOUT, 10) || 10000;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Executes a command and returns the output instead of printing it to stdout.
 * @param {string} cmd The command string to execute.
 * @returns {string} The result of the executed command.
 */
function execSilent(cmd) {
	return exec(cmd, { silent: true }).stdout;
}

/**
 * Gets name of the currently checked out Git branch.
 * @returns {string} Name of the currently checked out Git branch.
 */
function getCurrentGitBranch() {
	return execSilent("git branch --show-current").trim();
}

/**
 * Generates a release blog post for eslint.org
 * @param {Object} releaseInfo The release metadata.
 * @param {string} [prereleaseMajorVersion] If this is a prerelease, the next major version after this prerelease
 * @returns {void}
 * @private
 */
function generateBlogPost(releaseInfo, prereleaseMajorVersion) {
	const ruleList = RULE_FILES

		// Strip the .js extension
		.map(ruleFileName => path.basename(ruleFileName, ".js"))

		/*
		 * Sort by length descending. This ensures that rule names which are substrings of other rule names are not
		 * matched incorrectly. For example, the string "no-undefined" should get matched with the `no-undefined` rule,
		 * instead of getting matched with the `no-undef` rule followed by the string "ined".
		 */
		.sort((ruleA, ruleB) => ruleB.length - ruleA.length);

	const renderContext = Object.assign(
		{ prereleaseMajorVersion, ruleList },
		releaseInfo,
	);

	const output = ejs.render(
			cat("./templates/blogpost.md.ejs"),
			renderContext,
		),
		now = new Date(),
		month = now.getMonth() + 1,
		day = now.getDate(),
		filename = path.join(
			SITE_DIR,
			`src/content/blog/${now.getFullYear()}-${
				month < 10 ? `0${month}` : month
			}-${day < 10 ? `0${day}` : day}-eslint-v${
				releaseInfo.version
			}-released.md`,
		);

	output.to(filename);
}

/**
 * Generates a doc page with formatter result examples
 * @returns {void}
 */
function generateFormatterExamples() {
	// We don't need the stack trace of execFileSync if the command fails.
	try {
		childProcess.execFileSync(
			process.execPath,
			["tools/generate-formatter-examples.js"],
			{ stdio: "inherit" },
		);
	} catch {
		exit(1);
	}
}

/**
 * Generate a doc page that lists all of the rules and links to them
 * @returns {void}
 */
function generateRuleIndexPage() {
	const docsSiteOutputFile = path.join(DOCS_DATA_DIR, "rules.json"),
		docsSiteMetaOutputFile = path.join(DOCS_DATA_DIR, "rules_meta.json"),
		ruleTypes = "conf/rule-type-list.json",
		ruleTypesData = JSON.parse(cat(path.resolve(ruleTypes)));

	const meta = {};

	RULE_FILES.map(filename => [filename, path.basename(filename, ".js")])
		.sort((a, b) => a[1].localeCompare(b[1]))
		.forEach(pair => {
			const filename = pair[0];
			const basename = pair[1];
			const rule = require(path.resolve(filename));

			/*
			 * Eleventy interprets the {{ }} in messages as being variables,
			 * which can cause an error if there's syntax it doesn't expect.
			 * Because we don't use this info in the website anyway, it's safer
			 * to just remove it.
			 *
			 * Also removing the schema because we don't need it.
			 */
			meta[basename] = {
				...rule.meta,
				schema: void 0,
				messages: void 0,
			};

			if (rule.meta.deprecated) {
				ruleTypesData.deprecated.push({
					name: basename,
					replacedBy: rule.meta.deprecated.replacedBy ?? [],
					fixable: !!rule.meta.fixable,
					hasSuggestions: !!rule.meta.hasSuggestions,
				});
			} else {
				const output = {
						name: basename,
						description: rule.meta.docs.description,
						recommended: rule.meta.docs.recommended || false,
						fixable: !!rule.meta.fixable,
						frozen: !!rule.meta.docs.frozen,
						hasSuggestions: !!rule.meta.hasSuggestions,
					},
					ruleType = ruleTypesData.types[rule.meta.type];

				ruleType.push(output);
			}
		});

	ruleTypesData.types = Object.fromEntries(
		Object.entries(ruleTypesData.types).filter(
			([, value]) => value && value.length > 0,
		),
	);

	JSON.stringify(ruleTypesData, null, 4).to(docsSiteOutputFile);
	JSON.stringify(meta, null, 4).to(docsSiteMetaOutputFile);
}

/**
 * Creates a git commit and tag in an adjacent `website` repository, without pushing it to
 * the remote. This assumes that the repository has already been modified somehow (e.g. by adding a blogpost).
 * @param {string} [tag] The string to tag the commit with
 * @returns {void}
 */
function commitSiteToGit(tag) {
	const currentDir = pwd();

	cd(SITE_DIR);
	exec("git add -A .");
	exec(`git commit -m "Added release blog post for ${tag}"`);
	exec(`git tag ${tag}`);
	exec("git fetch origin && git rebase origin/main");
	cd(currentDir);
}

/**
 * Publishes the changes in an adjacent `eslint.org` repository to the remote. The
 * site should already have local commits (e.g. from running `commitSiteToGit`).
 * @returns {void}
 */
function publishSite() {
	const currentDir = pwd();

	cd(SITE_DIR);
	exec("git push origin HEAD --tags");
	cd(currentDir);
}

/**
 * Determines whether the given version is a prerelease.
 * @param {string} version The version to check.
 * @returns {boolean} `true` if it is a prerelease, `false` otherwise.
 */
function isPreRelease(version) {
	return /[a-z]/u.test(version);
}

/**
 * Updates docs/src/_data/versions.json
 * @param {string} oldVersion Current version.
 * @param {string} newVersion New version to be released.
 * @returns {void}
 */
function updateVersions(oldVersion, newVersion) {
	echo("Updating ESLint versions list in docs package");

	const filePath = path.join(
		__dirname,
		"docs",
		"src",
		"_data",
		"versions.json",
	);
	const data = require(filePath);
	const { items } = data;

	const isOldVersionPrerelease = isPreRelease(oldVersion);
	const isNewVersionPrerelease = isPreRelease(newVersion);

	if (isOldVersionPrerelease) {
		if (isNewVersionPrerelease) {
			// prerelease -> prerelease. Just update the version.
			items.find(item => item.branch === "next").version = newVersion;
		} else {
			// prerelease -> release. First, update the item for the previous latest version
			const latestVersionItem = items.find(
				item => item.branch === "latest",
			);
			const latestVersion = latestVersionItem.version;
			const versionBranch = `v${latestVersion.slice(0, latestVersion.indexOf("."))}.x`; // "v8.x", "v9.x", "v10.x" ...

			latestVersionItem.branch = versionBranch;
			latestVersionItem.path = `/docs/${versionBranch}/`;

			// Then, replace the item for the prerelease with a new item for the new latest version
			items.splice(
				items.findIndex(item => item.branch === "next"),
				1,
				{
					version: newVersion,
					branch: "latest",
					path: "/docs/latest/",
				},
			);
		}
	} else {
		if (isNewVersionPrerelease) {
			// release -> prerelease. Insert an item for the prerelease.
			items.splice(1, 0, {
				version: newVersion,
				branch: "next",
				path: "/docs/next/",
			});
		} else {
			// release -> release. Just update the version.
			items.find(item => item.branch === "latest").version = newVersion;
		}
	}

	fs.writeFileSync(filePath, `${JSON.stringify(data, null, 4)}\n`);
}

/**
 * Updates TSDoc header comments of all rule types.
 * @returns {void}
 */
function updateRuleTypeHeaders() {
	// We don't need the stack trace of execFileSync if the command fails.
	try {
		childProcess.execFileSync(
			process.execPath,
			["tools/update-rule-type-headers.js"],
			{ stdio: "inherit" },
		);
	} catch {
		exit(1);
	}
}

/**
 * Updates the changelog, bumps the version number in package.json, creates a local git commit and tag,
 * and generates the site in an adjacent `website` folder.
 * @param {Object} options Release options.
 * @param {string} [options.prereleaseId] The prerelease identifier (alpha, beta, etc.). If `undefined`, this is
 *      a regular release.
 * @param {string} options.packageTag Tag that should be added to the package submitted to the npm registry.
 * @returns {void}
 */
function generateRelease({ prereleaseId, packageTag }) {
	echo(`Current Git branch: ${getCurrentGitBranch()}`);

	const oldVersion = require("./package.json").version;

	ReleaseOps.generateRelease(prereleaseId, packageTag);
	const releaseInfo = JSON.parse(cat(".eslint-release-info.json"));

	echo("Generating site");
	target.gensite();
	generateBlogPost(
		releaseInfo,
		prereleaseId ? semver.inc(releaseInfo.version, "major") : void 0,
	);
	commitSiteToGit(`v${releaseInfo.version}`);

	echo("Updating version in docs package");
	const docsPackagePath = path.join(__dirname, "docs", "package.json");
	const docsPackage = require(docsPackagePath);

	docsPackage.version = releaseInfo.version;
	fs.writeFileSync(
		docsPackagePath,
		`${JSON.stringify(docsPackage, null, 4)}\n`,
	);

	if (getCurrentGitBranch() === MAIN_GIT_BRANCH) {
		updateVersions(oldVersion, releaseInfo.version);
	}

	echo("Updating rule type header comments");
	updateRuleTypeHeaders();

	echo("Updating commit with docs data and rule types");
	exec("git add lib/types/rules.d.ts docs/ && git commit --amend --no-edit");
	exec(`git tag -a -f v${releaseInfo.version} -m ${releaseInfo.version}`);
}

/**
 * Publishes a generated release to npm and GitHub, and pushes changes to the adjacent `website` repo
 * to remote repo.
 * @returns {void}
 */
function publishRelease() {
	ReleaseOps.publishRelease();
	const releaseInfo = JSON.parse(cat(".eslint-release-info.json"));

	const docsSiteBranch =
		releaseInfo.packageTag === "maintenance"
			? `v${semver.major(releaseInfo.version)}.x`
			: releaseInfo.packageTag; // "latest" or "next"

	echo(`Updating docs site branch: ${docsSiteBranch}`);
	exec(`git push origin HEAD:${docsSiteBranch} -f`);

	publishSite();

	// Update changelog and list of versions on the main branch
	if (getCurrentGitBranch() !== MAIN_GIT_BRANCH) {
		echo(`Updating changelog and versions on branch: ${MAIN_GIT_BRANCH}`);

		exec(`git checkout ${MAIN_GIT_BRANCH} --force`);

		fs.writeFileSync(
			CHANGELOG_FILE,
			`${releaseInfo.markdownChangelog}${cat(CHANGELOG_FILE)}`,
		);

		const versions = JSON.parse(cat(VERSIONS_FILE));

		versions.items.find(({ branch }) => branch === docsSiteBranch).version =
			releaseInfo.version;
		fs.writeFileSync(
			VERSIONS_FILE,
			`${JSON.stringify(versions, null, 4)}\n`,
		);

		exec(`git add ${CHANGELOG_FILE} ${VERSIONS_FILE}`);
		exec(
			`git commit -m "chore: updates for v${releaseInfo.version} release"`,
		);
		exec("git push origin HEAD");
	}
}

/**
 * Splits a command result to separate lines.
 * @param {string} result The command result string.
 * @returns {Array} The separated lines.
 */
function splitCommandResultToLines(result) {
	return result.trim().split("\n");
}

/**
 * Gets the first commit sha of the given file.
 * @param {string} filePath The file path which should be checked.
 * @returns {string} The commit sha.
 */
function getFirstCommitOfFile(filePath) {
	let commits = execSilent(`git rev-list HEAD -- ${filePath}`);

	commits = splitCommandResultToLines(commits);
	return commits.at(-1).trim();
}

/**
 * Gets the tag name where a given file was introduced first.
 * @param {string} filePath The file path to check.
 * @returns {string} The tag name.
 */
function getFirstVersionOfFile(filePath) {
	const firstCommit = getFirstCommitOfFile(filePath);
	let tags = execSilent(`git tag --contains ${firstCommit}`);

	tags = splitCommandResultToLines(tags);
	return tags
		.reduce((list, version) => {
			const validatedVersion = semver.valid(version.trim());

			if (validatedVersion) {
				list.push(validatedVersion);
			}
			return list;
		}, [])
		.sort(semver.compare)[0];
}

/**
 * Gets the commit that deleted a file.
 * @param {string} filePath The path to the deleted file.
 * @returns {string} The commit sha.
 */
function getCommitDeletingFile(filePath) {
	const commits = execSilent(`git rev-list HEAD -- ${filePath}`);

	return splitCommandResultToLines(commits)[0];
}

/**
 * Gets the first version number where a given file is no longer present.
 * @param {string} filePath The path to the deleted file.
 * @returns {string} The version number.
 */
function getFirstVersionOfDeletion(filePath) {
	const deletionCommit = getCommitDeletingFile(filePath),
		tags = execSilent(`git tag --contains ${deletionCommit}`);

	return splitCommandResultToLines(tags)
		.map(version => semver.valid(version.trim()))
		.filter(version => version)
		.sort(semver.compare)[0];
}

/**
 * Gets a path to an executable in node_modules/.bin
 * @param {string} command The executable name
 * @returns {string} The executable path
 */
function getBinFile(command) {
	return path.join("node_modules", ".bin", command);
}

//------------------------------------------------------------------------------
// Tasks
//------------------------------------------------------------------------------

target.fuzz = function ({ amount = 1000, fuzzBrokenAutofixes = false } = {}) {
	const { run } = require("./tools/fuzzer-runner");
	const fuzzResults = run({ amount, fuzzBrokenAutofixes });

	if (fuzzResults.length) {
		const uniqueStackTraceCount = new Set(
			fuzzResults.map(result => result.error),
		).size;

		echo(
			`The fuzzer reported ${fuzzResults.length} error${fuzzResults.length === 1 ? "" : "s"} with a total of ${uniqueStackTraceCount} unique stack trace${uniqueStackTraceCount === 1 ? "" : "s"}.`,
		);

		const formattedResults = JSON.stringify(
			{ results: fuzzResults },
			null,
			4,
		);

		if (process.env.CI) {
			echo("More details can be found below.");
			echo(formattedResults);
		} else {
			if (!test("-d", DEBUG_DIR)) {
				mkdir(DEBUG_DIR);
			}

			let fuzzLogPath;
			let fileSuffix = 0;

			// To avoid overwriting any existing fuzzer log files, append a numeric suffix to the end of the filename.
			do {
				fuzzLogPath = path.join(
					DEBUG_DIR,
					`fuzzer-log-${fileSuffix}.json`,
				);
				fileSuffix++;
			} while (test("-f", fuzzLogPath));

			formattedResults.to(fuzzLogPath);

			// TODO: (not-an-aardvark) Create a better way to isolate and test individual fuzzer errors from the log file
			echo(`More details can be found in ${fuzzLogPath}.`);
		}

		exit(1);
	}
};

target.mocha = () => {
	let errors = 0,
		lastReturn;

	echo("Running unit tests");

	lastReturn = exec(
		`${getBinFile("c8")} -- ${MOCHA} --forbid-only -R progress -t ${MOCHA_TIMEOUT} -c ${TEST_FILES}`,
	);
	if (lastReturn.code !== 0) {
		errors++;
	}

	lastReturn = exec(
		`${getBinFile("c8")} check-coverage --statements 99 --branches 98 --functions 99 --lines 99`,
	);
	if (lastReturn.code !== 0) {
		errors++;
	}

	if (errors) {
		exit(1);
	}
};

target.cypress = () => {
	echo("Running unit tests on browsers");
	target.webpack("production");
	const lastReturn = exec(`${getBinFile("cypress")} run --no-runner-ui`);

	if (lastReturn.code !== 0) {
		exit(1);
	}
};

target.test = function () {
	target.checkRuleFiles();
	target.mocha();
	target.fuzz({ amount: 150, fuzzBrokenAutofixes: false });
	target.checkLicenses();
};

target.gensite = function () {
	echo("Generating documentation");

	const DOCS_RULES_DIR = path.join(DOCS_SRC_DIR, "rules");
	const RULE_VERSIONS_FILE = path.join(
		DOCS_SRC_DIR,
		"_data/rule_versions.json",
	);

	// Set up rule version information
	let versions = test("-f", RULE_VERSIONS_FILE)
		? JSON.parse(cat(RULE_VERSIONS_FILE))
		: {};

	if (!versions.added) {
		versions = {
			added: versions,
			removed: {},
		};
	}

	// 1. Update rule meta data by checking rule docs - important to catch removed rules
	echo("> Updating rule version meta data (Step 1)");
	const ruleDocsFiles = find(DOCS_RULES_DIR);

	ruleDocsFiles.forEach((filename, i) => {
		if (test("-f", filename) && path.extname(filename) === ".md") {
			echo(
				`> Updating rule version meta data (Step 1: ${i + 1}/${ruleDocsFiles.length}): ${filename}`,
			);

			const baseName = path.basename(filename, ".md"),
				sourceBaseName = `${baseName}.js`,
				sourcePath = path.join("lib/rules", sourceBaseName);

			if (!versions.added[baseName]) {
				versions.added[baseName] = getFirstVersionOfFile(sourcePath);
			}

			if (!versions.removed[baseName] && !test("-f", sourcePath)) {
				versions.removed[baseName] =
					getFirstVersionOfDeletion(sourcePath);
			}
		}
	});

	JSON.stringify(versions, null, 4).to(RULE_VERSIONS_FILE);

	// 2. Generate rules index page meta data
	echo("> Generating the rules index page (Step 2)");
	generateRuleIndexPage();

	// 3. Create Example Formatter Output Page
	echo("> Creating the formatter examples (Step 3)");
	generateFormatterExamples();

	echo("Done generating documentation");
};

target.generateRuleIndexPage = generateRuleIndexPage;

target.webpack = function (mode = "none") {
	exec(`${getBinFile("webpack")} --mode=${mode} --output-path=${BUILD_DIR}`);
};

target.checkRuleFiles = function () {
	echo("Validating rules");

	let errors = 0;

	RULE_FILES.forEach(filename => {
		const basename = path.basename(filename, ".js");
		const docFilename = `docs/src/rules/${basename}.md`;
		const docText = cat(docFilename);
		const docTextWithoutFrontmatter = matter(String(docText)).content;
		const docMarkdown = marked.lexer(docTextWithoutFrontmatter, {
			gfm: true,
			silent: false,
		});
		const ruleCode = cat(filename);
		const knownHeaders = [
			"Rule Details",
			"Options",
			"Environments",
			"Examples",
			"Known Limitations",
			"When Not To Use It",
			"Compatibility",
		];

		/**
		 * Check if id is present in title
		 * @param {string} id id to check for
		 * @returns {boolean} true if present
		 * @private
		 * @todo Will remove this check when the main heading is automatically generated from rule metadata.
		 */
		function hasIdInTitle(id) {
			return new RegExp(`title: ${id}`, "u").test(docText);
		}

		/**
		 * Check if all H2 headers are known and in the expected order
		 * Only H2 headers are checked as H1 and H3 are variable and/or rule specific.
		 * @returns {boolean} true if all headers are known and in the right order
		 */
		function hasKnownHeaders() {
			const headers = docMarkdown
				.filter(token => token.type === "heading" && token.depth === 2)
				.map(header => header.text);

			for (const header of headers) {
				if (!knownHeaders.includes(header)) {
					return false;
				}
			}

			/*
			 * Check only the subset of used headers for the correct order
			 */
			const presentHeaders = knownHeaders.filter(header =>
				headers.includes(header),
			);

			for (let i = 0; i < presentHeaders.length; ++i) {
				if (presentHeaders[i] !== headers[i]) {
					return false;
				}
			}

			return true;
		}

		/**
		 * Check if deprecated information is in rule code.
		 * @returns {boolean} true if present
		 * @private
		 */
		function hasDeprecatedInfo() {
			const deprecatedTagRegExp = /@deprecated in ESLint/u;

			return deprecatedTagRegExp.test(ruleCode);
		}

		/**
		 * Check if the rule code has the jsdoc comment with the rule type annotation.
		 * @returns {boolean} true if present
		 * @private
		 */
		function hasRuleTypeJSDocComment() {
			const comment = "/** @type {import('../types').Rule.RuleModule} */";

			return ruleCode.includes(comment);
		}

		// check for docs
		if (!test("-f", docFilename)) {
			console.error("Missing documentation for rule %s", basename);
			errors++;
		} else {
			// check for proper doc h1 format
			if (!hasIdInTitle(basename)) {
				console.error(
					"Missing id in the doc page's title of rule %s",
					basename,
				);
				errors++;
			}

			// check for proper doc headers
			if (!hasKnownHeaders()) {
				console.error(
					"Unknown or misplaced header in the doc page of rule %s, allowed headers (and their order) are: '%s'",
					basename,
					knownHeaders.join("', '"),
				);
				errors++;
			}
		}

		// check parity between rules index file and rules directory
		const ruleIdsInIndex = require("./lib/rules/index");
		const ruleDef = ruleIdsInIndex.get(basename);

		if (!ruleDef) {
			console.error(
				`Missing rule from index (./lib/rules/index.js): ${basename}. If you just added a new rule then add an entry for it in this file.`,
			);
			errors++;
		} else {
			// check deprecated
			if (ruleDef.meta.deprecated && !hasDeprecatedInfo()) {
				console.error(
					`Missing deprecated information in ${basename} rule code. Please write @deprecated tag in code.`,
				);
				errors++;
			}

			// check eslint:recommended
			const recommended = require("./packages/js").configs.recommended;

			if (ruleDef.meta.docs.recommended) {
				if (recommended.rules[basename] !== "error") {
					console.error(
						`Missing rule from eslint:recommended (./packages/js/src/configs/eslint-recommended.js): ${basename}. If you just made a rule recommended then add an entry for it in this file.`,
					);
					errors++;
				}
			} else {
				if (basename in recommended.rules) {
					console.error(
						`Extra rule in eslint:recommended (./packages/js/src/configs/eslint-recommended.js): ${basename}. If you just added a rule then don't add an entry for it in this file.`,
					);
					errors++;
				}
			}

			if (!hasRuleTypeJSDocComment()) {
				console.error(
					`Missing rule type JSDoc comment from ${basename} rule code.`,
				);
				errors++;
			}
		}

		// check for tests
		if (!test("-f", `tests/lib/rules/${basename}.js`)) {
			console.error("Missing tests for rule %s", basename);
			errors++;
		}
	});

	if (errors) {
		exit(1);
	}
};

target.checkRuleExamples = function () {
	// We don't need the stack trace of execFileSync if the command fails.
	try {
		childProcess.execFileSync(
			process.execPath,
			["tools/check-rule-examples.js", "docs/src/rules/*.md"],
			{ stdio: "inherit" },
		);
	} catch {
		exit(1);
	}
};

target.checkLicenses = function () {
	/**
	 * Check if a dependency is eligible to be used by us
	 * @param {Object} dependency dependency to check
	 * @returns {boolean} true if we have permission
	 * @private
	 */
	function isPermissible(dependency) {
		const licenses = dependency.licenses;

		if (Array.isArray(licenses)) {
			return licenses.some(license =>
				isPermissible({
					name: dependency.name,
					licenses: license,
				}),
			);
		}

		return OPEN_SOURCE_LICENSES.some(license => license.test(licenses));
	}

	echo("Validating licenses");

	checker.init(
		{
			start: __dirname,
		},
		deps => {
			const impermissible = Object.keys(deps)
				.map(dependency => ({
					name: dependency,
					licenses: deps[dependency].licenses,
				}))
				.filter(dependency => !isPermissible(dependency));

			if (impermissible.length) {
				impermissible.forEach(dependency => {
					console.error(
						"%s license for %s is impermissible.",
						dependency.licenses,
						dependency.name,
					);
				});
				exit(1);
			}
		},
	);
};

/**
 * Checks if hyperfine is installed and has a supported version.
 * If hyperfine is not installed or has an unsupported version,
 * an error message with a link to installation instructions is printed,
 * and the process exits with code 1.
 * @returns {void}
 * @throws If an unexpected error occurs while checking the installation.
 */
function checkHyperfineInstallation() {
	const INSTALLATION_INSTRUCTIONS_URL =
		"https://github.com/sharkdp/hyperfine?tab=readme-ov-file#installation";
	let output;
	try {
		output = childProcess.execFileSync("hyperfine", ["--version"], {
			encoding: "utf8",
		});
	} catch (error) {
		// If hyperfine is not installed, the error code will be "ENOENT".
		if (
			error.code === "ENOENT" &&
			error.signal === null &&
			error.status === null
		) {
			console.error(
				`hyperfine is not installed. Please install it to run performance tests:\n${INSTALLATION_INSTRUCTIONS_URL}`,
			);
			exit(1);
		}
		throw error;
	}
	// `--shell=none` is not supported by hyperfine < 1.13.0, so we check the version.
	const version = / (?<version>\d+\.\d+\.\d+)\n$/u.exec(output)?.groups
		.version;
	if (!version || semver.lt(version, "1.13.0")) {
		console.error(
			`Your hyperfine version is not supported. Please install the latest version to run performance tests:\n${INSTALLATION_INSTRUCTIONS_URL}`,
		);
		exit(1);
	}
}

/**
 * Downloads a repository which has many js files to test performance with multi files.
 * Here, it's eslint@1.10.3 (450 files).
 * @returns {void}
 */
function downloadMultifilesTestTarget() {
	if (!fs.existsSync(PERF_MULTIFILES_TARGET_DIR)) {
		echo(
			"Downloading the repository of multi-files performance test target.",
		);
		childProcess.execSync(
			`git clone -b v1.10.3 --no-tags --depth 1 https://github.com/eslint/eslint.git "${PERF_MULTIFILES_TARGET_DIR}"`,
			{ stdio: "ignore" },
		);
	}
}

/**
 * Creates a config file to use performance tests.
 * This config is turning all core rules on.
 * @returns {void}
 */
function createConfigForPerformanceTest() {
	const rules = {};
	for (const ruleId of builtinRules.keys()) {
		rules[ruleId] = "warn";
	}
	const config = [{ languageOptions: { sourceType: "commonjs" }, rules }];
	const content = `module.exports = ${JSON.stringify(config, null, 4)};\n`;
	fs.writeFileSync(PERF_ESLINT_CONFIG, content);
}

/**
 * Creates a command to run ESLint with a given argument.
 * @param {string} arg A file or glob pattern to pass to ESLint. This should not include any unescaped double quotes (`"`).
 * @returns {string} The command to run ESLint with the given argument.
 */
function createESLintCommand(arg) {
	const eslintBin = require("./package.json").bin.eslint;

	return `"${process.execPath}" "${eslintBin}" --config "${PERF_ESLINT_CONFIG}" --no-ignore "${arg}"`;
}

/**
 * Runs hyperfine to measure the performance of a command.
 * If the command fails, the current process exits with code 1.
 * @param {string} title The title of the command in the hyperfine output.
 * @param {string} command The command to run.
 * @returns {void}
 */
function runPerformanceTest(title, command) {
	// We don't need the stack trace of execFileSync if the command fails.
	try {
		/*
		 * The used hyperfine options are:
		 *   --shell=none turns off the shell escaping, so that glob patterns are not expanded.
		 *   --warmup=1 runs the command once before measuring, to avoid cold start issues.
		 *   --runs=5 runs the command 5 times, not counting the warmup run.
		 *   --command-name sets the title of the command in the hyperfine output.
		 *
		 * The ANSI escape codes are used to overwrite the text "Benchmark 1: " that hyperfine prints by default,
		 * and to set the title in bold.
		 *   `\x1b[1K` clears the line
		 *   `\x1b[99D` moves the cursor back to the beginning of the line
		 *   `\x1b[1m` sets the text to bold
		 *   `\x1b[0m` resets the text formatting
		 */
		childProcess.execFileSync(
			"hyperfine",
			[
				"--shell=none",
				"--warmup=1",
				"--runs=5",
				"--command-name",
				`\x1b[1K\x1b[99D\x1b[1m${title}\x1b[0m`,
				command,
			],
			{ stdio: "inherit" },
		);
	} catch {
		exit(1);
	}
}

target.perf = () => {
	checkHyperfineInstallation();

	downloadMultifilesTestTarget();

	createConfigForPerformanceTest();

	// Empty line for better readability in the console output.
	console.log();

	const loadingCommand = `"${process.execPath}" "${require("./package.json").main}"`;
	runPerformanceTest("Loading", loadingCommand);

	const singleFileCommand = createESLintCommand(
		"tests/performance/jshint.js",
	);
	runPerformanceTest("Single File", singleFileCommand);

	const PERF_MULTIFILES_TARGETS = `${TEMP_DIR}eslint/performance/eslint/{lib,tests/lib}/**/*.js`;
	// Count test target files.
	const fileCount = glob.sync(PERF_MULTIFILES_TARGETS).length;
	const multiFilesCommand = createESLintCommand(PERF_MULTIFILES_TARGETS);
	runPerformanceTest(`Multi Files (${fileCount} files)`, multiFilesCommand);
};

target.generateRelease = ([packageTag]) => generateRelease({ packageTag });
target.generatePrerelease = ([prereleaseId]) =>
	generateRelease({ prereleaseId, packageTag: "next" });
target.publishRelease = publishRelease;
