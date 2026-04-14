import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { TTSAdapter, TTSRequest, TTSResponse, TTSError } from '../adapter';
import { VOICE_CONFIGS } from '@/types/game';
import { cleanTextForSpeech, logTTSRequest, logTTSResponse, logTTSError } from '../utils';

export class CozeTTSAdapter implements TTSAdapter {
  private timeout: number;

  constructor(timeout: number = 15000) {
    this.timeout = timeout;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const startTime = Date.now();
    logTTSRequest(request, 'coze');

    try {
      const { text, voiceType, uid } = request;

      // 验证必要参数
      if (!text || !voiceType || !uid) {
        throw new Error('Missing required parameters');
      }

      // 获取语音配置
      const voiceConfig = VOICE_CONFIGS[voiceType as keyof typeof VOICE_CONFIGS];
      if (!voiceConfig) {
        throw new Error('Invalid voice type');
      }

      // 清理文本
      const cleanText = cleanTextForSpeech(text);

      // 如果清理后文本为空，返回错误
      if (!cleanText) {
        throw new Error('Text is empty after cleaning');
      }

      // 初始化 TTS 客户端
      const config = new Config({ timeout: this.timeout });
      const client = new TTSClient(config);

      // 调用 TTS
      const response = await client.synthesize({
        uid,
        text: cleanText,
        speaker: voiceConfig.speaker,
        audioFormat: 'mp3',
        sampleRate: 24000,
      });

      const result: TTSResponse = {
        audioUri: response.audioUri,
        audioSize: response.audioSize,
      };

      const duration = Date.now() - startTime;
      logTTSResponse(result, 'coze', duration);

      return result;
    } catch (error) {
      logTTSError(error, 'coze');
      const ttsError: TTSError = {
        ...(error as Error),
        provider: 'coze',
      };
      throw ttsError;
    }
  }
}
