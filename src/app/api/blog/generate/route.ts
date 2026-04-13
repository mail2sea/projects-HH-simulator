import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { query } from '@/storage/database/postgres-client';

// 生成新文章
export async function POST(request: NextRequest) {
  try {
    // 初始化 LLM 客户端
    const config = new Config({ timeout: 30000 });
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 构建提示词
    const systemPrompt = `你是一个恋爱沟通技巧专家。请写一篇关于恋爱沟通技巧的文章。

要求：
1. 风格轻松幽默，让人读起来不枯燥
2. 内容实用，有具体的建议和方法
3. 字数在 300-500 字之间
4. 使用 Markdown 格式，适当使用加粗、列表等格式
5. 文章要有一个吸引人的标题

返回格式必须严格按照以下 JSON 格式，不要返回其他任何内容：
{
  "title": "文章标题",
  "summary": "文章摘要（1-2句话）",
  "content": "文章正文"
}`;

    // 调用 LLM 生成文章
    const response = await client.invoke(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '请写一篇关于恋爱沟通技巧的文章' },
      ],
      {
        temperature: 0.9,
      }
    );

    // 解析响应
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

    const articleData = JSON.parse(content);

    // 保存到数据库
    const insertResult = await query(
      'INSERT INTO blog_posts (title, summary, content, tags, read_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        articleData.title,
        articleData.summary,
        articleData.content,
        JSON.stringify(['恋爱技巧', '沟通']),
        Math.ceil(articleData.content.length / 150),
      ]
    );

    if (insertResult.rows.length === 0) {
      throw new Error('保存失败: 无法创建文章');
    }

    return NextResponse.json({ post: insertResult.rows[0] });
  } catch (error) {
    console.error('Failed to generate article:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}
