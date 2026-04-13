import { NextResponse } from 'next/server';
import { query } from '@/storage/database/postgres-client';

// 获取文章列表
export async function GET() {
  try {
    const result = await query(
      'SELECT id, title, summary, tags, read_time, created_at FROM blog_posts ORDER BY created_at DESC'
    );

    return NextResponse.json({ posts: result.rows });
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
