'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { MAX_ROUNDS, Message, Option, VOICE_CONFIGS } from '@/types/game';
import AffectionBar from './AffectionBar';
import LoadingAnimation from './LoadingAnimation';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

export default function GameScreen() {
  const { gameState, selectOption, addPartnerMessage, setGameOver, setLoading, isLoading } = useGame();
  const { step, affection, gender, scenario, voiceType, messages, currentOptions, gameOver, won } = gameState;

  // 音频相关状态
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioMessageId, setCurrentAudioMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 防重复生成
  const isGeneratingRef = useRef(false);
  const lastGeneratedStep = useRef(0);

  // 对话区域滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 生成下一轮对话
  useEffect(() => {
    // 如果游戏结束或正在生成，直接返回
    if (gameOver) return;

    // 如果当前轮次已经生成过，直接返回
    if (step === 0 || step === lastGeneratedStep.current) return;

    // 如果已经有选项了，直接返回
    if (currentOptions.length > 0) return;

    // 防止重复生成
    if (isGeneratingRef.current || isLoading) return;

    const generateNextRound = async () => {
      isGeneratingRef.current = true;
      setLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gender,
            scenario: scenario?.title,
            messages,
            affection,
            step,
            isGameOver: false,
            won: false,
          }),
        });

        const data = await response.json();
        addPartnerMessage(data.partnerMessage, data.options);
        lastGeneratedStep.current = step;
      } catch (error) {
        console.error('Failed to generate next round:', error);
      } finally {
        setLoading(false);
        isGeneratingRef.current = false;
      }
    };

    generateNextRound();
  }, [step, currentOptions.length, gameOver, lastGeneratedStep]);

  // 生成语音
  useEffect(() => {
    // 如果没有语音类型或游戏结束，直接返回
    if (!voiceType || gameOver) return;

    // 获取最后一条 partner 消息
    const partnerMessages = messages.filter(m => m.role === 'partner');
    const lastPartnerMessage = partnerMessages[partnerMessages.length - 1];

    // 如果没有 partner 消息，直接返回
    if (!lastPartnerMessage) return;

    // ⚠️ 关键实现要点：跟踪消息 ID，每轮生成新语音
    const partnerMessageCount = partnerMessages.length;
    const messageId = `${lastPartnerMessage.role}-${lastPartnerMessage.content}-${partnerMessageCount}`;

    // 检测新消息
    if (currentAudioMessageId !== messageId) {
      // 清除旧语音
      setAudioUri(undefined);
      setCurrentAudioMessageId(messageId);

      // 生成新语音
      const generateVoice = async () => {
        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: lastPartnerMessage.content,
              voiceType,
              uid: `user-${Date.now()}`,
            }),
          });

          const data = await response.json();
          if (data.audioUri) {
            setAudioUri(data.audioUri);
          }
        } catch (error) {
          console.error('Failed to generate voice:', error);
        }
      };

      generateVoice();
    }
  }, [messages, voiceType, gameOver, currentAudioMessageId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 当audioUri更新时，更新音频对象的src
  useEffect(() => {
    if (audioUri && audioRef.current) {
      audioRef.current.src = audioUri;
      // 重置播放状态
      setIsPlaying(false);
    }
  }, [audioUri]);

  // 处理选择选项
  const handleSelectOption = async (option: Option) => {
    // 重置语音
    setAudioUri(undefined);
    setCurrentAudioMessageId(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    selectOption(option);
  };

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

  // 渲染消息气泡
  const renderMessage = (message: Message, index: number) => {
    const isPartner = message.role === 'partner';
    const isLastPartnerMessage = isPartner && index === messages.length - 1;

    return (
      <div
        key={index}
        className={`flex items-start gap-2 ${isPartner ? 'justify-start' : 'justify-end'}`}
      >
        {/* 对方头像 */}
        {isPartner && (
          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            TA
          </div>
        )}

        {/* 消息气泡 */}
        <div className="flex flex-col gap-1">
          <div
            className={`max-w-xs md:max-w-md px-4 py-2 ${
              isPartner
                ? 'bg-white rounded-2xl rounded-bl-md shadow-sm'
                : 'bg-blue-500 text-white rounded-2xl rounded-br-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* 播放按钮（仅最后一条 partner 消息） */}
          {isLastPartnerMessage && audioUri && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit h-8 px-2"
              onClick={toggleAudio}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="ml-1 text-xs">{isPlaying ? '暂停' : '播放'}</span>
            </Button>
          )}
        </div>

        {/* 用户头像 */}
        {!isPartner && (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            我
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex flex-col">
      {/* 顶部状态栏 */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm shadow-sm z-10 p-4">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              第 {step} 轮 / 共 {MAX_ROUNDS} 轮
            </span>
          </div>
          <AffectionBar affection={affection} />
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* 场景描述 */}
          {step === 1 && scenario && (
            <div className="text-center text-sm text-gray-600 bg-white/50 rounded-lg p-3 mb-4">
              <span className="font-medium">场景：</span>
              {scenario.description}
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((message, index) => renderMessage(message, index))}

          {/* 加载动画 */}
          {isLoading && <LoadingAnimation gender={gender!} />}

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 选项区域 */}
      {!isLoading && currentOptions.length > 0 && !gameOver && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm shadow-lg p-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-sm text-gray-600 mb-2">选择你的回复：</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="h-auto py-3 px-4 justify-start text-left whitespace-normal"
                  onClick={() => handleSelectOption(option)}
                >
                  {option.content}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
