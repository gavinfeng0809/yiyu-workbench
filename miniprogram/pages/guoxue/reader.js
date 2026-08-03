/* 国学阅读器：全文 + 拼音对照 + 字体调节 + 云TTS朗读 */
const app = getApp()
const store = require('../../../utils/store.js')
const tts = require('../../../utils/tts.js')

Page({
  data: {
    theme: 'light',
    classic: null,
    bodyLines: [],      // 正文行 [{t, p}] 或 [{t}]
    showPinyin: true,
    fontSize: 18,       // rpx 基准
    fav: false,
    readAll: false
  },

  onLoad(options) {
    const gd = app.globalData
    const id = options.id
    const c = gd.classics && gd.classics[id]
    if (!c) { wx.showToast({ title: '内容不存在', icon: 'none' }); setTimeout(() => wx.navigateBack(), 800); return }
    wx.setNavigationBarTitle({ title: c.title })
    const lines = c.lines || []
    const hasPinyin = lines.length > 0 && lines[0].p
    this.setData({
      theme: gd.theme,
      classic: c,
      bodyLines: lines.length ? lines : [{ t: c.body || '' }],
      showPinyin: hasPinyin,
      fav: store.get('favs', []).indexOf(id) >= 0,
      fontSize: store.get('gxFont', 18)
    })
  },

  onThemeRefresh(t) { this.setData({ theme: t }) },

  togglePinyin() { this.setData({ showPinyin: !this.data.showPinyin }) },

  fontChange(e) {
    const d = Number(e.currentTarget.dataset.d)
    let f = this.data.fontSize + d
    if (f < 14) f = 14
    if (f > 24) f = 24
    store.set('gxFont', f)
    this.setData({ fontSize: f })
  },

  toggleFav() {
    const favs = store.get('favs', [])
    const id = this.data.classic.id || ''
    const i = favs.indexOf(id)
    if (i >= 0) favs.splice(i, 1); else favs.push(id)
    store.set('favs', favs)
    this.setData({ fav: i < 0 })
    wx.showToast({ title: i >= 0 ? '已取消收藏' : '已收藏', icon: 'none' })
  },

  readOne(e) {
    const { text } = e.currentTarget.dataset
    tts.speak(text, 'zh-CN', 0.9)
  },

  readAll() {
    const c = this.data.classic
    const text = (c.lines || []).map(l => l.t).join('')
    if (!text) { wx.showToast({ title: '暂无内容可朗读', icon: 'none' }); return }
    tts.speak(text, 'zh-CN', 0.9)
    this.setData({ readAll: true })
  },

  stopRead() {
    tts.stop()
    this.setData({ readAll: false })
  },

  onUnload() { tts.stop() }
})
