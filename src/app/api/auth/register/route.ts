import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/storage/database/postgres-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turnstileToken, username, password } = body;

    // 去 Cloudflare 验证 Turnstile token
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const verifyResult = await verifyResponse.json();

    // 如果验证失败，直接拒绝
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: '人机验证失败，请重试' },
        { status: 403 }
      );
    }

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: '用户名长度必须在 3-50 个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于 6 个字符' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUserResult = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const insertResult = await query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );

    if (insertResult.rows.length === 0) {
      throw new Error('注册失败: 无法创建用户');
    }

    return NextResponse.json({
      success: true,
      user: insertResult.rows[0],
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}