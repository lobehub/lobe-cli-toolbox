import { describe, expect, it } from 'vitest';

import { matchInputPattern } from './matchInputPattern';

describe('matchInputPattern', () => {
  it('should return filepath as is when it contains wildcard', () => {
    const filepaths = ['src/**/*.md', 'docs/*.md'];
    const extension = '.md';

    const result = matchInputPattern(filepaths, extension);

    expect(result).toEqual(['src/**/*.md', 'docs/*.md']);
  });

  it('should return filepath as is when it already contains extension', () => {
    const filepaths = ['README.md', 'docs/guide.md'];
    const extension = '.md';

    const result = matchInputPattern(filepaths, extension);

    expect(result).toEqual(['README.md', 'docs/guide.md']);
  });

  it('should append pattern when filepath is a directory', () => {
    const filepaths = ['src', 'docs'];
    const extension = '.md';

    const result = matchInputPattern(filepaths, extension);

    expect(result).toEqual(['src/**/*.md', 'docs/**/*.md']);
  });

  it('should handle mixed filepaths', () => {
    const filepaths = ['src', 'README.md', 'docs/**/*.md', 'guide.md'];
    const extension = '.md';

    const result = matchInputPattern(filepaths, extension);

    expect(result).toEqual(['src/**/*.md', 'README.md', 'docs/**/*.md', 'guide.md']);
  });

  it('should handle different extensions', () => {
    const filepaths = ['src', 'config.json'];
    const extension = '.json';

    const result = matchInputPattern(filepaths, extension);

    expect(result).toEqual(['src/**/*.json', 'config.json']);
  });

  it('should handle empty array', () => {
    const filepaths: string[] = [];
    const extension = '.md';

    const result = matchInputPattern(filepaths, extension);

    expect(result).toEqual([]);
  });

  it('should handle paths with backslashes', () => {
    const filepaths = ['src\\docs'];
    const extension = '.md';

    const result = matchInputPattern(filepaths, extension);

    // Should convert backslashes to forward slashes
    expect(result[0]).toMatch(/src\/docs\/\*\*\/\*\.md/);
  });

  it('should handle nested directory paths', () => {
    const filepaths = ['src/components', 'src/utils'];
    const extension = '.ts';

    const result = matchInputPattern(filepaths, extension);

    expect(result).toEqual(['src/components/**/*.ts', 'src/utils/**/*.ts']);
  });

  it('should return paths as is when they contain extension anywhere', () => {
    const filepaths = ['src/.md-files', 'docs/.md'];
    const extension = '.md';

    const result = matchInputPattern(filepaths, extension);

    // The function checks if filepath.includes(extension), so these should be returned as is
    expect(result).toEqual(['src/.md-files', 'docs/.md']);
  });
});
