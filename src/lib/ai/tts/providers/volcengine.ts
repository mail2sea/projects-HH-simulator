import https from 'https';
import { TTSAdapter, TTSRequest, TTSResponse, TTSError } from '../adapter';
import { cleanTextForSpeech, logTTSRequest, logTTSResponse, logTTSError } from '../utils';

// 语音类型映射
const VOICE_MAPPING: Record<string, string> = {
  'gentle-female': 'zh_female_shuangkuaisisi_moon_bigtts',
  'cool-female': 'zh_female_yanxi',
  'cute-female': 'zh_female_xiaoyan',
  'deep-male': 'zh_male_zhiming',
  'gentle-male': 'zh_male_ruoxi',
};

export class VolcEngineTTSAdapter implements TTSAdapter {
  private appId: string;
  private accessToken: string;
  private secretKey: string;
  private timeout: number;

  constructor(appId: string, accessToken: string, secretKey: string, timeout: number = 15000) {
    this.appId = appId;
    this.accessToken = accessToken;
    this.secretKey = secretKey;
    this.timeout = timeout;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const startTime = Date.now();
    logTTSRequest(request, 'volcengine');

    return new Promise((resolve, reject) => {
      try {
        const { text, voiceType, uid } = request;

        if (!text || !voiceType || !uid) {
          throw new Error('Missing required parameters');
        }

        const cleanText = cleanTextForSpeech(text);

        if (!cleanText) {
          throw new Error('Text is empty after cleaning');
        }

        const mappedVoice = VOICE_MAPPING[voiceType];
        if (!mappedVoice) {
          throw new Error('Invalid voice type');
        }

        const requestData = {
          user: {
            uid: uid,
          },
          event: 100,
          req_params: {
            text: cleanText,
            speaker: mappedVoice,
            audio_params: {
              format: 'mp3',
              sample_rate: 24000,
            },
          },
        };

        const options = {
          hostname: 'openspeech.bytedance.com',
          port: 443,
          path: '/api/v3/tts/unidirectional',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-App-Key': this.appId,
            'X-Api-Access-Key': this.accessToken,
            'X-Api-Resource-Id': 'seed-tts-1.0',
          },
          timeout: this.timeout,
        };

        const req = https.request(options, (res) => {
          let data: Buffer[] = [];
          let audioBuffer: Buffer = Buffer.alloc(0);

          res.on('data', (chunk) => {
            data.push(chunk);
          });

          res.on('end', () => {
            const buffer = Buffer.concat(data);
            
            if (res.statusCode !== 200) {
              const error: TTSError = {
                message: `HTTP ${res.statusCode}`,
                code: res.statusCode,
                type: 'api_error',
                provider: 'volcengine',
                name: 'APIError',
              };
              logTTSError(error, 'volcengine');
              reject(error);
              return;
            }

            try {
              const responseText = buffer.toString('utf-8');
              const lines = responseText.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                  const json = JSON.parse(line);
                  if (json.code === 0 && json.data && typeof json.data === 'string') {
                    const audioData = Buffer.from(json.data, 'base64');
                    audioBuffer = Buffer.concat([audioBuffer, audioData]);
                  } else if (json.code === 20000000) {
                    break;
                  }
                } catch (e) {
                  console.log('[VolcEngine] Failed to parse line:', line);
                }
              }

              if (audioBuffer.length === 0) {
                const error: TTSError = {
                  message: 'No audio data received',
                  code: 500,
                  type: 'api_error',
                  provider: 'volcengine',
                  name: 'APIError',
                };
                logTTSError(error, 'volcengine');
                reject(error);
                return;
              }

              const audioUri = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
              const audioSize = audioBuffer.length;

              const result: TTSResponse = {
                audioUri,
                audioSize,
              };

              const duration = Date.now() - startTime;
              logTTSResponse(result, 'volcengine', duration);

              resolve(result);
            } catch (error) {
              logTTSError(error, 'volcengine');
              const ttsError: TTSError = {
                ...(error as Error),
                provider: 'volcengine',
              };
              reject(ttsError);
            }
          });
        });

        req.on('error', (error) => {
          logTTSError(error, 'volcengine');
          const ttsError: TTSError = {
            ...(error as Error),
            provider: 'volcengine',
          };
          reject(ttsError);
        });

        req.on('timeout', () => {
          req.destroy();
          const error: TTSError = {
            message: 'Request timeout',
            code: 504,
            type: 'timeout',
            provider: 'volcengine',
            name: 'TimeoutError',
          };
          logTTSError(error, 'volcengine');
          reject(error);
        });

        req.write(JSON.stringify(requestData));
        req.end();

      } catch (error) {
        logTTSError(error, 'volcengine');
        const ttsError: TTSError = {
          ...(error as Error),
          provider: 'volcengine',
        };
        reject(ttsError);
      }
    });
  }
}
