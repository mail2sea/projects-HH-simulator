import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

let envLoaded = false;

function loadEnv(): void {
  if (envLoaded) {
    return;
  }

  try {
    // 尝试加载 .env.local 文件
    dotenv.config({ path: '.env.local' });
    envLoaded = true;
  } catch {
    // dotenv not available
  }
}

let pool: Pool | null = null;

function getPool(): Pool {
  loadEnv();

  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    console.log('Database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false, // 临时禁用 SSL 验证以测试连接
      },
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  return pool;
}

export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  const client = await pool.connect();
  return client;
}

export async function testConnection(): Promise<boolean> {
  try {
    const res = await query('SELECT NOW()');
    console.log('Database connection test successful:', res.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}