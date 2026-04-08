'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface LoadingAnimationProps {
  gender: 'female' | 'male';
}

export default function LoadingAnimation({ gender }: LoadingAnimationProps) {
  const text = gender === 'female' ? '她正在思考...' : '他正在思考...';

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Heart
        className="w-6 h-6 text-pink-500 animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <Heart
        className="w-5 h-5 text-pink-400 animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <Heart
        className="w-4 h-4 text-pink-300 animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
      <span className="text-gray-600 ml-2">{text}</span>
    </div>
  );
}
