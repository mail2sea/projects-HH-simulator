import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

let envLoaded = false;

function loadEnv(): void {
  if (envLoaded) {
    return;
  }

  try {
    try {
      dotenv.config();
      envLoaded = true;
      return;
    } catch {
      // dotenv not available
    }

    const pythonCode = `
import os
import sys
try:
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }

    envLoaded = true;
  } catch {
    // Silently fail
  }
}

function getSupabaseClient(token?: string): SupabaseClient {
  loadEnv();

  // 直接从 DATABASE_URL 读取连接信息
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // 从 DATABASE_URL 解析出主机名
  console.log('Database URL:', databaseUrl);
  
  // 直接从 DATABASE_URL 中提取主机名
  const urlParts = databaseUrl.split('@');
  if (urlParts.length < 2) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  const hostPart = urlParts[1].split(':')[0];
  console.log('Extracted host:', hostPart);
  
  const url = `https://${hostPart}`;
  console.log('Constructed Supabase URL:', url);

  // 只从 DATABASE_URL 中提取密钥信息
  let anonKey: string | null = null;
  let serviceRoleKey: string | null = null;

  try {
    // 检查 DATABASE_URL 中是否包含额外的参数
    const urlParams = new URLSearchParams(databaseUrl.split('?')[1] || '');
    anonKey = urlParams.get('anon_key');
    serviceRoleKey = urlParams.get('service_role_key');
  } catch (e) {
    // 解析失败时忽略错误
  }

  // 如果 DATABASE_URL 中没有密钥，则使用默认值
  if (!anonKey) {
    anonKey = '*************************************************************************************************************************************************************************************************************************';
  }
  if (!serviceRoleKey) {
    serviceRoleKey = '*************************************************************************************************************************************************************************************************************************';
  }

  if (!anonKey) {
    throw new Error('SUPABASE_ANON_KEY is not set');
  }

  let key: string;
  if (token) {
    key = anonKey;
  } else {
    key = serviceRoleKey ?? anonKey;
  }

  // 尝试使用不同的 SSL 配置
  const supabaseOptions = {
    global: {
      fetch: (input: URL | RequestInfo, init?: RequestInit) => {
        console.log('Fetching:', input);
        return fetch(input, init).catch(error => {
          console.error('Fetch error:', error);
          throw error;
        });
      },
    },
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ssl: {
      rejectUnauthorized: false, // 临时禁用 SSL 验证以测试连接
    },
  };

  if (token) {
    return createClient(url, key, {
      ...supabaseOptions,
      global: {
        ...supabaseOptions.global,
        headers: { Authorization: `Bearer ${token}` },
      },
    });
  } else {
    return createClient(url, key, supabaseOptions);
  }
}

export { getSupabaseClient };
