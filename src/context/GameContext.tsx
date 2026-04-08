'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  GameState,
  Gender,
  Scenario,
  VoiceType,
  Option,
  Message,
  INITIAL_AFFECTION,
  MIN_AFFECTION,
  MAX_AFFECTION,
  WIN_AFFECTION,
  MAX_ROUNDS,
} from '@/types/game';

// 初始游戏状态
const initialGameState: GameState = {
  step: 0,
  affection: INITIAL_AFFECTION,
  gender: null,
  scenario: null,
  voiceType: null,
  messages: [],
  currentOptions: [],
  gameOver: false,
  won: false,
};

// Context 类型定义
interface GameContextType {
  gameState: GameState;
  setGender: (gender: Gender) => void;
  setScenario: (scenario: Scenario) => void;
  setVoiceType: (voiceType: VoiceType) => void;
  startGame: () => void;
  selectOption: (option: Option) => void;
  resetGame: () => void;
  addPartnerMessage: (content: string, options: Option[]) => void;
  setGameOver: (won: boolean) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

// 创建 Context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider 组件
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(false);

  // 设置性别
  const setGender = useCallback((gender: Gender) => {
    setGameState(prev => ({ ...prev, gender }));
  }, []);

  // 设置场景
  const setScenario = useCallback((scenario: Scenario) => {
    setGameState(prev => ({ ...prev, scenario }));
  }, []);

  // 设置语音类型
  const setVoiceType = useCallback((voiceType: VoiceType) => {
    setGameState(prev => ({ ...prev, voiceType }));
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    setGameState(prev => {
      // ⚠️ 关键实现要点：使用函数式更新避免闭包陷阱
      const gender = prev.gender;
      const scenario = prev.scenario;
      const voiceType = prev.voiceType;

      if (!gender || !scenario || !voiceType) {
        console.error('Missing game config:', { gender, scenario, voiceType });
        return prev;
      }

      return {
        ...prev,
        step: 1,
        messages: [],
        currentOptions: [],
        gameOver: false,
        won: false,
        affection: INITIAL_AFFECTION,
      };
    });
  }, []);

  // 选择选项
  const selectOption = useCallback((option: Option) => {
    setGameState(prev => {
      // 更新好感度
      let newAffection = prev.affection + option.score;
      newAffection = Math.max(MIN_AFFECTION, Math.min(MAX_AFFECTION, newAffection));

      // 添加用户消息
      const userMessage: Message = {
        role: 'user',
        content: option.content,
      };

      // 检查游戏是否结束
      const newStep = prev.step + 1;
      const isLastRound = newStep > MAX_ROUNDS;
      const isFailed = newAffection < MIN_AFFECTION;
      const isWin = newAffection >= WIN_AFFECTION;

      return {
        ...prev,
        step: newStep,
        affection: newAffection,
        messages: [...prev.messages, userMessage],
        currentOptions: [], // 清空选项，等待生成新的
        gameOver: isLastRound || isFailed || isWin,
        won: isWin,
      };
    });
  }, []);

  // 添加对方的回复和选项
  const addPartnerMessage = useCallback((content: string, options: Option[]) => {
    setGameState(prev => {
      const partnerMessage: Message = {
        role: 'partner',
        content,
      };

      return {
        ...prev,
        messages: [...prev.messages, partnerMessage],
        currentOptions: options,
      };
    });
  }, []);

  // 设置游戏结束
  const setGameOver = useCallback((won: boolean) => {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      won,
    }));
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setIsLoading(false);
  }, []);

  // 设置加载状态
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGender,
        setScenario,
        setVoiceType,
        startGame,
        selectOption,
        resetGame,
        addPartnerMessage,
        setGameOver,
        setLoading,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
