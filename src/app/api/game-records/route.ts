import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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

    const client = getSupabaseClient();

    // 验证用户是否存在
    const { data: user, error: userError } = await client
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取游戏记录
    const { data, error } = await client
      .from('game_records')
      .select('id, scenario, final_score, result, played_at')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (error) {
      throw new Error(`获取游戏记录失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      records: data || [],
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

    const client = getSupabaseClient();

    // 验证用户是否存在
    const { data: user, error: userError } = await client
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 插入游戏记录
    const { data, error } = await client
      .from('game_records')
      .insert({
        user_id: userId,
        scenario,
        final_score: finalScore,
        result,
      })
      .select('id, user_id, scenario, final_score, result, played_at')
      .single();

    if (error) {
      throw new Error(`保存游戏记录失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      record: data,
    });
  } catch (error) {
    console.error('Save game record error:', error);
    return NextResponse.json(
      { error: '保存游戏记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
