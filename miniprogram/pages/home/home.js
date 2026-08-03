/* 首页：日期问候 + 每日一句 + 快捷入口 + 学习概览 */
const app = getApp()
const util = require('../../utils/util.js')
const store = require('../../utils/store.js')

/* 每日一句 */
const QUOTES = [
  { t: '博学之，审问之，慎思之，明辨之，笃行之。', s: '礼记·中庸' },
  { t: '学而时习之，不亦说乎？', s: '论语' },
  { t: '天行健，君子以自强不息。', s: '周易' },
  { t: '知之者不如好之者，好之者不如乐之者。', s: '论语' },
  { t: '己所不欲，勿施于人。', s: '论语' },
  { t: '不积跬步，无以至千里。', s: '荀子' },
  { t: '路漫漫其修远兮，吾将上下而求索。', s: '离骚' },
  { t: '会当凌绝顶，一览众山小。', s: '杜甫' },
  { t: '长风破浪会有时，直挂云帆济沧海。', s: '李白' },
  { t: '人生得意须尽欢，莫使金樽空对月。', s: '李白' }
]

Page({
  data: {
    theme: 'light',
    dateStr: '',
    weekDay: '',
    quote: { t: '', s: '' },
    wordCount: 0,
    classicsCount: 0,
    kidsDone: 0,
    enDone: 0
  },

  onLoad() {
    const now = new Date()
    this.setData({
      dateStr: now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日',
      weekDay: '星期' + util.WEEK[now.getDay()],
      quote: QUOTES[util.dayOfYear() % QUOTES.length]
    })
  },

  onShow() {
    const gd = app.globalData
    this.setData({
      theme: gd.theme,
      wordCount: (gd.allWords || []).length,
      classicsCount: Object.keys(gd.classics || {}).length,
      kidsDone: store.get('kids', []).length,
      enDone: store.get('en', []).length
    })
  },

  onThemeRefresh(theme) { this.setData({ theme }) },

  go(e) {
    const { url } = e.currentTarget.dataset
    wx.switchTab({ url })
  },

  toggleTheme() { app.toggleTheme() },

  rerollQuote() {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    this.setData({ quote: q })
  }
})
