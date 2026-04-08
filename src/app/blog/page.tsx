'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Tag, Sparkles } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  tags: string;
  read_time: number;
  created_at: string;
}

export default function BlogListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // 获取文章列表
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成新文章
  const generateNewArticle = async () => {
    if (generating) return;
    
    setGenerating(true);
    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.post) {
        await fetchPosts(); // 刷新列表
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setGenerating(false);
    }
  };

  const goBack = () => {
    router.push('/');
  };

  const goToArticle = (id: string) => {
    router.push(`/blog/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <p>加载中...</p>
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
          <h1 className="text-2xl font-bold text-gray-800">恋爱攻略</h1>
          <div className="w-20" /> {/* 占位符，保持标题居中 */}
        </div>

        {/* 生成新文章按钮 */}
        <Button
          className="w-full mb-6 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={generateNewArticle}
          disabled={generating}
        >
          <Sparkles className="w-5 h-5" />
          {generating ? '正在生成...' : '生成新文章'}
        </Button>

        {/* 文章列表 */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无文章，点击上方按钮生成一篇吧！</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => goToArticle(post.id.toString())}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.read_time} 分钟阅读
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{post.summary}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {parseTags(post.tags).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 提示 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 想要提升哄人技巧？多看看这些攻略吧！</p>
        </div>
      </div>
    </div>
  );
}
