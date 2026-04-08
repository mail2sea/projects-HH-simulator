'use client';

import { GameProvider, useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import StartScreen from '@/components/StartScreen';
import GameScreen from '@/components/GameScreen';
import GameOverScreen from '@/components/GameOverScreen';
import Link from 'next/link';

// 导航栏组件
function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">💕</span>
            <span className="text-xl font-bold text-blue-500">
              哄哄模拟器
            </span>
          </Link>

          {/* 用户信息 */}
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                个人中心
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                退出登录
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function GameContent() {
  const { gameState } = useGame();
  const { step, gameOver } = gameState;

  // 游戏未开始：显示开始界面
  if (step === 0) {
    return <StartScreen />;
  }

  // 游戏结束：显示结束界面
  if (gameOver) {
    return <GameOverScreen />;
  }

  // 游戏进行中：显示游戏主界面
  return <GameScreen />;
}

export default function Home() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Navbar />
        <GameContent />
      </div>
    </GameProvider>
  );
}
