/* 存储封装：Web localStorage → 小程序 storage（键前缀 yiyu_） */
const store = {
  get(k, d) {
    try {
      const v = wx.getStorageSync('yiyu_' + k)
      return v === '' || v === undefined || v === null ? d : v
    } catch (e) { return d }
  },
  set(k, v) {
    try { wx.setStorageSync('yiyu_' + k, v) } catch (e) {}
  },
  remove(k) {
    try { wx.removeStorageSync('yiyu_' + k) } catch (e) {}
  }
}
module.exports = store
