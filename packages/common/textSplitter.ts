export interface Document {
  metadata?: Record<string, any>;
  pageContent: string;
}

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
    this.lengthFunction = options.lengthFunction || ((text) => text.length);
    this.separators = ['\n\n', '\n', ' ', ''];
  }

  async createDocuments(texts: string[], metadatas?: Record<string, any>[]): Promise<Document[]> {
    const documents: Document[] = [];

    for (const [i, text] of texts.entries()) {
      const metadata = metadatas?.[i] || {};
      const chunks = this.splitText(text);

      for (const chunk of chunks) {
        documents.push({
          metadata: { ...metadata },
          pageContent: chunk,
        });
      }
    }

    return documents;
  }

  private splitText(text: string): string[] {
    const finalChunks: string[] = [];

    // 首先尝试使用分隔符分割
    let separator = '';
    let splits: string[] = [];

    for (const sep of this.separators) {
      if (sep === '') {
        splits = text.split('');
      } else {
        splits = text.split(sep);
      }

      if (splits.length > 1) {
        separator = sep;
        break;
      }
    }

    // 如果没找到合适的分隔符，使用空字符串作为分隔符
    if (!separator && splits.length <= 1) {
      separator = '';
      splits = text.split('');
    }

    // 合并小块
    const goodSplits: string[] = [];
    for (const split of splits) {
      if (this.lengthFunction(split) < this.chunkSize) {
        goodSplits.push(split);
      } else {
        if (goodSplits.length > 0) {
          const mergedText = this.mergeSplits(goodSplits, separator);
          finalChunks.push(...mergedText);
          goodSplits.length = 0;
        }

        const otherInfo = this.splitText(split);
        finalChunks.push(...otherInfo);
      }
    }

    if (goodSplits.length > 0) {
      const mergedText = this.mergeSplits(goodSplits, separator);
      finalChunks.push(...mergedText);
    }

    return finalChunks;
  }

  private mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    let currentDoc: string[] = [];
    let total = 0;

    for (const split of splits) {
      const length = this.lengthFunction(split);

      if (
        total + length + (currentDoc.length > 0 ? this.lengthFunction(separator) : 0) >
          this.chunkSize &&
        currentDoc.length > 0
      ) {
        const doc = currentDoc.join(separator);
        if (doc.trim()) {
          docs.push(doc);
        }

        // 处理重叠
        while (
          total > this.chunkOverlap ||
          (total + length + (currentDoc.length > 0 ? this.lengthFunction(separator) : 0) >
            this.chunkSize &&
            total > 0)
        ) {
          if (currentDoc.length === 0) break;
          const firstItem = currentDoc[0];
          if (!firstItem) break;

          total -=
            this.lengthFunction(firstItem) +
            (currentDoc.length > 1 ? this.lengthFunction(separator) : 0);
          currentDoc.shift();
        }
      }

      currentDoc.push(split);
      total += length + (currentDoc.length > 1 ? this.lengthFunction(separator) : 0);
    }

    const doc = currentDoc.join(separator);
    if (doc.trim()) {
      docs.push(doc);
    }

    return docs;
  }
}
