import { query } from './src/storage/database/postgres-client';

async function testBlogReading() {
  try {
    console.log('Testing blog content reading...\n');
    
    // 测试读取所有博客文章
    console.log('1. Reading all blog posts...');
    const allPostsResult = await query(
      'SELECT id, title, summary, tags, read_time, created_at FROM blog_posts ORDER BY created_at DESC'
    );
    
    if (allPostsResult.rows.length === 0) {
      console.log('❌ No blog posts found');
      return;
    }
    
    console.log(`✓ Found ${allPostsResult.rows.length} blog posts:`);    
    allPostsResult.rows.forEach((post: any, index: number) => {
      console.log(`  ${index + 1}. ${post.title} (${post.created_at})`); 
    });
    
    // 测试读取单篇博客文章的详细信息
    console.log('\n2. Reading detailed content of the first blog post...');
    const firstPostId = allPostsResult.rows[0].id;
    const detailResult = await query(
      'SELECT id, title, summary, content, tags, read_time, created_at FROM blog_posts WHERE id = $1',
      [firstPostId]
    );
    
    if (detailResult.rows.length === 0) {
      console.log('❌ Failed to read blog post details');
      return;
    }
    
    const post = detailResult.rows[0];
    console.log('✓ Blog post details:');
    console.log(`  ID: ${post.id}`);
    console.log(`  Title: ${post.title}`);
    console.log(`  Summary: ${post.summary}`);
    console.log(`  Tags: ${post.tags}`);
    console.log(`  Read Time: ${post.read_time} minutes`);
    console.log(`  Created At: ${post.created_at}`);
    console.log(`  Content Length: ${post.content.length} characters`);
    
    console.log('\n✅ Blog content reading test passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Blog content reading test failed:', error);
    process.exit(1);
  }
}

testBlogReading();