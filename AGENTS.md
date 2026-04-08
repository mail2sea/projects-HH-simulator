# 哄哄模拟器 - 项目上下文

## 项目概述

哄哄模拟器是一个情侣互动游戏：AI 扮演生气的对象，用户通过选择题的方式在 10 轮内把对方哄好。

### 核心功能
- 动态对话生成（每轮由 LLM 实时生成）
- 情绪化语音合成（TTS）
- 好感度系统（隐藏数值，通过进度条展示）
- 趣味减分选项（搞笑、离谱的选项）
- 用户认证系统（注册、登录、退出）
- 博客系统（文章管理、LLM 自动生成）

### 游戏流程
```
开始界面 → 选择性别/场景/语音 → 游戏主界面 → 10轮互动 → 结束界面
```

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI 集成**: coze-coding-dev-sdk (LLM + TTS)
- **数据库**: Supabase (PostgreSQL)
- **密码加密**: bcrypt

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts          # 对话生成 API
│   │   │   ├── tts/
│   │   │   │   └── route.ts          # 语音合成 API
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts      # 注册 API
│   │   │   │   └── login/
│   │   │   │       └── route.ts      # 登录 API
│   │   │   ├── game-records/
│   │   │   │   └── route.ts          # 游戏记录 API (GET/POST)
│   │   │   └── blog/
│   │   │       ├── route.ts          # 博客列表 API
│   │   │       ├── [id]/route.ts     # 博客详情 API
│   │   │       └── generate/route.ts # 生成文章 API
│   │   ├── layout.tsx                # 全局布局
│   │   ├── page.tsx                  # 主页面
│   │   ├── profile/
│   │   │   └── page.tsx              # 用户个人页面
│   │   ├── leaderboard/
│   │   │   └── page.tsx              # 排行榜页面
│   │   ├── login/
│   │   │   └── page.tsx              # 登录页面
│   │   └── register/
│   │       └── page.tsx              # 注册页面
│   ├── blog/
│   │   ├── page.tsx                  # 博客列表页
│   │   └── [id]/
│   │       └── page.tsx              # 博客详情页
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 组件（预置）
│   │   ├── StartScreen.tsx           # 开始界面
│   │   ├── GameScreen.tsx            # 游戏主界面
│   │   ├── GameOverScreen.tsx        # 结束界面
│   │   ├── AffectionBar.tsx          # 好感度进度条
│   │   └── LoadingAnimation.tsx      # 加载动画
│   ├── context/
│   │   ├── GameContext.tsx           # 游戏状态管理
│   │   └── AuthContext.tsx           # 用户认证状态管理
│   ├── types/
│   │   └── game.ts                   # 类型定义
│   ├── storage/
│   │   └── database/
│   │       ├── supabase-client.ts    # Supabase 客户端
│   │       └── shared/
│   │           ├── schema.ts         # 数据库模式
│   │           ├── relations.ts      # 关系定义
│   │           └── seed.ts           # 数据种子
│   └── lib/
│       └── utils.ts                  # 工具函数
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 核心模块说明

### 1. 类型定义 (`src/types/game.ts`)
- `GameState`: 游戏状态（轮次、好感度、消息、选项等）
- `Message`: 对话消息
- `Option`: 选择选项
- 常量配置：场景列表、语音配置、游戏参数

### 2. 游戏状态管理 (`src/context/GameContext.tsx`)
- 使用 React Context API 管理全局状态
- 提供游戏控制方法：`startGame`, `selectOption`, `resetGame` 等
- ⚠️ 关键实现要点：使用函数式更新避免闭包陷阱

### 3. 用户认证状态管理 (`src/context/AuthContext.tsx`)
- 使用 React Context API 管理用户登录状态
- 提供认证方法：`login`, `register`, `logout`
- 用户信息存储在 localStorage
- ⚠️ 关键实现要点：初始化时使用 useState 的函数形式读取用户信息

### 4. API 路由
#### `/api/chat` - 对话生成
- 使用 LLM 生成对方的回复和选项
- ⚠️ 关键实现要点：必须包含所有消息（用户和对方的）
- 根据好感度调整情绪表现

#### `/api/tts` - 语音合成
- 使用 TTS 生成语音
- ⚠️ 关键实现要点：清理文本中的动作描述和情绪提示

#### `/api/auth/register` - 用户注册
- 验证用户名（3-50字符）和密码（至少6字符）
- 检查用户名是否已存在
- 使用 bcrypt 哈希密码
- ⚠️ 关键实现要点：必须返回不包含密码的用户信息

#### `/api/auth/login` - 用户登录
- 验证用户名和密码
- 使用 bcrypt.compare 验证密码哈希
- ⚠️ 关键实现要点：返回不包含密码的用户信息

### 4. 组件
- `StartScreen`: 开始界面（选择性别、场景、语音）
- `GameScreen`: 游戏主界面（对话、选项、好感度）
- `GameOverScreen`: 结束界面（成功/失败动画）
- `AffectionBar`: 好感度进度条（⚠️ 使用原生 div 实现）
- `LoadingAnimation`: 加载动画（跳动爱心）
- `Navbar`: 导航栏（显示用户信息和登录/注册按钮）

### 5. 数据库
#### 数据库表
- `users`: 用户表
  - `id`: 主键（自增）
  - `username`: 用户名（唯一）
  - `password`: 密码哈希（bcrypt）
  - `created_at`: 创建时间
