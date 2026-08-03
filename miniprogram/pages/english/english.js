/* 英语学习：每日一词 + 分类标签 + 翻卡 + 错题本入口 */
const app = getApp()
const store = require('../../utils/store.js')
const util = require('../../utils/util.js')
const tts = require('../../utils/tts.js')

Page({
  data: {
    theme: 'light',
    allWords: [],
    daily: null,
    cats: [],
    activeCat: '',
    catWords: [],
    done: {},
    enDone: 0,
    total: 0,
    errCount: 0,
    flipped: {}
  },

  onShow() {
    const gd = app.globalData
    const allWords = gd.allWords || []
    const words = gd.words || {}
    const cats = Object.keys(words).map(k => ({ key: k, name: words[k].name, color: words[k].color }))
    const doneList = store.get('en', [])
    const done = {}
    doneList.forEach(w => done[w] = true)
    this.setData({
      theme: gd.theme,
      allWords,
      total: allWords.length,
      daily: allWords.length ? allWords[util.dayOfYear() % allWords.length] : null,
      cats,
      activeCat: this.data.activeCat || (cats.length ? cats[0].key : ''),
      done,
      enDone: doneList.length,
      errCount: store.get('errbook', []).length
    })
    if (this.data.activeCat) this.loadCat(this.data.activeCat)
  },

  onThemeRefresh(t) { this.setData({ theme: t }) },

  loadCat(key) {
    const gd = app.globalData
    const words = gd.words || {}
    const cat = words[key]
    this.setData({ activeCat: key, catWords: (cat && cat.list) ? cat.list.map(w => ({ w0: w[0], w1: w[1], w2: w[2], w3: w[3] })) : [] })
  },

  setCat(e) { this.loadCat(e.currentTarget.dataset.key) },

  flip(e) {
    const { i } = e.currentTarget.dataset
    this.setData({ ['flipped.' + i]: !this.data.flipped[i] })
  },

  speak(e) {
    tts.speak(e.currentTarget.dataset.w, 'en-US', 0.85)
  },

  markDone(e) {
    const w = e.currentTarget.dataset.w
    const done = { ...this.data.done }
    const list = store.get('en', [])
    if (done[w]) { delete done[w]; const i = list.indexOf(w); if (i >= 0) list.splice(i, 1) }
    else { done[w] = true; list.push(w); util.toast('Well done!', 'none') }
    store.set('en', list)
    this.setData({ done, enDone: list.length })
  },

  addErr(e) {
    const { w, p, m, c } = e.currentTarget.dataset
    const list = store.get('errbook', [])
    if (list.some(x => x.word === w)) { util.toast('已在错题本中'); return }
    list.push({ word: w, phonetic: p, meaning: m, cat: c, added_at: Date.now(), review_count: 0 })
    store.set('errbook', list)
    this.setData({ errCount: list.length })
    util.toast('已加入错题本')
  },

  goPhonetics() { wx.navigateTo({ url: '/pages/phonetics/phonetics' }) },
  goErrorBook() { wx.navigateTo({ url: '/pages/errorbook/errorbook' }) }
})
