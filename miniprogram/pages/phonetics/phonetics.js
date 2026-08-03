/* 音标学习：44 个 IPA 音素图表 */
const app = getApp()
const tts = require('../../utils/tts.js')

Page({
  data: {
    theme: 'light',
    vowels: [],
    diphthongs: [],
    consonants: []
  },

  onLoad() {
    const p = app.globalData.phonetics || {}
    this.setData({ vowels: p.vowels || [], diphthongs: p.diphthongs || [], consonants: p.consonants || [] })
  },

  onShow() { this.setData({ theme: app.globalData.theme }) },
  onThemeRefresh(t) { this.setData({ theme: t }) },

  speak(e) {
    const { word } = e.currentTarget.dataset
    tts.speak(word, 'en-US', 0.7)
  }
})
