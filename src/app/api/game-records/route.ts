import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/storage/database/postgres-client';

// 获取游戏记录列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少 userId 参数' },
        { status: 400 }
      );
    }

    // 验证用户是否存在
    const userResult = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取游戏记录
    const recordsResult = await query(
      'SELECT id, scenario, final_score, result, played_at FROM game_records WHERE user_id = $1 ORDER BY played_at DESC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      records: recordsResult.rows || [],
    });
  } catch (error) {
    console.error('Get game records error:', error);
    return NextResponse.json(
      { error: '获取游戏记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 保存游戏记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, scenario, finalScore, result } = body;

    // 验证输入
    if (!userId || !scenario || finalScore === undefined || !result) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!['victory', 'defeat'].includes(result)) {
      return NextResponse.json(
        { error: 'result 必须为 victory 或 defeat' },
        { status: 400 }
      );
    }

    // 验证用户是否存在
    const userResult = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 插入游戏记录
    const insertResult = await query(
      'INSERT INTO game_records (user_id, scenario, final_score, result) VALUES ($1, $2, $3, $4) RETURNING id, user_id, scenario, final_score, result, played_at',
      [userId, scenario, finalScore, result]
    );

    if (insertResult.rows.length === 0) {
      throw new Error('保存游戏记录失败: 无法创建记录');
    }

    return NextResponse.json({
      success: true,
      record: insertResult.rows[0],
    });
  } catch (error) {
    console.error('Save game record error:', error);
    return NextResponse.json(
      { error: '保存游戏记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
