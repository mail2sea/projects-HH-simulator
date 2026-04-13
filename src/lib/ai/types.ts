// AI服务类型定义

// Doubao API 请求结构
export interface DoubaoRequest {
  model: string;
  input: DoubaoMessage[];
}

export interface DoubaoMessage {
  role: 'user' | 'assistant' | 'system';
  content: DoubaoContent[];
}

export interface DoubaoContent {
  type: 'input_text' | 'input_image' | 'output_text';
  text?: string;
  image_url?: string;
}

// Doubao API 响应结构
export interface DoubaoResponse {
  created_at: number;
  id: string;
  max_output_tokens: number;
  model: string;
  object: string;
  output: DoubaoOutput[];
  service_tier: string;
  status: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    input_tokens_details: {
      cached_tokens: number;
    };
    output_tokens_details: {
      reasoning_tokens: number;
    };
  };
  caching: {
    type: string;
  };
  store: boolean;
  expire_at: number;
}

export interface DoubaoOutput {
  id?: string;
  type: 'reasoning' | 'message';
  summary?: {
    type: 'summary_text';
    text: string;
  }[];
  role?: 'assistant';
  content?: DoubaoContent[];
  status: string;
}

// 错误类型
export type ErrorType = 'AuthenticationError' | 'PermissionError' | 'RateLimitError' | 'ServerError' | 'TimeoutError' | 'UnknownError';
