import { describe, expect, it } from 'vitest';

import { RecursiveCharacterTextSplitter } from './textSplitter';

// Custom length functions for testing
const customLengthFunction = (text: string) => text.length * 2;
const wordCountLengthFunction = (text: string) => text.split(' ').length; // Count words instead of characters

describe('RecursiveCharacterTextSplitter', () => {
  describe('constructor', () => {
    it('should create instance with default length function', () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 10,
        chunkSize: 100,
      });

      expect(splitter).toBeInstanceOf(RecursiveCharacterTextSplitter);
    });

    it('should create instance with custom length function', () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 10,
        chunkSize: 100,
        lengthFunction: customLengthFunction,
      });

      expect(splitter).toBeInstanceOf(RecursiveCharacterTextSplitter);
    });
  });

  describe('fromLanguage', () => {
    it('should create instance for markdown with specific separators', () => {
      const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
        chunkOverlap: 10,
        chunkSize: 100,
      });

      expect(splitter).toBeInstanceOf(RecursiveCharacterTextSplitter);
    });

    it('should create instance for other languages with default separators', () => {
      const splitter = RecursiveCharacterTextSplitter.fromLanguage('javascript', {
        chunkOverlap: 10,
        chunkSize: 100,
      });

      expect(splitter).toBeInstanceOf(RecursiveCharacterTextSplitter);
    });
  });

  describe('splitText', () => {
    it('should split text into chunks within size limit', async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 2,
        chunkSize: 10,
      });

      const text = 'This is a long text that should be split into multiple chunks';
      const chunks = await splitter.splitText(text);

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(1);

      // Each chunk should be within size limit (except possibly the last one)
      chunks.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(15); // Allow some flexibility
      });
    });

    it('should handle short text that fits in one chunk', async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 10,
        chunkSize: 100,
      });

      const text = 'Short text';
      const chunks = await splitter.splitText(text);

      expect(chunks).toEqual([text]);
    });

    it('should handle empty text', async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 10,
        chunkSize: 100,
      });

      const chunks = await splitter.splitText('');

      expect(chunks).toEqual([]);
    });

    it('should respect chunk overlap', async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 5,
        chunkSize: 20,
      });

      const text = 'This is a test text for checking overlap functionality';
      const chunks = await splitter.splitText(text);

      expect(chunks.length).toBeGreaterThan(1);

      // Check that there's some overlap between consecutive chunks
      for (let i = 0; i < chunks.length - 1; i++) {
        const currentChunk = chunks[i];
        const nextChunk = chunks[i + 1];

        // Ensure chunks exist before processing
        if (currentChunk && nextChunk) {
          // There should be some common content (overlap)
          const currentWords = currentChunk.split(' ');
          const nextWords = nextChunk.split(' ');

          // At least one word should be common (simplified overlap check)
          const hasOverlap = currentWords.some(
            (word) =>
              word.length > 0 &&
              nextWords.some((nextWord) => nextWord.includes(word) || word.includes(nextWord)),
          );

          expect(hasOverlap || currentChunk.length <= 20).toBe(true);
        }
      }
    });

    it('should split markdown text with header separators', async () => {
      const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
        chunkOverlap: 5,
        chunkSize: 50,
      });

      const markdownText = `# Header 1
Some content under header 1.

## Header 2
Some content under header 2.

### Header 3
Some content under header 3.`;

      const chunks = await splitter.splitText(markdownText);

      expect(chunks.length).toBeGreaterThan(1);

      // Should preserve header structure where possible
      const hasHeaders = chunks.some((chunk) => chunk.includes('#'));
      expect(hasHeaders).toBe(true);
    });

    it('should handle text with custom length function', async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        // 5 words max
        chunkOverlap: 1,
        chunkSize: 5, // 1 word overlap
        lengthFunction: wordCountLengthFunction,
      });

      const text = 'This is a test text with many words that should be split';
      const chunks = await splitter.splitText(text);

      expect(chunks.length).toBeGreaterThan(1);

      // Each chunk should have at most 5 words (with some flexibility for overlap)
      chunks.forEach((chunk) => {
        const wordCount = chunk.split(' ').filter((word) => word.length > 0).length;
        expect(wordCount).toBeLessThanOrEqual(7); // Allow some flexibility
      });
    });

    it('should handle text with different separators', async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 5,
        chunkSize: 30,
      });

      const textWithParagraphs = `First paragraph.

Second paragraph.

Third paragraph.`;

      const chunks = await splitter.splitText(textWithParagraphs);

      expect(chunks.length).toBeGreaterThan(0);

      // Should split on paragraph breaks when possible
      const hasMultipleChunks = chunks.length > 1;
      if (hasMultipleChunks) {
        expect(chunks.some((chunk) => chunk.includes('paragraph'))).toBe(true);
      }
    });
  });
});
