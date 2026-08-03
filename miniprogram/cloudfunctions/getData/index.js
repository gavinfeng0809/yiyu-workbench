/* 云函数 getData：返回最新内容数据包
   数据维护方式：云数据库集合 yiyu_data 中更新文档 { _id:'latest', version: n, payload: {...} }
   用 wx.cloud.callFunction 在控制台或管理端更新内容，用户端启动时自动拉取 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const res = await db.collection('yiyu_data').doc('latest').get()
    const data = res.data || {}
    return {
      version: data.version || 0,
      updated: data.updated || '',
      payload: data.payload || {}
    }
  } catch (e) {
    // 集合或文档不存在 → 返回版本 0，客户端使用内置数据
    return { version: 0, updated: '', payload: {} }
  }
}
