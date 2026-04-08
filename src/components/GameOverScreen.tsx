'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, VolumeX, Heart, HeartCrack, PartyPopper } from 'lucide-react';

export default function GameOverScreen() {
  const { gameState, resetGame } = useGame();
  const { user } = useAuth();
  const { gender, voiceType, messages, won, affection, scenario } = gameState;

  // 结束对话
  const [endMessage, setEndMessage] = useState<string>('');
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 游戏记录保存状态
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'prompt'>('idle');

  // 生成结束对话并保存游戏记录
  useEffect(() => {
    const generateEndMessage = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gender,
            scenario: gameState.scenario?.title,
            messages,
            affection,
            step: gameState.step,
            isGameOver: true,
            won,
          }),
        });

        const data = await response.json();
        setEndMessage(data.partnerMessage);

        // 生成语音
        if (voiceType) {
          const ttsResponse = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: data.partnerMessage,
              voiceType,
              uid: `user-${Date.now()}`,
            }),
          });

          const ttsData = await ttsResponse.json();
          if (ttsData.audioUri) {
            setAudioUri(ttsData.audioUri);
          }
        }

        // 保存游戏记录
        if (user && scenario) {
          try {
            await fetch('/api/game-records', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                scenario: scenario.title,
                finalScore: affection,
                result: won ? 'victory' : 'defeat',
              }),
            });
            setSaveStatus('success');
          } catch (error) {
            console.error('Failed to save game record:', error);
          }
        } else {
          // 未登录用户，提示需要登录
          setSaveStatus('prompt');
        }
      } catch (error) {
        console.error('Failed to generate end message:', error);
        // 默认结束对话
        if (won) {
          setEndMessage('(破涕为笑)好吧好吧，看在你这么努力的份上，我就原谅你了~但是你要保证以后不能再这样了哦！');
        } else {
          setEndMessage('(冷漠地)够了，我不想再听你解释了。我们就这样吧。');
        }
      }
    };

    generateEndMessage();
  }, []);

  // 播放/暂停语音
  const toggleAudio = () => {
    if (!audioUri) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUri);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // 撒花动画
  const renderConfetti = () => {
    if (!won) return null;

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            {['🎉', '🎊', '💕', '💖', '✨'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      {renderConfetti()}
      
      <Card className="w-full max-w-lg shadow-xl relative">
        <CardContent className="pt-8 pb-6 px-6">
          {/* 图标 */}
          <div className="flex justify-center mb-4">
            {won ? (
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <PartyPopper className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <HeartCrack className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* 标题 */}
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-2 ${won ? 'text-pink-600' : 'text-gray-600'}`}>
              {won ? '恭喜通关！' : '游戏结束'}
            </h2>
            <p className="text-gray-600">
              {won
                ? '你成功把 TA 哄好了！'
                : affection < 0
                ? '好感度降到了冰点...'
                : '没能把 TA 哄好...'}
            </p>
          </div>

          {/* 结束对话 */}
          {endMessage && (
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <p className="text-gray-700 text-center whitespace-pre-wrap">{endMessage}</p>
              
              {/* 播放按钮 */}
              {audioUri && (
                <div className="flex justify-center mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    className="gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        暂停语音
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        播放语音
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 分享提示（仅胜利时） */}
          {won && (
            <p className="text-center text-sm text-gray-500 mb-4">
              通关了！分享给朋友试试？
            </p>
          )}

          {/* 游戏记录保存提示 */}
          {saveStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700 text-center">
                ✅ 您的游戏记录已经保存
              </p>
            </div>
          )}

          {saveStatus === 'prompt' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-700 text-center">
                💡 登录后可保存你的游戏记录
              </p>
            </div>
          )}

          {/* 重玩按钮 */}
          <Button
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            onClick={resetGame}
          >
            再玩一次
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
