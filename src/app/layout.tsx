import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器 | 情侣互动游戏',
    template: '%s | 哄哄模拟器',
  },
  description:
    'AI 扮演生气的对象，通过选择题的方式在 10 轮内把对方哄好。有趣的情侣互动游戏，考验你的情商！',
  keywords: [
    '哄哄模拟器',
    '情侣游戏',
    '互动游戏',
    'AI 游戏',
    '情商测试',
    '恋爱游戏',
  ],
  authors: [{ name: '哄哄模拟器', url: 'https://code.coze.cn' }],
  generator: 'Coze Code',
  openGraph: {
    title: '哄哄模拟器 | 情侣互动游戏',
    description:
      'AI 扮演生气的对象，看你在 10 轮内能不能把 TA 哄好！',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
