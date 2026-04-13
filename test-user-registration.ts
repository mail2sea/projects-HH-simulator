import { query } from './src/storage/database/postgres-client';
import bcrypt from 'bcrypt';

async function testUserRegistration() {
  try {
    console.log('Testing user registration...\n');
    
    const username = 'testuser789';
    const password = 'password123';
    
    // 检查用户名是否已存在
    console.log('1. Checking if username exists...');
    const existingUserResult = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUserResult.rows.length > 0) {
      console.log('❌ Username already exists');
      return;
    }
    console.log('✓ Username is available');
    
    // 哈希密码
    console.log('\n2. Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✓ Password hashed successfully');
    
    // 创建用户
    console.log('\n3. Creating user...');
    const insertResult = await query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    
    console.log('✓ User created successfully:', insertResult.rows[0]);
    
    // 验证用户创建
    console.log('\n4. Verifying user creation...');
    const verifyResult = await query(
      'SELECT id, username, created_at FROM users WHERE username = $1',
      [username]
    );
    
    if (verifyResult.rows.length === 0) {
      console.log('❌ User verification failed');
      return;
    }
    console.log('✓ User verified successfully:', verifyResult.rows[0]);
    
    console.log('\n✅ User registration test passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ User registration test failed:', error);
    process.exit(1);
  }
}

testUserRegistration();