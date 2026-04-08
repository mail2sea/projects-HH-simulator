'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Clock, Play } from 'lucide-react';

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取游戏记录
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchGameRecords = async () => {
      try {
        const response = await fetch(`/api/game-records?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setGameRecords(data.records);
        }
      } catch (error) {
        console.error('Failed to fetch game records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameRecords();
  }, [user, router]);

  // 计算统计数据
  const totalGames = gameRecords.length;
  const victoryCount = gameRecords.filter((r) => r.result === 'victory').length;
  const victoryRate = totalGames > 0 ? Math.round((victoryCount / totalGames) * 100) : 0;
  const averageScore = totalGames > 0
    ? Math.round(gameRecords.reduce((sum, r) => sum + r.final_score, 0) / totalGames)
    : 0;

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
      <div className="max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">个人中心</CardTitle>
            <CardDescription>
              欢迎回来，{user?.username}！这是你的游戏记录
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 统计数据卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">总游戏次数</p>
                  <p className="text-3xl font-bold text-gray-800">{totalGames}</p>
                </div>
                <Play className="w-10 h-10 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">通关率</p>
                  <p className="text-3xl font-bold text-gray-800">{victoryRate}%</p>
                </div>
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">平均好感度</p>
                  <p className="text-3xl font-bold text-gray-800">{averageScore}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 游戏记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle>游戏记录</CardTitle>
          </CardHeader>
          <CardContent>
            {gameRecords.length === 0 ? (
              <div className="text-center py-8">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有游戏记录</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                    开始游戏
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {gameRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{record.scenario}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            record.result === 'victory'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {record.result === 'victory' ? '通关' : '失败'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          好感度: {record.final_score}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(record.played_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
