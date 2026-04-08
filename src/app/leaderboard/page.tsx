'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: number;
  user_id: number;
  username: string;
  final_score: number;
  played_at: string;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取排行榜
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();

        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-amber-600" />;
    return null;
  };

  // 获取排名样式
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-300';
    if (rank === 2) return 'bg-gray-50 border-gray-300';
    if (rank === 3) return 'bg-amber-50 border-amber-300';
    return 'bg-white border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 标题卡片 */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl">哄哄排行榜</CardTitle>
            <CardDescription>
              感情最深的哄哄大师 TOP 20
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 排行榜列表 */}
        <Card>
          <CardContent className="pt-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有排行数据</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                    开始游戏
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => {
                  const isCurrentUser = user && entry.user_id === user.id;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-400 shadow-md'
                          : getRankStyle(entry.rank)
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* 排名 */}
                        <div className="flex items-center justify-center w-16 h-16">
                          {getRankIcon(entry.rank)}
                          {!getRankIcon(entry.rank) && (
                            <span className="text-2xl font-bold text-gray-600">
                              #{entry.rank}
                            </span>
                          )}
                        </div>

                        {/* 用户信息 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {entry.username}
                            </span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                                你
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(entry.played_at)}
                          </div>
                        </div>
                      </div>

                      {/* 分数 */}
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                          {entry.final_score}
                        </div>
                        <div className="text-xs text-gray-500">好感度</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 说明 */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>说明：</strong>排行榜显示每位用户的最高好感度分数。只有登录用户的成绩才会被记录和上榜。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 返回按钮 */}
        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
