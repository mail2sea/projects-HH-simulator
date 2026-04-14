import { NextRequest, NextResponse } from 'next/server';
import { ttsService } from '@/lib/ai/tts';
import { VoiceType } from '@/types/game';

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

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    console.log('TTS request started');

    const body: TTSRequest = await request.json();
    const { text, voiceType, uid } = body;

    // 验证必要参数
    if (!text || !voiceType || !uid) {
      console.log('TTS request failed: Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 调用 TTS 服务
    const result: TTSResponse = await ttsService.synthesize({
      text,
      voiceType,
      uid,
    });

    const endTime = Date.now();
    console.log(`TTS request completed in ${endTime - startTime}ms`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('TTS API error:', error);
    
    // 错误分类处理
    let statusCode = 500;
    let errorMessage = 'Failed to synthesize speech';

    if (error.code === 401) {
      statusCode = 401;
      errorMessage = 'Authentication failed';
    } else if (error.code === 403) {
      statusCode = 403;
      errorMessage = 'Access denied';
    } else if (error.code === 429) {
      statusCode = 429;
      errorMessage = 'Too many requests';
    } else if (error.code === 504) {
      statusCode = 504;
      errorMessage = 'Request timeout';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
