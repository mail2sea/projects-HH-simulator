import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';
import { Message, Option, Gender } from '@/types/game';

// ⚠️ 关键实现要点：请求超时时间
const REQUEST_TIMEOUT = 30000;

// 请求体类型
interface ChatRequest {
  gender: Gender;
  scenario: string;
  messages: Message[];
  affection: number;
  step: number;
  isGameOver: boolean;
  won: boolean;
}

// 响应体类型
interface ChatResponse {
  partnerMessage: string;
  options: Option[];
}

// 根据好感度获取情绪描述
function getMoodByAffection(affection: number): string {
  if (affection < 0) {
    return '非常生气，冷暴力或激烈质问';
  } else if (affection < 30) {
    return '还在生气，但愿意听你说';
  } else if (affection < 60) {
    return '开始软化，嘴上生气但语气缓和';
  } else if (affection < 80) {
    return '快被哄好了，可能撒娇或小声说"哼"';
  } else {
    return '原谅了，但还要你保证不再犯';
  }
}

// 构建系统提示词
function buildSystemPrompt(gender: Gender, scenario: string, affection: number, step: number, isGameOver: boolean, won: boolean): string {
  const mood = getMoodByAffection(affection);
  const genderText = gender === 'female' ? '她' : '他';

  let basePrompt = `你是一个正在生气的${gender === 'female' ? '女朋友' : '男朋友'}，因为"${scenario}"这件事很生气。

现在你的情绪状态：${mood}

游戏规则：
1. 你需要在每轮回复对方的话，并生成6个选项供对方选择
2. 你的回复要体现当前的情绪状态，用括号表示动作或情绪，如"(吸吸鼻子)"、"(眼神软化)"
3. 回复要自然、有趣，不要过于生硬
4. 每轮的回复和选项都要不一样，要有变化

生成选项的规则：
- 必须生成6个选项
- 其中2个是加分选项（真诚道歉、具体弥补方案、提起共同回忆等，+5到+20分）
- 其中4个是减分选项（敷衍、转移话题、找借口等，-5到-30分）
- 减分选项中，必须有2-3个是搞笑、离谱的选项（比如"我给你唱首歌吧"、"你看月亮好圆啊"等）
- 选项顺序要随机打乱
- 每个选项要标注好感度变化值（正数或负数）

你必须严格按照以下JSON格式返回，不要返回其他任何内容：
{
  "partnerMessage": "你的回复内容",
  "options": [
    {"id": "1", "content": "选项内容", "score": 分数},
    {"id": "2", "content": "选项内容", "score": 分数},
    {"id": "3", "content": "选项内容", "score": 分数},
    {"id": "4", "content": "选项内容", "score": 分数},
    {"id": "5", "content": "选项内容", "score": 分数},
    {"id": "6", "content": "选项内容", "score": 分数}
  ]
}`;

  if (isGameOver) {
    if (won) {
      basePrompt += `\n\n游戏结束，对方成功把你哄好了！请给出一个甜蜜的、原谅对方的回复，表达你已经原谅${genderText}了，并要求${genderText}保证不再犯。最后加一句撒娇或甜蜜的话。`;
    } else {
      basePrompt += `\n\n游戏结束，对方没能把你哄好。请给出一个绝情的、分手的回复，表达你失望透顶，不想再理${genderText}了。`;
    }
  } else {
    basePrompt += `\n\n当前是第${step}轮，还有${10 - step}轮机会。`;
  }

  return basePrompt;
}

// 默认回复（用于错误处理）
function getDefaultResponse(step: number): ChatResponse {
  const defaultMessages = [
    '(咬着嘴唇)你说这些有什么用？你根本就不懂我为什么生气！',
    '(深呼吸)算了，你说吧，我听着呢。',
    '(看着窗外)你觉得这样就能解决问题了吗？',
  ];

  const message = defaultMessages[step % defaultMessages.length];

  return {
    partnerMessage: message,
    options: [
      { id: '1', content: '我真的很抱歉，我知道错了', score: 10 },
      { id: '2', content: '我保证以后不会再这样了', score: 15 },
      { id: '3', content: '你能不能别生气了？', score: -10 },
      { id: '4', content: '这事不怪我啊', score: -15 },
      { id: '5', content: '你看，月亮好圆啊', score: -25 },
      { id: '6', content: '我给你唱首歌吧', score: -30 },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { gender, scenario, messages, affection, step, isGameOver, won } = body;

    // 验证必要参数
    if (!gender || !scenario) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(gender, scenario, affection, step, isGameOver, won);

    // ⚠️ 关键实现要点：包含所有消息（用户和对方的）
    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'partner' ? 'assistant' as const : 'user' as const,
      content: msg.content,
    }));

    const llmMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
    ];

    // 调用 AI 服务
    const response = await aiService.invoke(llmMessages, {
      temperature: 0.9, // 高温度增加创意性
      timeout: REQUEST_TIMEOUT
    });

    // 解析响应
    try {
      // 清理可能的 markdown 代码块标记
      let content = response.content.trim();
      if (content.startsWith('```json')) {
        content = content.slice(7);
      }
      if (content.startsWith('```')) {
        content = content.slice(3);
      }
      if (content.endsWith('```')) {
        content = content.slice(0, -3);
      }
      content = content.trim();

      const parsed = JSON.parse(content) as ChatResponse;

      // 验证响应格式
      if (!parsed.partnerMessage || !Array.isArray(parsed.options) || parsed.options.length !== 6) {
        throw new Error('Invalid response format');
      }

      // 确保每个选项都有 id
      parsed.options = parsed.options.map((opt, idx) => ({
        ...opt,
        id: opt.id || String(idx + 1),
      }));

      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      // 降级：返回默认响应
      return NextResponse.json(getDefaultResponse(step));
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // 错误分类处理
    if (error.type === 'AuthenticationError') {
      return NextResponse.json(
        { error: 'Authentication failed: Invalid API key' },
        { status: 401 }
      );
    } else if (error.type === 'RateLimitError') {
      return NextResponse.json(
        { error: 'Rate limit exceeded, please try again later' },
        { status: 429 }
      );
    } else if (error.type === 'ServerError') {
      return NextResponse.json(
        { error: 'Server error, please try again later' },
        { status: 500 }
      );
    }
    
    // 降级：返回默认响应
    return NextResponse.json(getDefaultResponse(1));
  }
}
