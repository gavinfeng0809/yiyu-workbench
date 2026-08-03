/* 工具函数 */
const WEEK = ['日', '一', '二', '三', '四', '五', '六']

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
/* WXML 已自动转义，无需手动 esc，保留空实现兼容 */

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function dayOfYear() {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d - start) / 86400000)
}

function fmtDate(ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function fmtMoney(n) {
  return Number(n).toFixed(2)
}

function toast(title, icon) {
  wx.showToast({ title: title || '', icon: icon || 'none', duration: 1600 })
}

module.exports = { WEEK, esc, todayStr, dayOfYear, fmtDate, fmtMoney, toast }
