export interface MessageTemplate {
  content: string;
  role: 'system' | 'user' | 'assistant';
}

export interface PromptVariables {
  [key: string]: string | undefined;
}

export class ChatPromptTemplate<T extends PromptVariables = PromptVariables> {
  private messages: MessageTemplate[];

  constructor(messages: MessageTemplate[]) {
    this.messages = messages;
  }

  static fromMessages<T extends PromptVariables = PromptVariables>(
    messages: Array<[string, string]>,
  ): ChatPromptTemplate<T> {
    const messageTemplates: MessageTemplate[] = messages.map(([role, content]) => ({
      content,
      role: role as 'system' | 'user' | 'assistant',
    }));
    return new ChatPromptTemplate<T>(messageTemplates);
  }

  async formatMessages(variables: T): Promise<Array<{ content: string; role: string }>> {
    return this.messages.map((message) => ({
      content: this.formatString(message.content, variables),
      role: message.role,
    }));
  }

  private formatString(template: string, variables: PromptVariables): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(regex, value);
      }
    }
    return result;
  }
}
