/* 记账：月度汇总 + 记账表单 + 明细列表 */
const app = getApp()
const store = require('../../utils/store.js')
const util = require('../../utils/util.js')

const OUT_CATS = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '教育', '其他']
const IN_CATS = ['工资', '奖金', '理财', '红包', '其他']

Page({
  data: {
    theme: 'light',
    monthStr: '',
    income: '0.00',
    expense: '0.00',
    balance: '0.00',
    list: [],
    /* 表单 */
    showForm: false,
    formType: 'out',
    outCats: OUT_CATS,
    inCats: IN_CATS,
    catIndex: 0,
    amount: '',
    note: '',
    date: ''
  },

  onShow() {
    this.setData({ theme: app.globalData.theme })
    this.refresh()
  },

  onThemeRefresh(t) { this.setData({ theme: t }) },

  refresh() {
    const now = new Date()
    const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
    const list = store.get('expenses', []).filter(e => (e.date || '').startsWith(ym)).sort((a, b) => (b.date + b.id) < (a.date + a.id) ? -1 : 1)
    let inc = 0, exp = 0
    list.forEach(e => { if (e.type === 'in') inc += Number(e.amount); else exp += Number(e.amount) })
    this.setData({
      monthStr: now.getFullYear() + '年' + (now.getMonth() + 1) + '月',
      income: util.fmtMoney(inc),
      expense: util.fmtMoney(exp),
      balance: util.fmtMoney(inc - exp),
      list: list.slice(0, 20),
      date: util.todayStr()
    })
  },

  openForm(e) {
    this.setData({ showForm: true, formType: e.currentTarget.dataset.type, catIndex: 0, amount: '', note: '' })
  },

  closeForm() { this.setData({ showForm: false }) },

  setType(e) { this.setData({ formType: e.currentTarget.dataset.type, catIndex: 0 }) },

  setCat(e) { this.setData({ catIndex: Number(e.currentTarget.dataset.i) }) },

  inputAmount(e) { this.setData({ amount: e.detail.value }) },
  inputNote(e) { this.setData({ note: e.detail.value }) },
  inputDate(e) { this.setData({ date: e.detail.value }) },
  noop() {},

  save() {
    const amount = parseFloat(this.data.amount)
    if (!amount || amount <= 0) { wx.showToast({ title: '请输入有效金额', icon: 'none' }); return }
    const cats = this.data.formType === 'in' ? IN_CATS : OUT_CATS
    const rec = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: this.data.formType,
      cat: cats[this.data.catIndex] || cats[0],
      amount,
      note: this.data.note,
      date: this.data.date
    }
    const list = store.get('expenses', [])
    list.push(rec)
    store.set('expenses', list)
    this.setData({ showForm: false })
    wx.showToast({ title: '已记录', icon: 'success' })
    this.refresh()
  },

  del(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '删除这笔记录？',
      success: r => {
        if (!r.confirm) return
        const list = store.get('expenses', []).filter(x => x.id !== id)
        store.set('expenses', list)
        this.refresh()
      }
    })
  }
})
