/* 错题本：错误单词列表 + 复习 + 删除 + 清空 */
const app = getApp()
const store = require('../../utils/store.js')
const util = require('../../utils/util.js')
const tts = require('../../utils/tts.js')

Page({
  data: {
    theme: 'light',
    list: []
  },

  onShow() {
    this.setData({ theme: app.globalData.theme, list: this.load() })
  },

  onThemeRefresh(t) { this.setData({ theme: t }) },

  load() {
    return store.get('errbook', []).sort((a, b) => b.added_at - a.added_at)
  },

  refresh() { this.setData({ list: this.load() }) },

  speak(e) { tts.speak(e.currentTarget.dataset.w, 'en-US', 0.85) },

  review(e) {
    const w = e.currentTarget.dataset.w
    const list = this.load()
    list.forEach(x => { if (x.word === w) x.review_count++ })
    store.set('errbook', list)
    util.toast('已复习')
    this.refresh()
  },

  del(e) {
    const w = e.currentTarget.dataset.w
    store.set('errbook', this.load().filter(x => x.word !== w))
    util.toast('已移除')
    this.refresh()
  },

  clearAll() {
    wx.showModal({
      title: '确定清空错题本吗？',
      content: '所有记录将永久删除',
      success: r => {
        if (r.confirm) { store.set('errbook', []); this.refresh(); util.toast('已清空') }
      }
    })
  },

  reviewAll() {
    const list = this.load()
    if (!list.length) { util.toast('错题本为空'); return }
    list.forEach(x => x.review_count++)
    store.set('errbook', list)
    util.toast('已复习全部 ' + list.length + ' 个')
    this.refresh()
  }
})
