import { minimatch } from 'minimatch';

export const DEFAULT_IGNORES = [
  '*-lock.*',
  '*.lock',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.png',
  '**/*.gif',
  '**/*.svg',
  '**/*.ico',
  '**/*.webp',
  '**/*.mp4',
  '**/*.mp3',
  '**/*.zip',
  '**/*.tar',
  '**/*.tar.gz',
  'node_modules/**',
  'dist/**',
  'build/**',
  '**/*.min.js',
  '**/*.min.css',
];

const FILE_HEADER = /^diff --git a\/(.+?) b\/(.+)$/;

/** Splits a unified diff into one chunk per file, each starting with its `diff --git` line. */
export const splitDiffByFile = (diff: string): string[][] => {
  const files: string[][] = [];
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git') || files.length === 0) files.push([line]);
    else files.at(-1)!.push(line);
  }
  return files;
};

/** Drops every file whose path (old or new) matches one of the glob patterns. */
export const filterDiff = (diff: string, patterns: string[]): string => {
  if (!diff) return diff;
  const isIgnored = (path: string) =>
    patterns.some((pattern) => minimatch(path, pattern, { dot: true, matchBase: true }));

  return splitDiffByFile(diff)
    .filter(([header]) => {
      const match = header?.match(FILE_HEADER);
      return !match || !(isIgnored(match[1]!) || isIgnored(match[2]!));
    })
    .map((lines) => lines.join('\n'))
    .join('\n');
};

const isMetaLine = (line: string) =>
  line.startsWith('diff --git') ||
  line.startsWith('--- ') ||
  line.startsWith('+++ ') ||
  line.startsWith('@@') ||
  /^(?:new|deleted) file mode|^rename (?:from|to) |^Binary files /.test(line);

const isChangeLine = (line: string) =>
  (line.startsWith('+') && !line.startsWith('+++ ')) ||
  (line.startsWith('-') && !line.startsWith('--- '));

/**
 * Shrinks a diff to roughly `maxLines` while keeping each change under its own file header:
 * unchanged context is dropped first, then every file is cut to an equal share of the budget.
 */
export const compressDiff = (diff: string, maxLines = 200): string => {
  const total = diff.split('\n').length;
  if (total <= maxLines) return diff;

  const files = splitDiffByFile(diff).map((lines) =>
    lines.filter((line) => isMetaLine(line) || isChangeLine(line)),
  );
  const kept = files.reduce((sum, lines) => sum + lines.length, 0);

  let result: string[];
  if (kept <= maxLines) {
    result = files.flat();
  } else {
    const share = Math.max(10, Math.floor(maxLines / files.length));
    result = files.flatMap((lines) =>
      lines.length <= share
        ? lines
        : [...lines.slice(0, share), `... (${lines.length - share} lines truncated)`],
    );
  }

  return [...result, `... (${total} lines compressed to ${result.length})`].join('\n');
};
