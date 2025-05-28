export interface TextSplitterOptions {
  chunkOverlap: number;
  chunkSize: number;
  lengthFunction?: (text: string) => number;
}

export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private lengthFunction: (text: string) => number;
  private separators: string[];

  constructor(options: TextSplitterOptions) {
    this.chunkSize = options.chunkSize;
    this.chunkOverlap = options.chunkOverlap;
    this.lengthFunction = options.lengthFunction || ((text: string) => text.length);
    this.separators = ['\n\n', '\n', ' ', ''];
  }

  static fromLanguage(
    language: string,
    options: TextSplitterOptions,
  ): RecursiveCharacterTextSplitter {
    // For markdown, we use specific separators
    const instance = new RecursiveCharacterTextSplitter(options);
    if (language === 'markdown') {
      instance.separators = [
        '\n## ',
        '\n### ',
        '\n#### ',
        '\n##### ',
        '\n###### ',
        '\n\n',
        '\n',
        ' ',
        '',
      ];
    }
    return instance;
  }

  async splitText(text: string): Promise<string[]> {
    return this.splitTextRecursively(text, this.separators);
  }

  private splitTextRecursively(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];
    let separator = separators.at(-1) || '';
    let newSeparators: string[] = [];

    for (let i = 0; i < separators.length; i++) {
      const s = separators[i];
      if (!s) continue; // Skip undefined or empty strings
      if (s === '') {
        separator = s;
        break;
      }
      if (text.includes(s)) {
        separator = s;
        newSeparators = separators.slice(i + 1);
        break;
      }
    }

    const splits = this.splitTextWithSeparator(text, separator);

    let goodSplits: string[] = [];
    const _separator = separator === '' ? '' : separator;

    for (const s of splits) {
      if (this.lengthFunction(s) < this.chunkSize) {
        goodSplits.push(s);
      } else {
        if (goodSplits.length > 0) {
          const mergedText = this.mergeSplits(goodSplits, _separator);
          finalChunks.push(...mergedText);
          goodSplits = [];
        }
        if (newSeparators.length === 0) {
          finalChunks.push(s);
        } else {
          const otherInfo = this.splitTextRecursively(s, newSeparators);
          finalChunks.push(...otherInfo);
        }
      }
    }

    if (goodSplits.length > 0) {
      const mergedText = this.mergeSplits(goodSplits, _separator);
      finalChunks.push(...mergedText);
    }

    return finalChunks;
  }

  private splitTextWithSeparator(text: string, separator: string): string[] {
    let splits: string[];
    if (separator) {
      splits = text.split(separator);
    } else {
      splits = text.split('');
    }
    return splits.filter((s) => s !== '');
  }

  private mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    const currentDoc: string[] = [];
    let total = 0;

    for (const d of splits) {
      const len = this.lengthFunction(d);
      if (
        total + len + (currentDoc.length > 0 ? this.lengthFunction(separator) : 0) >
        this.chunkSize
      ) {
        if (total > this.chunkSize) {
          console.warn(
            `Created a chunk of size ${total}, which is longer than the specified ${this.chunkSize}`,
          );
        }
        if (currentDoc.length > 0) {
          const doc = this.joinDocs(currentDoc, separator);
          if (doc !== null) {
            docs.push(doc);
          }
          while (
            total > this.chunkOverlap ||
            (total + len + (currentDoc.length > 0 ? this.lengthFunction(separator) : 0) >
              this.chunkSize &&
              total > 0)
          ) {
            const firstDoc = currentDoc[0];
            if (firstDoc) {
              total -=
                this.lengthFunction(firstDoc) +
                (currentDoc.length > 1 ? this.lengthFunction(separator) : 0);
              currentDoc.shift();
            } else {
              break;
            }
          }
        }
      }
      currentDoc.push(d);
      total += len + (currentDoc.length > 1 ? this.lengthFunction(separator) : 0);
    }

    const doc = this.joinDocs(currentDoc, separator);
    if (doc !== null) {
      docs.push(doc);
    }

    return docs;
  }

  private joinDocs(docs: string[], separator: string): string | null {
    const text = docs.join(separator).trim();
    return text === '' ? null : text;
  }
}
