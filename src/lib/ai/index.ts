// AI服务入口
import { AIProvider, AIMessage, AIResponse } from './adapter';
import DoubaoProvider from './providers/doubao';

// 创建默认AI提供商实例
let aiProvider: AIProvider;

try {
  aiProvider = new DoubaoProvider();
  console.log('AI Provider initialized: Doubao');
} catch (error) {
  console.error('Failed to initialize AI provider:', error);
  // 这里可以添加回退逻辑
  throw error;
}

// 统一调用接口
export const aiService = {
  async invoke(messages: AIMessage[], options?: any): Promise<AIResponse> {
    return aiProvider.invoke(messages, options);
  }
};

export * from './adapter';
export * from './types';
