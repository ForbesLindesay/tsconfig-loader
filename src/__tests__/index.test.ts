import {readFileSync} from 'fs';
import loadTsconfig from '../';

describe('tsconfig-loader', () => {
  it('should find tsconfig in cwd', () => {
    const result = loadTsconfig({
      cwd: `${__dirname}/fixtures/tsconfig-in-cwd`,
    });
    expect(result?.tsConfig).toEqual(
      JSON.parse(
        readFileSync(
          `${__dirname}/fixtures/tsconfig-in-cwd/tsconfig.json`,
          'utf8',
        ),
      ),
    );
  });

  it('should use TS_NODE_PROJECT env if exists', () => {
    const result = loadTsconfig({
      cwd: `${__dirname}/fixtures/ts-node-project`,
      filename: 'tsconfig-alt.json',
    });
    expect(result?.tsConfig).toEqual(
      JSON.parse(
        readFileSync(
          `${__dirname}/fixtures/ts-node-project/tsconfig-alt.json`,
          'utf8',
        ),
      ),
    );
  });

  it('should find tsconfig in parent directory', () => {
    const result = loadTsconfig({
      cwd: `${__dirname}/fixtures/tsconfig-in-parent/child`,
    });
    expect(result?.tsConfig).toEqual(
      JSON.parse(
        readFileSync(
          `${__dirname}/fixtures/tsconfig-in-parent/tsconfig.json`,
          'utf8',
        ),
      ),
    );
  });

  it('should load tsconfig with comments', () => {
    const result = loadTsconfig({
      cwd: `${__dirname}/fixtures/tsconfig-with-comments`,
    });
    expect(result?.tsConfig).toEqual({test: 'with comments'});
  });

  it('should load tsconfig with extends and overwrite baseUrl', () => {
    const result = loadTsconfig({
      cwd: `${__dirname}/fixtures/tsconfig-with-extends`,
    });
    expect(result?.tsConfig).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "baseUrl": "kalle",
          "paths": Object {
            "foo": Array [
              "bar",
            ],
          },
        },
        "extends": "./base/base-config.json",
      }
    `);
  });
  it('should use baseUrl realtive to location of extend tsconfig', () => {
    const result = loadTsconfig({
      cwd: `${__dirname}/fixtures/tsconfig-with-extends-2`,
    });
    expect(result?.tsConfig).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "baseUrl": "base/olle",
          "paths": Object {
            "foo": Array [
              "bar",
            ],
          },
        },
        "extends": "./base/base-config.json",
      }
    `);
  });
  it('should extend npm packages', () => {
    const result = loadTsconfig({
      cwd: `${__dirname}/fixtures/tsconfig-with-extends-npm`,
    });
    expect(result?.tsConfig.compilerOptions).toEqual(
      require('@forbeslindesay/tsconfig/tsconfig.json').compilerOptions,
    );
  });
});
