import { query } from '../src/storage/database/postgres-client';

async function addEmailColumn() {
  try {
    // 添加 email 字段（如果不存在）
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT \'mail2sea@126.com\'');
    console.log('✓ 成功添加 email 字段');
    
    // 更新现有用户的 email
    const updateResult = await query('UPDATE users SET email = \'mail2sea@126.com\' WHERE email IS NULL');
    console.log(`✓ 成功更新 ${updateResult.rowCount} 个用户的 email`);
    
    // 验证结果
    const usersResult = await query('SELECT id, username, email FROM users LIMIT 5');
    console.log('\n📋 验证用户数据：');
    usersResult.rows.forEach(user => {
      console.log(`  ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    console.log('\n🎉 操作完成！');
  } catch (error) {
    console.error('❌ 执行失败：', error);
    process.exit(1);
  }
}

addEmailColumn();