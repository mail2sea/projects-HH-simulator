'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { SCENARIOS, VOICE_CONFIGS, Gender, VoiceType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Trophy } from 'lucide-react';

export default function StartScreen() {
  const router = useRouter();
  const { gameState, setGender, setScenario, setVoiceType, startGame } = useGame();
  const { gender, scenario, voiceType } = gameState;

  // 获取当前性别可用的语音
  const availableVoices = Object.entries(VOICE_CONFIGS).filter(
    ([, config]) => config.gender === gender
  );

  // 检查是否可以开始游戏
  const canStart = gender && scenario && voiceType;

  // 跳转到博客列表页
  const goToBlog = () => {
    router.push('/blog');
  };

  // 跳转到排行榜页面
  const goToLeaderboard = () => {
    router.push('/leaderboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            哄哄模拟器
          </CardTitle>
          <CardDescription className="text-base">
            AI 扮演生气的对象，看你在 10 轮内能不能把 TA 哄好
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 选择性别 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">选择对方的性别</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={gender === 'female' ? 'default' : 'outline'}
                className={`h-16 text-lg ${gender === 'female' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                onClick={() => {
                  setGender('female');
                  // 重置语音选择
                  if (voiceType && VOICE_CONFIGS[voiceType].gender !== 'female') {
                    setVoiceType('gentle-female' as VoiceType);
                  }
                }}
              >
                👧 女生
              </Button>
              <Button
                variant={gender === 'male' ? 'default' : 'outline'}
                className={`h-16 text-lg ${gender === 'male' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                onClick={() => {
                  setGender('male');
                  // 重置语音选择
                  if (voiceType && VOICE_CONFIGS[voiceType].gender !== 'male') {
                    setVoiceType('deep-male' as VoiceType);
                  }
                }}
              >
                👦 男生
              </Button>
            </div>
          </div>

          {/* 选择场景 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">选择一个场景</label>
            <div className="space-y-2">
              {SCENARIOS.map((s) => (
                <Button
                  key={s.id}
                  variant={scenario?.id === s.id ? 'default' : 'outline'}
                  className={`w-full h-auto py-3 justify-start text-left ${
                    scenario?.id === s.id ? 'bg-purple-500 hover:bg-purple-600' : ''
                  }`}
                  onClick={() => setScenario(s)}
                >
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-xs opacity-80 mt-1">{s.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* 选择语音 */}
          {gender && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">选择语音类型</label>
              <div className="grid grid-cols-3 gap-2">
                {availableVoices.map(([key, config]) => (
                  <Button
                    key={key}
                    variant={voiceType === key ? 'default' : 'outline'}
                    className={`h-12 ${
                      voiceType === key
                        ? gender === 'female'
                          ? 'bg-pink-500 hover:bg-pink-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                        : ''
                    }`}
                    onClick={() => setVoiceType(key as VoiceType)}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 恋爱攻略按钮 */}
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 border-pink-300 hover:bg-pink-50 hover:border-pink-400 gap-2"
            onClick={goToBlog}
          >
            <BookOpen className="w-5 h-5" />
            恋爱攻略
          </Button>

          {/* 排行榜按钮 */}
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400 gap-2"
            onClick={goToLeaderboard}
          >
            <Trophy className="w-5 h-5" />
            排行榜
          </Button>

          {/* 开始按钮 */}
          <Button
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            disabled={!canStart}
            onClick={startGame}
          >
            开始游戏
          </Button>

          {/* 提示 */}
          {!canStart && (
            <p className="text-sm text-center text-gray-500">
              请先选择性别、场景和语音类型
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
