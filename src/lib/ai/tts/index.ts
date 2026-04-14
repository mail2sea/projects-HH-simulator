import { TTSAdapter, TTSRequest, TTSResponse } from './adapter';
import { CozeTTSAdapter } from './providers/coze';
import { VolcEngineTTSAdapter } from './providers/volcengine';

// TTS 适配器工厂
class TTSAdapterFactory {
  private static instance: TTSAdapter;

  static getAdapter(): TTSAdapter {
    if (!this.instance) {
      this.instance = this.createAdapter();
    }
    return this.instance;
  }

  private static createAdapter(): TTSAdapter {
    // 在运行时读取环境变量
    const TTS_PROVIDER = process.env.TTS_PROVIDER || 'coze';
    const TTS_TIMEOUT = parseInt(process.env.TTS_TIMEOUT || '15000', 10);
    const VOLCENGINE_APP_ID = process.env.VOLCENGINE_APP_ID;
    const VOLCENGINE_ACCESS_TOKEN = process.env.VOLCENGINE_ACCESS_TOKEN;
    const VOLCENGINE_SECRET_KEY = process.env.VOLCENGINE_SECRET_KEY;

    // 调试日志
    console.log('=== TTS Configuration ===');
    console.log('TTS_PROVIDER:', TTS_PROVIDER);
    console.log('TTS_TIMEOUT:', TTS_TIMEOUT);
    console.log('VOLCENGINE_APP_ID:', VOLCENGINE_APP_ID ? 'set' : 'not set');
    console.log('VOLCENGINE_ACCESS_TOKEN:', VOLCENGINE_ACCESS_TOKEN ? 'set' : 'not set');
    console.log('VOLCENGINE_SECRET_KEY:', VOLCENGINE_SECRET_KEY ? 'set' : 'not set');

    switch (TTS_PROVIDER) {
      case 'volcengine':
        if (!VOLCENGINE_APP_ID || !VOLCENGINE_ACCESS_TOKEN || !VOLCENGINE_SECRET_KEY) {
          console.warn('VolcEngine configuration missing, falling back to Coze');
          return new CozeTTSAdapter(TTS_TIMEOUT);
        }
        return new VolcEngineTTSAdapter(
          VOLCENGINE_APP_ID,
          VOLCENGINE_ACCESS_TOKEN,
          VOLCENGINE_SECRET_KEY,
          TTS_TIMEOUT
        );
      case 'coze':
      default:
        return new CozeTTSAdapter(TTS_TIMEOUT);
    }
  }
}

// 导出TTS服务
export class TTSService {
  private adapter: TTSAdapter;

  constructor() {
    this.adapter = TTSAdapterFactory.getAdapter();
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    try {
      return await this.adapter.synthesize(request);
    } catch (error) {
      console.error('TTS service error:', error);
      // 回退到Coze适配器
      console.warn('Falling back to Coze TTS');
      const TTS_TIMEOUT = parseInt(process.env.TTS_TIMEOUT || '15000', 10);
      const cozeAdapter = new CozeTTSAdapter(TTS_TIMEOUT);
      return await cozeAdapter.synthesize(request);
    }
  }
}

// 导出默认实例
export const ttsService = new TTSService();
