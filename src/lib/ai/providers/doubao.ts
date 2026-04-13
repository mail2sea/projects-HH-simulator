// Doubao API 服务实现
import { AIProvider, AIMessage, AIResponse, AIError } from '../adapter';
import { DoubaoRequest, DoubaoResponse, ErrorType } from '../types';

const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';
const MODEL_NAME = 'doubao-seed-2-0-pro-260215';

class DoubaoProvider implements AIProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey?: string, apiUrl?: string, model?: string) {
    this.apiKey = apiKey || ARK_API_KEY || '';
    this.apiUrl = apiUrl || ARK_API_URL;
    this.model = model || MODEL_NAME;

    if (!this.apiKey) {
      throw new Error('ARK_API_KEY is required');
    }
  }

  async invoke(messages: AIMessage[], options?: any): Promise<AIResponse> {
    const startTime = Date.now();
    console.log(`[DoubaoProvider] Request started: ${messages.length} messages`);

    try {
      // 构建请求体
      const requestBody: DoubaoRequest = {
        model: this.model,
        input: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: [{
            type: 'input_text',
            text: msg.content
          }]
        }))
      };

      // 实现超时功能
      const controller = new AbortController();
      const timeout = options?.timeout || 30000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // 发送请求
      let response;
      try {
        response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const endTime = Date.now();
        console.log(`[DoubaoProvider] Request completed in ${endTime - startTime}ms, status: ${response.status}`);

        // 处理响应
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          this.handleError(response.status, errorData);
        }

        const data: DoubaoResponse = await response.json();

        // 提取内容
        const messageOutput = data.output.find(output => output.type === 'message' && output.role === 'assistant');
        if (!messageOutput || !messageOutput.content) {
          throw new Error('No assistant message found in response');
        }

        const textContent = messageOutput.content.find(content => content.type === 'output_text');
        if (!textContent || !textContent.text) {
          throw new Error('No text content found in response');
        }

        return {
          content: textContent.text,
          usage: {
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens
          }
        };
      } catch (error: any) {
        clearTimeout(timeoutId);
        const endTime = Date.now();
        
        // 处理超时错误
        if (error.name === 'AbortError') {
          const timeoutError: any = new Error('Request timeout');
          timeoutError.type = 'TimeoutError';
          console.error(`[DoubaoProvider] Request timed out in ${endTime - startTime}ms`);
          throw timeoutError;
        }
        
        console.error(`[DoubaoProvider] Request failed in ${endTime - startTime}ms:`, error);
        throw error;
      }
    } catch (error) {
      const endTime = Date.now();
      console.error(`[DoubaoProvider] Request failed in ${endTime - startTime}ms:`, error);
      throw error;
    }
  }

  private handleError(status: number, errorData: any): never {
    let errorType: ErrorType;
    let errorMessage: string;

    switch (status) {
      case 401:
        errorType = 'AuthenticationError';
        errorMessage = errorData.error?.message || 'Authentication failed: Invalid API key';
        break;
      case 403:
        errorType = 'PermissionError';
        errorMessage = errorData.error?.message || 'Permission denied';
        break;
      case 429:
        errorType = 'RateLimitError';
        errorMessage = errorData.error?.message || 'Rate limit exceeded';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = 'ServerError';
        errorMessage = errorData.error?.message || 'Server error';
        break;
      default:
        errorType = 'UnknownError';
        errorMessage = errorData.error?.message || `Unknown error: ${status}`;
    }

    const error: AIError = new Error(errorMessage);
    error.code = status;
    error.type = errorType;
    throw error;
  }
}

export default DoubaoProvider;
