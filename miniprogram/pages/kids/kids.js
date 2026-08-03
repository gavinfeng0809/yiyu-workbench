/* 幼儿启蒙：汉字翻卡 + 数字 + 颜色 + 拼音音节 */
const app = getApp()
const store = require('../../utils/store.js')
const util = require('../../utils/util.js')

const NUM_WORDS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']
const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']

Page({
  data: {
    theme: 'light',
    tab: 'hanzi',
    tabs: [
      { key: 'hanzi', label: '汉字' },
      { key: 'num', label: '数字' },
      { key: 'color', label: '颜色' },
      { key: 'pinyin', label: '拼音' }
    ],
    hanzi: [],
    done: {},
    nums: [],
    colors: [],
    pinyin: {},
    pinyinKeys: []
  },

  onLoad() {
    const gd = app.globalData
    const kids = gd.kids || {}
    const doneList = store.get('kids', [])
    const done = {}
    doneList.forEach(k => done[k] = true)
    this.setData({
      hanzi: kids.hanzi || [],
      nums: NUM_WORDS.map((w, i) => ({ cn: w, en: NUM_EN[i], n: i })),
      colors: kids.colors || [],
      pinyin: kids.pinyin || {},
      pinyinKeys: Object.keys(kids.pinyin || {}),
      done
    })
  },

  onShow() { this.setData({ theme: app.globalData.theme }) },
  onThemeRefresh(t) { this.setData({ theme: t }) },

  setTab(e) { this.setData({ tab: e.currentTarget.dataset.key }) },

  /* 汉字翻卡：记录已学 */
  flip(e) {
    const { i } = e.currentTarget.dataset
    const done = { ...this.data.done }
    if (done[i]) { delete done[i] } else { done[i] = true }
    const arr = Object.keys(done)
    store.set('kids', arr)
    this.setData({ done })
    if (done[i]) util.toast('太棒了，又学会一个')
  }
})
