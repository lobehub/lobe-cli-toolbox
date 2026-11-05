export interface Document {
  metadata?: Record<string, unknown>;
  pageContent: string;
}

export interface TextSplitterOptions {
  chunkOverlap: number;
  chunkSize: number;
  lengthFunction?: (text: string) => number;
}

const DEFAULT_SEPARATORS = ['\n\n', '\n', ' ', ''];

const MARKDOWN_SEPARATORS = [
  '\n## ',
  '\n### ',
  '\n#### ',
  '\n##### ',
  '\n###### ',
  ...DEFAULT_SEPARATORS,
];

/**
 * Splits text on the coarsest separator that occurs, then merges the pieces back into chunks
 * of at most `chunkSize` (as measured by `lengthFunction`). Pieces that are still too large are
 * split again with the next separator.
 */
export class RecursiveCharacterTextSplitter {
  private readonly chunkOverlap: number;
  private readonly chunkSize: number;
  private readonly lengthFunction: (text: string) => number;
  private separators = DEFAULT_SEPARATORS;

  constructor({ chunkOverlap, chunkSize, lengthFunction }: TextSplitterOptions) {
    this.chunkOverlap = chunkOverlap;
    this.chunkSize = chunkSize;
    this.lengthFunction = lengthFunction ?? ((text) => text.length);
  }

  static fromLanguage(language: 'markdown', options: TextSplitterOptions) {
    const splitter = new RecursiveCharacterTextSplitter(options);
    if (language === 'markdown') splitter.separators = MARKDOWN_SEPARATORS;
    return splitter;
  }

  splitText(text: string): string[] {
    return this.splitRecursively(text, this.separators);
  }

  createDocuments(texts: string[], metadatas: Record<string, unknown>[] = []): Document[] {
    return texts.flatMap((text, i) =>
      this.splitText(text).map((pageContent) => ({
        metadata: { ...metadatas[i] },
        pageContent,
      })),
    );
  }

  private splitRecursively(text: string, separators: string[]): string[] {
    let separator = '';
    let nextSeparators: string[] = [];
    for (const [i, candidate] of separators.entries()) {
      if (candidate && text.includes(candidate)) {
        separator = candidate;
        nextSeparators = separators.slice(i + 1);
        break;
      }
    }

    const chunks: string[] = [];
    let small: string[] = [];

    for (const piece of text.split(separator).filter(Boolean)) {
      if (this.lengthFunction(piece) < this.chunkSize) {
        small.push(piece);
        continue;
      }
      if (small.length > 0) {
        chunks.push(...this.mergeSplits(small, separator));
        small = [];
      }
      if (nextSeparators.length === 0) chunks.push(piece);
      else chunks.push(...this.splitRecursively(piece, nextSeparators));
    }

    if (small.length > 0) chunks.push(...this.mergeSplits(small, separator));
    return chunks;
  }

  private mergeSplits(splits: string[], separator: string): string[] {
    const separatorLength = this.lengthFunction(separator);
    const docs: string[] = [];
    const current: string[] = [];
    let total = 0;

    const flush = () => {
      const doc = current.join(separator).trim();
      if (doc) docs.push(doc);
    };

    for (const split of splits) {
      const length = this.lengthFunction(split);
      const joinCost = current.length > 0 ? separatorLength : 0;

      if (total + length + joinCost > this.chunkSize && current.length > 0) {
        flush();
        // Keep up to `chunkOverlap` from the end of the flushed chunk as the start of the next.
        while (
          current.length > 0 &&
          (total > this.chunkOverlap || total + length + separatorLength > this.chunkSize)
        ) {
          total -= this.lengthFunction(current[0]!) + (current.length > 1 ? separatorLength : 0);
          current.shift();
        }
      }

      current.push(split);
      total += length + (current.length > 1 ? separatorLength : 0);
    }

    flush();
    return docs;
  }
}
