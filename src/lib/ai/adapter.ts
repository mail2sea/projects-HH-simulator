// 统一AI服务接口定义
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AIProvider {
  invoke(messages: AIMessage[], options?: any): Promise<AIResponse>;
}

export interface AIError extends Error {
  code?: number;
  type?: string;
}
