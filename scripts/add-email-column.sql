-- 给 users 表添加 email 字段
-- 如果字段已存在会报错，可以安全重复执行

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT 'mail2sea@126.com';

-- 将已有用户的 email 设置为默认值（如果需要）
UPDATE users SET email = 'mail2sea@126.com' WHERE email IS NULL;