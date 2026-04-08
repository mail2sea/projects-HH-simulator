import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { VOICE_CONFIGS, VoiceType } from '@/types/game';

// ⚠️ 关键实现要点：请求超时时间
const REQUEST_TIMEOUT = 15000;

// 请求体类型
interface TTSRequest {
  text: string;
  voiceType: VoiceType;
  uid: string;
}

// 响应体类型
interface TTSResponse {
  audioUri: string;
  audioSize: number;
}

// ⚠️ 关键实现要点：清理文本中的动作描述和情绪提示
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/（[^）]*）/g, '')  // 去掉中文括号
    .replace(/\([^)]*\)/g, '')   // 去掉英文括号
    .replace(/\[[^\]]*\]/g, '')  // 去掉中括号
    .replace(/[「」『』]/g, '')  // 去掉其他标点
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, voiceType, uid } = body;

    // 验证必要参数
    if (!text || !voiceType || !uid) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 获取语音配置
    const voiceConfig = VOICE_CONFIGS[voiceType];
    if (!voiceConfig) {
      return NextResponse.json(
        { error: 'Invalid voice type' },
        { status: 400 }
      );
    }

    // ⚠️ 关键实现要点：清理文本
    const cleanText = cleanTextForSpeech(text);

    // 如果清理后文本为空，返回错误
    if (!cleanText) {
      return NextResponse.json(
        { error: 'Text is empty after cleaning' },
        { status: 400 }
      );
    }

    // 初始化 TTS 客户端
    const config = new Config({ timeout: REQUEST_TIMEOUT });
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new TTSClient(config, customHeaders);

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

    return NextResponse.json(result);
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}
