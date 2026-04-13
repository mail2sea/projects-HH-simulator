import { query } from './src/storage/database/postgres-client';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // 测试基本连接
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('✓ Basic connection successful:', timeResult.rows[0]);
    
    // 测试查询用户表
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    console.log('✓ Users table query successful:', usersResult.rows[0]);
    
    // 测试查询博客表
    const blogResult = await query('SELECT COUNT(*) as count FROM blog_posts');
    console.log('✓ Blog posts table query successful:', blogResult.rows[0]);
    
    // 测试查询游戏记录表
    const gameResult = await query('SELECT COUNT(*) as count FROM game_records');
    console.log('✓ Game records table query successful:', gameResult.rows[0]);
    
    console.log('\n✅ All database connection tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();