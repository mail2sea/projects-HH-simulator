// TTS 工具函数

// 错误类型定义
export type TTS_ERROR_TYPE = 'authentication' | 'authorization' | 'rate_limit' | 'timeout' | 'server' | 'client' | 'unknown';

// 错误分类函数
export function categorizeError(error: any): { type: TTS_ERROR_TYPE; code: number } {
  if (error.code === 401) {
    return { type: 'authentication', code: 401 };
  } else if (error.code === 403) {
    return { type: 'authorization', code: 403 };
  } else if (error.code === 429) {
    return { type: 'rate_limit', code: 429 };
  } else if (error.code === 504 || error.message?.includes('timeout')) {
    return { type: 'timeout', code: 504 };
  } else if (error.code >= 500) {
    return { type: 'server', code: 500 };
  } else if (error.code >= 400) {
    return { type: 'client', code: error.code };
  } else {
    return { type: 'unknown', code: 500 };
  }
}

// 格式化错误信息
export function formatErrorMessage(error: any): string {
  const errorInfo = categorizeError(error);
  
  switch (errorInfo.type) {
    case 'authentication':
      return 'Authentication failed: Invalid API credentials';
    case 'authorization':
      return 'Authorization failed: Access denied';
    case 'rate_limit':
      return 'Rate limit exceeded: Please try again later';
    case 'timeout':
      return 'Request timeout: The server took too long to respond';
    case 'server':
      return 'Server error: Please try again later';
    case 'client':
      return `Client error: ${error.message || 'Invalid request'}`;
    default:
      return `Unknown error: ${error.message || 'An unexpected error occurred'}`;
  }
}

// 日志记录函数
export function logTTSRequest(request: any, provider: string): void {
  console.log(`[TTS] Request started - Provider: ${provider}`);
  console.log(`[TTS] Request data:`, {
    text: request.text?.substring(0, 50) + (request.text?.length > 50 ? '...' : ''),
    voiceType: request.voiceType,
    uid: request.uid,
  });
}

export function logTTSResponse(response: any, provider: string, duration: number): void {
  console.log(`[TTS] Request completed - Provider: ${provider}`);
  console.log(`[TTS] Response data:`, {
    audioSize: response.audioSize,
    duration: `${duration}ms`,
  });
}

export function logTTSError(error: any, provider: string): void {
  const errorInfo = categorizeError(error);
  console.error(`[TTS] Request failed - Provider: ${provider}`);
  console.error(`[TTS] Error:`, {
    type: errorInfo.type,
    code: errorInfo.code,
    message: error.message,
    provider: error.provider,
  });
}

// 文本清理函数（从适配器中移到工具文件）
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/（[^）]*）/g, '')  // 去掉中文括号
    .replace(/\([^)]*\)/g, '')   // 去掉英文括号
    .replace(/\[[^\]]*\]/g, '')  // 去掉中括号
    .replace(/[「」『』]/g, '')  // 去掉其他标点
    .trim();
}
