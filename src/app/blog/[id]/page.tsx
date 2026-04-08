'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Tag } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  tags: string;
  read_time: number;
  created_at: string;
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取文章详情
  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/blog/${articleId}`);
      const data = await response.json();
      setArticle(data.post);
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push('/blog');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <p>加载中...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-4">文章不存在</h2>
            <Button onClick={() => router.push('/blog')}>返回列表</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 解析标签
  const parseTags = (tagsString: string): string[] => {
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-lg font-medium text-gray-600">文章详情</h1>
          <div className="w-20" /> {/* 占位符，保持标题居中 */}
        </div>

        {/* 文章内容 */}
        <Card>
          <CardContent className="pt-6">
            {/* 文章标题 */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {article.title}
            </h1>

            {/* 文章元信息 */}
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 pb-4 border-b">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.read_time} 分钟阅读
              </span>
              <span>{formatDate(article.created_at)}</span>
            </div>

            {/* 标签 */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {parseTags(article.tags).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* 文章正文 */}
            <div className="prose prose-pink max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>

            {/* 底部提示 */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-500 mb-4">
                希望这篇文章对你有帮助！
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                去玩游戏
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
