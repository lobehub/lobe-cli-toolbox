export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  content: string;
  role: MessageRole;
}

export type PromptVariables = Record<string, string | undefined>;

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Fills `{name}` placeholders in a single pass, so `$` sequences and placeholders inside the
 * inserted values are kept verbatim. Unknown or `undefined` variables stay as they are.
 */
export const fillTemplate = (template: string, variables: PromptVariables) =>
  template.replaceAll(PLACEHOLDER, (match, key: string) => variables[key] ?? match);

export class PromptTemplate<T extends PromptVariables = PromptVariables> {
  constructor(private readonly template: string) {}

  static fromTemplate<T extends PromptVariables = PromptVariables>(template: string) {
    return new PromptTemplate<T>(template);
  }

  format(variables: T): string {
    return fillTemplate(this.template, variables);
  }
}

export class ChatPromptTemplate<T extends PromptVariables = PromptVariables> {
  constructor(private readonly messages: ChatMessage[]) {}

  static fromMessages<T extends PromptVariables = PromptVariables>(
    messages: Array<[MessageRole, string]>,
  ) {
    return new ChatPromptTemplate<T>(messages.map(([role, content]) => ({ content, role })));
  }

  formatMessages(variables: T): ChatMessage[] {
    return this.messages.map(({ content, role }) => ({
      content: fillTemplate(content, variables),
      role,
    }));
  }
}
