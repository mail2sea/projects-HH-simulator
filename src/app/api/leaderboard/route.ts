import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取排行榜
export async function GET() {
  try {
    const client = getSupabaseClient();

    // 获取每个用户的最高分记录，前 20 名
    const { data, error } = await client.rpc('get_leaderboard', {
      limit_count: 20,
    });

    if (error) {
      // 如果函数不存在，使用备选方案
      console.log('RPC function not found, using fallback query');

      const { data: fallbackData, error: fallbackError } = await client
        .from('game_records')
        .select(`
          id,
          user_id,
          final_score,
          played_at,
          users!inner (
            username
          )
        `)
        .order('final_score', { ascending: false })
        .order('played_at', { ascending: true })
        .limit(100);

      if (fallbackError) {
        throw new Error(`获取排行榜失败: ${fallbackError.message}`);
      }

      // 去重，每个用户只保留最高分记录
      const userBestRecords = new Map();

      for (const record of fallbackData || []) {
        const existing = userBestRecords.get(record.user_id);
        if (!existing || record.final_score > existing.final_score) {
          userBestRecords.set(record.user_id, record);
        }
      }

      // 按分数降序排序并取前 20 名
      const sortedRecords = Array.from(userBestRecords.values())
        .sort((a, b) => b.final_score - a.final_score)
        .slice(0, 20);

      return NextResponse.json({
        success: true,
        leaderboard: sortedRecords.map((record, index) => ({
          rank: index + 1,
          id: record.id,
          user_id: record.user_id,
          username: (record.users as { username: string })?.username || '未知用户',
          final_score: record.final_score,
          played_at: record.played_at,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      leaderboard: data,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: '获取排行榜失败，请稍后重试' },
      { status: 500 }
    );
  }
}
