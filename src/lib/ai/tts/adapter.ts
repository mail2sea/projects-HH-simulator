// TTS 适配器接口定义
export interface TTSRequest {
  text: string;
  voiceType: string;
  uid: string;
}

export interface TTSResponse {
  audioUri: string;
  audioSize: number;
}

export interface TTSAdapter {
  synthesize(request: TTSRequest): Promise<TTSResponse>;
}

export interface TTSError extends Error {
  code?: number;
  type?: string;
  provider?: string;
}
