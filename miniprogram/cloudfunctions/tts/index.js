/* 云函数 tts：腾讯云语音合成
   前置条件（见 README-MINIPROGRAM.md）：
   1. 腾讯云开通「语音合成 TTS」服务（有免费额度）
   2. 云函数环境配置环境变量 TENCENT_SECRET_ID / TENCENT_SECRET_KEY
   3. 安装依赖: npm i tencentcloud-sdk-nodejs-tts wx-server-sdk
   返回: { url: 云存储临时链接 } */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const { COS } = cloud

const tencentcloud = require('tencentcloud-sdk-nodejs-tts')
const TtsClient = tencentcloud.tts.v20190823.Client

const SECRET_ID = process.env.TENCENT_SECRET_ID
const SECRET_KEY = process.env.TENCENT_SECRET_KEY
const BUCKET = process.env.TTS_BUCKET || 'tts-cache' // 云存储 bucket 名

// 分段上限：腾讯云单次 TTS ≤ 150 字（中文约 90 字），长文本需分段
const MAX_CHARS = 90

function splitText(text) {
  const segs = []
  for (let i = 0; i < text.length; i += MAX_CHARS) segs.push(text.slice(i, i + MAX_CHARS))
  return segs
}

exports.main = async (event) => {
  const { text = '', lang = 'zh-CN', rate = 0.9 } = event
  if (!text) return { error: '文本为空' }
  if (!SECRET_ID || !SECRET_KEY) return { error: 'TTS 密钥未配置' }

  const VoiceType = lang === 'en-US' ? 101003 : 101001 // 女声（中文/英文）
  const codec = 'mp3'

  try {
    const client = new TtsClient({ credential: { secretId: SECRET_ID, secretKey: SECRET_KEY }, region: 'ap-guangzhou', profile: { httpProfile: { endpoint: 'tts.tencentcloudapi.com' } } })
    const segs = splitText(text)
    const audioBufs = []
    for (const seg of segs) {
      const res = await client.TextToVoice({
        Text: seg,
        SessionId: 'yiyu-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        ModelType: 1,
        VoiceType,
        Codec: codec,
        Speed: Math.max(0, Math.min(100, Math.round((rate - 0.5) * 100)))
      })
      if (res.Audio) audioBufs.push(Buffer.from(res.Audio, 'base64'))
    }
    const full = Buffer.concat(audioBufs)

    // 存云存储，返回 fileID 临时链接
    const path = 'tts/' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + '.mp3'
    const up = await cloud.uploadFile({ cloudPath: path, fileContent: full })
    const url = await cloud.getTempFileURL({ fileList: [up.fileID] })
    return { url: url.fileList[0].tempFileURL, length: segs.length }
  } catch (e) {
    console.error('TTS 调用失败', e)
    return { error: '合成失败: ' + (e.message || e) }
  }
}
