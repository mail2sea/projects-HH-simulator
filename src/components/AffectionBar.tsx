'use client';

import React from 'react';
import { MIN_AFFECTION, MAX_AFFECTION } from '@/types/game';

interface AffectionBarProps {
  affection: number;
}

export default function AffectionBar({ affection }: AffectionBarProps) {
  // 计算进度条百分比
  const percentage = ((affection - MIN_AFFECTION) / (MAX_AFFECTION - MIN_AFFECTION)) * 100;

  // 根据好感度获取颜色
  const getColor = () => {
    if (affection < 0) return 'bg-red-500';
    if (affection < 50) return 'bg-yellow-500';
    if (affection < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // 获取情绪标签
  const getMoodLabel = () => {
    if (affection < 0) return '😤 非常生气';
    if (affection < 30) return '😠 还在生气';
    if (affection < 60) return '😐 开始软化';
    if (affection < 80) return '😊 快哄好了';
    return '🥰 已经原谅';
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{getMoodLabel()}</span>
        <span className="text-sm text-gray-500">好感度</span>
      </div>
      {/* ⚠️ 关键实现要点：使用原生 div 实现进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
    </div>
  );
}
