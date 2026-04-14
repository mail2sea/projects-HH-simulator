// 必须在最开始加载环境变量
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { ttsService } from './src/lib/ai/tts';

// 测试TTS服务
async function testTTS() {
  try {
    console.log('=== Testing TTS service ===');
    console.log('Test started at:', new Date().toISOString());
    
    const startTime = Date.now();
    
    console.log('Sending TTS request...');
    console.log('Request data:', {
      text: '你好，这是一个测试语音',
      voiceType: 'gentle-female',
      uid: 'test-123'
    });
    
    const result = await ttsService.synthesize({
      text: '你好，这是一个测试语音',
      voiceType: 'gentle-female',
      uid: 'test-123'
    });
    
    const endTime = Date.now();
    
    console.log('=== Test Result ===');
    console.log('Response received in:', endTime - startTime, 'ms');
    console.log('Audio size:', result.audioSize, 'bytes');
    console.log('Test successful!');
  } catch (error: any) {
    console.error('=== Test Error ===');
    console.error('TTS service error:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
  }
}

testTTS();
