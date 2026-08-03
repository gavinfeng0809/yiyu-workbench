/* 语音合成封装：云函数 tts → 云端合成 MP3 → 本地播放
   同一文本只合成一次（本地缓存 URL，避免重复计费）
   文本 hash 作为缓存键 */
const store = require('./store.js')

function _hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  return h.toString(36)
}

let audioCtx = null
function _getCtx() {
  if (!audioCtx) audioCtx = wx.createInnerAudioContext()
  return audioCtx
}

/* 播放文本（自动走云端 TTS） */
function speak(text, lang, rate) {
  if (!text) return
  const key = 'tts_' + _hash(text + '|' + (lang || 'zh-CN'))
  const cached = store.get(key, '')
  if (cached) { _play(cached); return }
  if (!wx.cloud) { toast('未初始化云开发'); return }
  wx.showLoading({ title: '合成中...', mask: false })
  wx.cloud.callFunction({ name: 'tts', data: { text: text, lang: lang || 'zh-CN', rate: rate || 0.9 } }).then(res => {
    wx.hideLoading()
    const url = res.result && res.result.url
    if (url) { store.set(key, url); _play(url) }
    else if (res.result && res.result.error) toast(res.result.error)
    else toast('合成失败')
  }).catch(() => {
    wx.hideLoading()
    toast('语音服务不可用')
  })
}

function _play(url) {
  try {
    const ctx = _getCtx()
    ctx.stop()
    ctx.src = url
    ctx.autoplay = true
  } catch (e) { toast('播放失败') }
}

function stop() {
  if (audioCtx) { try { audioCtx.stop() } catch (e) {} }
}

module.exports = { speak, stop }
