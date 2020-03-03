# tsconfig-loader

Load tsconfig, respecting `TS_NODE_PROJECT` env var and `"extends"`

## Installation

```
yarn add tsconfig-loader
```

## Usage

```ts
import load from 'tsconfig-loader';

const result = load();
// => {tsConfigPath: 'path/to/tsconfig.json', tsConfig: {compilerOptions: {...}}}
```
