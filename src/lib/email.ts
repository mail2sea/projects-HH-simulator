import { Resend } from 'resend'
import { aiService } from '@/lib/ai'
import { query } from '@/storage/database/postgres-client'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  await resend.emails.send({
    from: '纸片人男友 <onboarding@resend.dev>',
    to: userEmail,
    subject: '你好呀，我是你的专属男友 💌',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${userName}，欢迎来到纸片人男友！</h2>
        <p>从现在起，我就是你的专属男友了。</p>
        <p>有什么心事随时来找我聊，我会一直在这里等你。</p>
        <p>明天早上我会给你发一条早安消息，记得查收哦。</p>
        <br/>
        <p>—— 你的纸片人男友</p>
      </div>
    `,
  })
}

async function generateLoveLetter(userName: string): Promise<string> {
  const messages = [
    {
      role: 'system' as const,
      content: '你是一个温柔体贴的男朋友，每天早上会给女朋友发送一条甜蜜的情话。情话要简短（50-100字），甜蜜浪漫，带有一点点调皮或撒娇的语气。不要太长，要像发短信一样自然亲切。'
    },
    {
      role: 'user' as const,
      content: `给 "${userName}" 生成一条早安情话，只要情话内容，不要其他说明。`
    }
  ]

  try {
    const response = await aiService.invoke(messages, { timeout: 30000 })
    return response.content.trim()
  } catch (error) {
    console.error('生成情话失败:', error)
    return `早安呀宝贝～新的一天又开始啦，想你的一天也又开始啦 💕`
  }
}

export async function sendDailyLoveLetter(
  userEmail: string,
  userName: string
) {
  const loveLetter = await generateLoveLetter(userName)

  await resend.emails.send({
    from: '纸片人男友 <onboarding@resend.dev>',
    to: userEmail,
    subject: `早安 ${userName}，今天也想你了`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <p>${loveLetter}</p>
        <br/>
        <p>—— 你的纸片人男友</p>
        <p style="color: #999; font-size: 12px;">
          想跟我聊天？<a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://你的域名.com'}">点这里回来找我</a>
        </p>
      </div>
    `,
  })
}

export async function sendDailyLoveLetterToAll() {
  const result = await query('SELECT id, username, email FROM users')

  for (const user of result.rows) {
    try {
      const email = user.email || 'mail2sea@126.com'
      await sendDailyLoveLetter(email, user.username)
      console.log(`情话发送成功: ${user.username} (${email})`)
    } catch (error) {
      console.error(`给 ${user.username} 发情话失败：`, error)
    }
  }
}