## Contributing to EVMts

## Quick start

1. Install bun

```bash
npm i bun --global && bun --version
```
2. Update submodules

```bash
git submodule update --init --recursive
```

3. Run everything

`bun all` will run everything

```
bun all
```

This includes
- linting package.json
- linting source code
- generated docs
- building all .d.ts types for all packages
- building all cjs for all packages
- running all tests
- running all dev fixtures

3. Understand the repo in [monorepo section](#monorepo) and [packages](#packages) sections

## Monorepo

EVMts is a monorepo using

- [nx](https://nx.dev/concepts/mental-model) for caching and task management
- [bun](https://bun.sh/docs) for script runner and workspace node_module management
- [changesets](./.changeset/) for package versionning

For a list of all packages see the `workspaces` key in the root level [package.json](./package.json)

## Packages

EVMts is heavily broken up into small packages. To see the entire package graph use nx

```bash
bun run nx graph
```

The main ones to start with are the following.

#### Build packages

- [@evmts/bundler](./bundlers/bundler) is the main bundler used to create all the build tools. It bundles all contract imports using [@evmts/solc](./solc) for it's solidity compiler and [@evmts/runtime](./runtime) to construct runtimes.
- [@evmts/ts-plugin](./ts-plugin) is the LSP (language service protocol) plugin. It is what allows code editors such as VSCode to correctly infer types of solidity imports.
- [bundlers/*](./bundlers) Are where all the supported bundlers live. Most are created using [@evmts/unplugin](./bundlers/unplugin) which implements a rollup plugin once to be reused in many packages including [@evmts/webpack](./bundlers/webpack) and [@evmts/vite](./bundlers/vite) and more.
- [@evmts/config](./config) is the package that loads the EVMts config

#### Runtime packages

- [@evmts/core](./core) is the main entrypoint for all runtime functionality.

#### Docs

- [@evmts/docs](./docs) is the [vitepress docs site](https://evmts.dev). It's reference docs are generated via `bun generate:docs`

#### Example apps

Example apps are in [/examples/*](./examples). [@evmts/example-esbuild](./examples/esbuild) has a vitest test and is the simplist app.

## Code best practices

#### JavaScript with jsdoc

`@evmts` is written in javascript with jsdoc so it's `esm` build does not need to be built. This means any user using modern `esm` will be using the same src code in their node_modules as what is here.

This means all evmts packages run without being built by default and the same src code is shipped to most users

- [src/index.js](./src/index.js) - the entrypoint to the package

**Note** there is still 100% typesafety. TypeScript is able to typecheck via setting `checkJs: true` in the tsconfig and using jsdoc.

#### Types

The types are built to cache their result for end users.

```
bun build:types
```

- [tsconfig](./tsconfig.json) - @evmts/config tsconfig
- [@evmts/tsconfig](../tsconfig/base.json) - base tsconfig inherited from

## Running tests

```
bun run test
```

`@evmts/config` has >99% test coverage. Run the tests with `bun run test`

Note `bun test` will run bun instead of [vitest](https://vitest.dev) resulting in errors


## Fixtures

Fixtures in [src/fixtures](./src/fixtures/) exist both for the vitest tests and also can be loaded in watch mode.

Best way to debug a bug or implement a new feature is to first add a new fixture to use in test or dev server

Some fixtures are expected to error and the dev server will succeed if they do error. Which fixtures should error is configured in [scripts/runFixture.ts](./scripts/runFixture.ts)

Fixtures run with debug logging turned on. Debug logging is added to every function along with strong error handling so most debugging tasks won't need to involve adding console.logs if you are using a fixture.

#### Running all fixtures

```bash
bun dev
```

#### Running a specific fixtures

```bash
bun fixture basic
```
Valid names include any of the folder names in [src/fixtures](./fixtures). The default is basic

#### Adding a fixture

1. `cp -r src/fixtures/basic src/fixtures/myNewFixture`
2. update your fixture
3. Load your fixture `bun fixture myNewFixture`

Now you can implement your feature or use your fixture to write a test.

## Running linter

By default the linter runs in --fix mode

```basy
bun lint && bun format
```

The linter used is rome not prettier or eslint

#### Generating docs

Docs are generated at [../docs/reference/config/](../docs/reference/config/). To generate them run the generate command:

```
bun generate:docs
```

Docs are generated based on the jsdoc and type errors

## Code style

#### Effect

Effect is used to provide strongly typed error handling and robust functional code. Before getting started it is recomended to spend 5 minutes reviewing what an effect is.

All functions return a type `Effect<never, ErrorType, ValueType>`. You can think of this as a promise but with strongly typed errors.

- See [Why Effect](https://effect.website/docs/why-effect) docs for advantages of effect
- Learn [the basics of the effect type](https://effect.website/docs/essentials/effect-type)
- Learn [how to run an effect](https://effect.website/docs/essentials/effect-type)

Once you understand the basics you should be sufficient to trying to modify or read the code. Extensive jsdoc comments are provided.

#### Logging

All functions use extensive logging with debug mode. As a best practice it's best to always log the return value of an effect. For examples look at other functions

- [Effect logging](https://effect.website/docs/observability/logging)

#### Error handling

All functions export an error type for myFunctionName of of type MyFunctionNameError. This may be a union of many errors.

If a function never returns (is type `never`) there is no interface.

All functions return a type `Effect<never, MyFunctionNameError | never, ReturnType>` giving them strongly typed errors. Effect makes these typesafe so the types will not compile if the error types aren't correct.

#### Return Types

Most apps rely on type infering return types. Because it's important for library code like EVMts to stay stable as a best practice return types of functions are always explicitly typed

#### JavaScript with JSDOC

Typescript is used in EVMts for test code and dev scripts. But any source code is written with JavaScript with 0 build transpilation steps. Sometimes types will also be imported from [src/types.ts](./src/types.ts) which is where types can be placed if they are too tedious to write in jsdoc.

For examples of how to use jsdoc it is recomended to look at other examples.  Ai tools are very good at jsdoc. But here are some basics to get you started

- **Casting a type**

```typescript
const foo = 'foo' as 'foo' | 'bar'
```

With jsdoc you wrap the symbol in `()` and then add `@type {}` syntax

```javascript
const foo = (/** @type {'foo'|'bar'}*/)
```

- **Typing a function**

```typescript
export const isTrue = (foo: unknown) => boolean {
    ...
}
```

With jsdoc use `@param` and `@returns` with an optional description

```javascript
/**
 * @param {unknown} foo - the foo we are testing
 * @returns {boolean} - whether isTrue is true
 */
export const isTrue = foo => {
  ...
}
```

- **Exporting a type**

```typescript
export type Foo = {bar: string}
```

To export a type use `@typedef` syntax

```javascript
/**
 * @typedef {{bar: string}} Foo
 */
```

- **Importing a type**

```typescript
export type SomeType = import("npmlib").SomeType
```

To import a type use the same import syntax used here. Generally types are imported inline. Imports can be from npm libraries or relative files

```javascript
/**
 * {import("npmlib").SomeType} SomeType
 */
```

## Examples and descriptions

Since documentation is generated from jsdoc it is recomended to add jsdoc documentation to all functions. Here is an example of what a function may look like.


```typescript
/**
 * Loads an EVMts config from the given path
 * @param {string} configFilePath
 * @returns {import("effect/Effect").Effect<never, LoadConfigError, import("./types.js").ResolvedCompilerConfig>}
 * @example
 * import {tap} from 'effect/Effect'
 * import {loadConfig} from '@evmts/config'
 *
 * runPromise(loadConfig('./tsconfig.json')).pipe(
 *   tap(config => console.log(config))
 * )
 */
export const loadConfig = (configFilePath) => {
  ...
}
```

## Generated docs

Docs are generated via the [typedoc.json](./typedoc.json)

```
bun generate:docs
```

## Doing everything

To run everything including linter and tests run `bun all`

```
pnpm i  && bun build && bun all
```

Running bun all from context of repo will run all checks. It is recomended to run this before pushing your changes

1. CD to root of repo if not there already

```
cd ..
```

2. Run install and bun all

```
pnpm i  && bun all
```

## Bun Clean

If things are wierd try running bun clean and rebuilding the repo fresh

1. Cd to root of repo if not there already

```
cd ..
```

2. Run bun clean and then fresh build and upgraded bun

```
bun upgrade && bun clean && pnpm i  && bun all
```

If it's still broken for you consider opening an issue.
