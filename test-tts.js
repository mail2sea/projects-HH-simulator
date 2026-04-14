const axios = require('axios');

// 测试TTS API
async function testTTS() {
  try {
    console.log('Testing TTS API...');
    
    const response = await axios.post('http://localhost:5000/api/tts', {
      text: '你好，这是一个测试语音',
      voiceType: 'gentle-female',
      uid: 'test-123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('TTS API response:', response.data);
    console.log('Test successful!');
  } catch (error) {
    console.error('TTS API error:', error.response ? error.response.data : error.message);
  }
}

testTTS();
