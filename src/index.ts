// Extracted & adapted from https://github.com/dividab/tsconfig-paths/blob/6da68cbec7f11aa84ec7aeb14732d9edcdb82b68/src/tsconfig-loader.ts

import * as path from 'path';
import * as fs from 'fs';
import deepmerge = require('deepmerge');
import JSON5 = require('json5');
import StripBom = require('strip-bom');
import {sync as resolve} from 'resolve';
import {JSONSchemaForTheTypeScriptCompilerSConfigurationFile} from './tsconfig';

export type Tsconfig = JSONSchemaForTheTypeScriptCompilerSConfigurationFile;

export interface TsConfigLoaderResult {
  tsConfigPath: string;
  tsConfig: Tsconfig;
}

export interface TsConfigLoaderParams {
  filename?: string;
  cwd?: string;
}

export default function loadTsconfig({
  filename = process.env.TS_NODE_PROJECT,
  cwd = process.cwd(),
}: TsConfigLoaderParams = {}): TsConfigLoaderResult | undefined {
  const configPath = resolveConfigPath(cwd, filename);

  if (!configPath) {
    return undefined;
  }

  const config = loadTsconfigFile(configPath);

  if (!config) return undefined;

  return {
    tsConfigPath: configPath,
    tsConfig: config,
  };
}

function resolveConfigPath(cwd: string, filename?: string): string | undefined {
  if (filename) {
    const fullFilename = path.resolve(cwd, filename);
    const absolutePath = fs.lstatSync(fullFilename).isDirectory()
      ? path.resolve(fullFilename, './tsconfig.json')
      : fullFilename;

    return absolutePath;
  }

  if (fs.statSync(cwd).isFile()) {
    return path.resolve(cwd);
  }

  const configAbsolutePath = walkForTsConfig(cwd);
  return configAbsolutePath ? path.resolve(configAbsolutePath) : undefined;
}

function walkForTsConfig(directory: string): string | undefined {
  const configPath = path.join(directory, './tsconfig.json');
  if (fs.existsSync(configPath)) {
    return configPath;
  }

  const parentDirectory = path.join(directory, '../');

  // If we reached the top
  if (directory === parentDirectory) {
    return undefined;
  }

  return walkForTsConfig(parentDirectory);
}

function loadTsconfigFile(configFilePath: string): Tsconfig | undefined {
  if (!fs.existsSync(configFilePath)) {
    return undefined;
  }

  const configString = fs.readFileSync(configFilePath, 'utf8');
  const cleanedJson = StripBom(configString);
  const config: Tsconfig = JSON5.parse(cleanedJson);
  let extendedConfig = config.extends;

  if (extendedConfig) {
    const currentDir = path.dirname(configFilePath);
    extendedConfig = resolve(extendedConfig, {
      basedir: currentDir,
      extensions: ['.json'],
      packageFilter: (pkg) => {
        pkg.main = 'tsconfig.json';
        return pkg;
      },
    });
    const base = loadTsconfigFile(extendedConfig) || {};

    // baseUrl should be interpreted as relative to the base tsconfig,
    // but we need to update it so it is relative to the original tsconfig being loaded
    if (base && base.compilerOptions && base.compilerOptions.baseUrl) {
      const extendsDir = path.dirname(extendedConfig);
      base.compilerOptions.baseUrl = path.relative(
        path.dirname(configFilePath),
        path.join(extendsDir, base.compilerOptions.baseUrl),
      );
    }

    return deepmerge(base, config);
  }
  return config;
}
