---
title: Set up a Development Environment
eleventyNavigation:
    key: development environment
    parent: contribute to eslint
    title: Set up a Development Environment
    order: 6
---

{%- from 'components/npm_tabs.macro.html' import npm_tabs with context %}

ESLint has a very lightweight development environment that makes updating code fast and easy. This is a step-by-step guide to setting up a local development environment that will let you contribute back to the project.

## Step 1: Install Node.js

Go to <https://nodejs.org/> to download and install the latest stable version for your operating system.

Most of the installers already come with [npm](https://www.npmjs.com/) but if for some reason npm doesn't work on your system, you can install it manually using the instructions on the site.

## Step 2: Fork and Checkout Your Own ESLint Repository

Go to <https://github.com/eslint/eslint> and click the "Fork" button. Follow the [GitHub documentation](https://help.github.com/articles/fork-a-repo) for forking and cloning.

Clone your fork:

```shell
git clone https://github.com/<Your GitHub Username>/eslint
```

Once you've cloned the repository, run `npm install` to get all the necessary dependencies:

```shell
cd eslint
```

{{ npm_tabs({
    command: "install",
    packages: [],
    args: []
}) }}

You must be connected to the Internet for this step to work. You'll see a lot of utilities being downloaded.

**Note:** It's a good idea to re-run `npm install` whenever you pull from the main repository to ensure you have the latest development dependencies.

## Step 3: Add the Upstream Source

The _upstream source_ is the main ESLint repository where active development happens. While you won't have push access to upstream, you will have pull access, allowing you to pull in the latest code whenever you want.

To add the upstream source for ESLint, run the following in your repository:

```shell
git remote add upstream git@github.com:eslint/eslint.git
```

Now, the remote `upstream` points to the upstream source.

## Step 4: Install the Yeoman Generator

[Yeoman](https://yeoman.io) is a scaffold generator that ESLint uses to help streamline development of new rules. If you don't already have Yeoman installed, you can install it via npm:

{{ npm_tabs({
    command: "install",
    packages: ["yo"],
    args: ["--global"]
}) }}

Then, you can install the ESLint Yeoman generator:

{{ npm_tabs({
    command: "install",
    packages: ["generator-eslint"],
    args: ["--global"]
}) }}

Please see the [generator documentation](https://github.com/eslint/generator-eslint) for instructions on how to use it.

## Step 5: Run the Tests

Running the tests is the best way to ensure you have correctly set up your development environment. Make sure you're in the `eslint` directory and run:

```shell
npm test
```

The testing takes a few minutes to complete. If any tests fail, that likely means one or more parts of the environment setup didn't complete correctly. The upstream tests always pass.

## Reference Information

### Directory Structure

The ESLint directory and file structure is as follows:

- `bin` - executable files that are available when ESLint is installed.
- `conf` - default configuration information.
- `docs` - documentation for the project.
- `lib` - contains the source code.
    - `formatters` - all source files defining formatters.
    - `rules` - all source files defining rules.
- `tests` - the main unit test folder.
    - `lib` - tests for the source code.
        - `formatters` - tests for the formatters.
        - `rules` - tests for the rules.

### Workflow

Once you have your development environment installed, you can make and submit changes to the ESLint source files. Doing this successfully requires careful adherence to our [pull-request submission workflow](./pull-requests).

### Build Scripts

ESLint has several build scripts that help with various parts of development.

#### npm test

The primary script to use is `npm test`, which does several things:

1. Lints all JavaScript (including tests) and JSON.
1. Runs all tests on Node.js.
1. Checks code coverage targets.
1. Generates `build/eslint.js` for use in a browser.
1. Runs a subset of tests in PhantomJS.

Be sure to run this after making changes and before sending a pull request with your changes.

**Note:** The full code coverage report is output into `/coverage`.

#### npm run lint

Runs just the JavaScript and JSON linting on the repository.

#### npm run webpack

Generates `build/eslint.js`, a version of ESLint for use in the browser.
