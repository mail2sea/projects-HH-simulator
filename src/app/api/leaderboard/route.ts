import { NextResponse } from 'next/server';
import { query } from '@/storage/database/postgres-client';

// 获取排行榜
export async function GET() {
  try {
    // 使用原生 SQL 查询获取每个用户的最高分记录，前 20 名
    const result = await query(`
      WITH user_best_scores AS (
        SELECT 
          user_id, 
          MAX(final_score) as max_score
        FROM game_records
        GROUP BY user_id
      ),
      user_best_records AS (
        SELECT 
          gr.id, 
          gr.user_id, 
          gr.final_score, 
          gr.played_at,
          u.username
        FROM game_records gr
        JOIN users u ON gr.user_id = u.id
        JOIN user_best_scores ubs ON gr.user_id = ubs.user_id AND gr.final_score = ubs.max_score
        ORDER BY gr.final_score DESC, gr.played_at ASC
        LIMIT 20
      )
      SELECT 
        ROW_NUMBER() OVER (ORDER BY final_score DESC, played_at ASC) as rank,
        id,
        user_id,
        username,
        final_score,
        played_at
      FROM user_best_records
      ORDER BY rank
    `);

    return NextResponse.json({
      success: true,
      leaderboard: result.rows,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: '获取排行榜失败，请稍后重试' },
      { status: 500 }
    );
  }
}
