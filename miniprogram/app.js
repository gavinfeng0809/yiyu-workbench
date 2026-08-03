/* 一隅工作台 · 小程序全局入口
   数据热更新：内置基线数据 + 启动时从云开发拉取最新内容 */
const classicsData = require('./data/classics_data.js')
const englishData = require('./data/english_data.js')
const kidsData = require('./data/kids_data.js')

App({
  globalData: {
    theme: 'light',
    classics: classicsData,
    words: englishData.words,
    phonetics: englishData.phonetics,
    kids: kidsData,
    allWords: [],
    dataVersion: 0,
    cloudReady: false
  },

  onLaunch() {
    // 初始化云开发（首次需在控制台开通，填入环境 ID）
    if (wx.cloud) {
      try {
        wx.cloud.init({ env: 'YOUR-CLOUD-ENV-ID', traceUser: true })
        this.globalData.cloudReady = true
      } catch (e) { console.warn('云开发初始化失败', e) }
    }
    this.initTheme()
    this.buildAllWords()
    this.checkDataUpdate()
  },

  initTheme() {
    const t = this.globalData.theme = wx.getStorageSync('yiyu_theme') || 'light'
    wx.setNavigationBarColor({ frontColor: t === 'dark' ? '#ffffff' : '#000000', backgroundColor: t === 'dark' ? '#131311' : '#f5f3ec' })
  },

  toggleTheme() {
    this.globalData.theme = this.globalData.theme === 'dark' ? 'light' : 'dark'
    wx.setStorageSync('yiyu_theme', this.globalData.theme)
    this.initTheme()
    // 通知所有页面刷新主题
    const pages = getCurrentPages()
    pages.forEach(p => { if (p.onThemeRefresh) p.onThemeRefresh(this.globalData.theme) })
  },

  buildAllWords() {
    const arr = []
    const w = this.globalData.words
    if (!w) return
    for (const k in w) {
      const cat = w[k]
      if (!cat || !cat.list) continue
      for (const it of cat.list) {
        arr.push({ cat: k, catName: cat.name, word: it[0], phon: it[1], mean: it[2], ex: it[3] })
      }
    }
    this.globalData.allWords = arr
  },

  /* 数据热更新：静默检查云数据库中的最新内容包 */
  checkDataUpdate() {
    if (!this.globalData.cloudReady) return
    setTimeout(() => {
      wx.cloud.callFunction({ name: 'getData' }).then(res => {
        const r = res.result
        if (!r || !r.version) return
        const cur = wx.getStorageSync('yiyu_dver') || 0
        if (r.version <= cur) return
        this.applyRemoteData(r.payload || {})
        wx.setStorageSync('yiyu_dver', r.version)
        wx.showToast({ title: '内容已更新 v' + r.version, icon: 'none', duration: 2000 })
      }).catch(err => { /* 云函数未部署或网络问题，使用内置数据 */ })
    }, 2000)
  },

  applyRemoteData(payload) {
    if (payload.classics) this.globalData.classics = Object.assign({}, this.globalData.classics, payload.classics)
    if (payload.words) {
      this.globalData.words = Object.assign({}, this.globalData.words, payload.words)
      this.buildAllWords()
    }
    if (payload.phonetics) this.globalData.phonetics = payload.phonetics
    if (payload.kids) this.globalData.kids = Object.assign({}, this.globalData.kids, payload.kids)
    wx.setStorageSync('yiyu_remote_payload', payload)
  }
})
