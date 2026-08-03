/* 国学经典：分类标签 + 经典列表 */
const app = getApp()
const store = require('../../utils/store.js')

Page({
  data: {
    theme: 'light',
    cats: ['全部', '启蒙', '四书', '五经', '诗词'],
    activeCat: '全部',
    list: [],
    favs: []
  },

  onShow() {
    const gd = app.globalData
    this.setData({ theme: gd.theme, favs: store.get('favs', []) })
    this.buildList(this.data.activeCat)
  },

  onThemeRefresh(t) { this.setData({ theme: t }) },

  buildList(cat) {
    const gd = app.globalData
    const classics = gd.classics || {}
    let arr = Object.keys(classics).map(id => {
      const c = classics[id]
      return { id, ...c }
    })
    // 排序：启蒙→四书→五经→诗词
    const order = { 启蒙: 0, 四书: 1, 五经: 2, 诗词: 3 }
    arr.sort((a, b) => (order[a.cat] ?? 9) - (order[b.cat] ?? 9))
    if (cat !== '全部') arr = arr.filter(c => c.cat === cat)
    this.setData({ list: arr })
  },

  setCat(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({ activeCat: cat })
    this.buildList(cat)
  },

  open(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: '/pages/guoxue/reader?id=' + id })
  },

  toggleFav(e) {
    const { id } = e.currentTarget.dataset
    const favs = store.get('favs', [])
    const i = favs.indexOf(id)
    if (i >= 0) favs.splice(i, 1); else favs.push(id)
    store.set('favs', favs)
    this.setData({ favs })
    wx.showToast({ title: i >= 0 ? '已取消收藏' : '已收藏', icon: 'none' })
  }
})