- `game_records`: 游戏记录表
  - `id`: 主键（自增）
  - `user_id`: 用户 ID（外键，关联 users 表，级联删除）
  - `scenario`: 场景名称
  - `final_score`: 最终好感度分数
  - `result`: 游戏结果（'victory' 或 'defeat'）
  - `played_at`: 游戏时间
- `blog_posts`: 博客文章表
  - `id`: 主键（自增）
  - `title`: 文章标题
  - `content`: 文章内容
  - `summary`: 文章摘要
  - `cover_image`: 封面图片 URL
  - `created_at`: 创建时间

#### 数据库配置
- 使用 Supabase SDK 进行数据操作
- 所有字段名使用 snake_case
- 每次数据库操作必须检查 `{ data, error }` 并 throw 错误
- 初始化客户端：`import { getSupabaseClient } from '@/storage/database/supabase-client'`

### 6. 博客系统
- API 路由：
  - `/api/blog` - 获取文章列表
  - `/api/blog/[id]` - 获取单篇文章
  - `/api/blog/generate` - 调用 LLM 生成新文章
- 页面：
  - `/blog` - 博客列表页（包含生成新文章按钮）
  - `/blog/[id]` - 博客详情页

### 7. 游戏记录系统
- 功能：记录用户游戏历史，展示统计数据
- API 路由：
  - `/api/game-records` (POST): 保存游戏记录
  - `/api/game-records?userId=X` (GET): 获取用户游戏记录列表
- 页面：
  - `/profile` - 用户个人页面（显示游戏统计和历史记录）
- 保存逻辑：
  - 已登录用户：游戏结束后自动保存，显示"您的游戏记录已经保存"
  - 未登录用户：不保存记录，显示"登录后可保存你的游戏记录"

### 8. 排行榜系统
- 功能：展示全服前 20 名用户的最高好感度分数
- API 路由：
  - `/api/leaderboard` (GET): 获取排行榜数据
- 页面：
  - `/leaderboard` - 排行榜页面
- 排名规则：
  - 每个用户只显示最高分记录
  - 按分数降序排序
  - 同分时按达成时间升序排序
  - 只显示前 20 名
- 展示内容：
  - 排名（前三名有特殊图标）
  - 用户名
  - 最高好感度分数
  - 达成时间
- 特殊功能：
  - 当前登录用户在榜上时高亮显示
  - 所有人（包括未登录用户）都能查看排行榜
  - 只有登录用户的成绩才会被记录和上榜

## 游戏规则

### 好感度系统
- 初始值：20
- 范围：-50 ~ 100
- 胜利条件：10轮内好感度 >= 80
- 失败条件：好感度 < -50 或 10轮用完好感度 < 80

### 选项生成规则
每轮生成 6 个选项：
- 2个加分选项（+5 到 +20）：真诚道歉、具体弥补方案、提起共同回忆
- 4个减分选项（-5 到 -30）：
  - 1-2个普通减分：敷衍、转移话题、找借口
  - 2-3个奇葩搞笑选项：离谱到好笑

## 开发规范

### 包管理
**仅允许使用 pnpm**，严禁使用 npm 或 yarn。

### 数据库使用
项目使用 Supabase 数据库，配置位于 `src/storage/database/shared/schema.ts`。
- 使用 Supabase SDK 进行数据操作（不要用 Drizzle ORM 的查询语法）
- 所有字段名使用 snake_case
- 每次数据库操作必须检查 `{ data, error }` 并 throw 错误
- 初始化客户端：`import { getSupabaseClient } from '@/storage/database/supabase-client'`

### 代码规范
- 组件：PascalCase (`GameScreen.tsx`)
- 函数：camelCase (`handleSelectOption`)
- 常量：UPPER_SNAKE_CASE (`MAX_ROUNDS`)
- 类型：PascalCase (`GameState`, `Message`)

### 关键实现要点
1. **闭包陷阱**：使用函数式更新 `setGameState(prev => ...)`
2. **对话历史**：必须包含所有消息，不要过滤用户消息
3. **语音更新**：跟踪消息 ID，每轮生成新语音
4. **进度条**：使用原生 div，不要用自定义 Progress 组件
5. **文本清理**：TTS 前清理括号内容
6. **用户认证**：使用 useState 的函数形式初始化用户信息，避免在 useEffect 中同步调用 setState
7. **密码安全**：使用 bcrypt 哈希密码，永远不要返回密码给前端
8. **环境变量加载**：使用 `import * as dotenv from 'dotenv'` 而不是 `require('dotenv')`

### 常见问题修复
参见 `BUGFIXES.md` 文档（如存在）

## 测试命令

```bash
# 类型检查
npx tsc --noEmit

# 测试对话生成接口
curl -X POST -H "Content-Type: application/json" \
  -d '{"gender":"female","scenario":"忘记纪念日","messages":[],"affection":20,"step":1,"isGameOver":false,"won":false}' \
  http://localhost:5000/api/chat

# 测试语音合成接口
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"你好","speaker":"zh_female_xiaohe_uranus_bigtts","uid":"test"}' \
  http://localhost:5000/api/tts

# 测试用户注册接口
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  http://localhost:5000/api/auth/register

# 测试用户登录接口
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  http://localhost:5000/api/auth/login

# 测试保存游戏记录接口
curl -X POST -H "Content-Type: application/json" \
  -d '{"userId":1,"scenario":"忘记纪念日","finalScore":85,"result":"victory"}' \
  http://localhost:5000/api/game-records

# 测试获取游戏记录接口
curl -s "http://localhost:5000/api/game-records?userId=1"

# 测试获取排行榜接口
curl -s http://localhost:5000/api/leaderboard

# 检查服务存活
curl -I http://localhost:5000
```



