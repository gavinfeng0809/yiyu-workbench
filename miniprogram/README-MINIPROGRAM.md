# 一隅 · 微信小程序版 — 部署与使用说明

「一隅工作台」微信小程序版：记账 / 国学经典（四书五经+唐诗全文拼音）/ 幼儿启蒙 / 英语学习（210词+音标+错题本）。
采用**微信云开发**架构，内容数据可通过云端热更新，**无需重新发版**。

---

## 一、前置准备（一次性，约 15 分钟）

1. **注册小程序**：微信公众平台 https://mp.weixin.qq.com → 立即注册 → 小程序 → 个人主体（免费，需身份证+手机号）
2. **获取 AppID**：登录后「设置 → 基本设置 → 账号信息」复制 AppID
3. **下载开发者工具**：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

---

## 二、导入项目

1. 打开微信开发者工具 → 导入项目
2. 项目目录选择本文件夹 `miniprogram/`
3. AppID 填你自己的 AppID（不要用测试号）
4. 导入后等待编译，预览版即可使用（无需发布）

## 三、开通云开发（数据热更新 + 语音必需）

1. 开发者工具顶部点「云开发」按钮 → 开通（个人版免费，有免费额度）
2. 记下**环境 ID**（形如 `yiyu-xxxxx`）
3. 打开 `miniprogram/app.js`，把 `YOUR-CLOUD-ENV-ID` 换成你的环境 ID

## 四、部署云函数

1. 开发者工具左侧文件树 → `cloudfunctions` 目录
2. **右键 `getData`** → 「上传并部署：云端安装依赖」→ 等待完成
3. **右键 `tts`** → 「上传并部署：云端安装依赖」（首次会安装 tencentcloud sdk，稍慢）
4. 创建云数据库集合：云开发控制台 → 数据库 → 新建集合 `yiyu_data`

## 五、配置 TTS 语音（腾讯云）

1. 开通腾讯云「语音合成」服务：https://console.cloud.tencent.com/tts （有免费额度）
2. 在腾讯云控制台「访问管理 → API密钥管理」创建密钥，得到 SecretId / SecretKey
3. 云开发控制台 → 云函数 → `tts` → 配置 → 环境变量，添加：
   - `TENCENT_SECRET_ID` = 你的 SecretId
   - `TENCENT_SECRET_KEY` = 你的 SecretKey
4. 云开发控制台 → 存储 → 新建存储桶 `tts-cache`

## 六、内容热更新（日常维护核心）

**修改内容不需要重新发布小程序**，只需更新云数据库：

1. 打开云开发控制台 → 数据库 → `yiyu_data` 集合
2. 新建一条记录：`_id` 填 `latest`，字段：
   ```json
   {
     "_id": "latest",
     "version": 1,
     "updated": "2026-08-03",
     "payload": {
       "classics": { "新书id": { "title": "...", "author": "...", "cat": "四书", "seal": "X", "color": "#xxxxxx", "intro": "...", "lines": [{"t":"原文","p":"拼音"}] } },
       "words": { "新分类": { "name": "...", "color": "#xxxxxx", "list": [["word","/phon/","释义","例句"]] } }
     }
   }
   ```
3. **version 必须比上次大**（如上次是 1，这次填 2）
4. 用户下次打开小程序 → 自动检测 → 提示「内容已更新 v2」

> 内置基线数据：国学 12 部经典 + 英语 210 词 + 音标 44 个 + 幼儿 40 汉字，已打包在小程序内，云端更新会增量覆盖。

## 七、数据存储键（与 Web 版一致，前缀 yiyu_）

| 键 | 用途 |
|----|------|
| `yiyu_theme` | 亮/暗主题 |
| `yiyu_expenses` | 记账记录数组 |
| `yiyu_favs` | 国学收藏 id 数组 |
| `yiyu_gxFont` | 阅读字号 |
| `yiyu_kids` | 幼儿已学 key 数组 |
| `yiyu_en` | 已掌握单词数组 |
| `yiyu_errbook` | 错题本数组 |
| `yiyu_dver` | 云端数据版本号 |

## 八、目录结构

```
miniprogram/
├── app.js / app.json / app.wxss    全局入口、路由、主题
├── project.config.json             开发者工具配置（AppID 需替换）
├── pages/
│   ├── home/       首页（日期+每日一句+快捷入口+学习概览）
│   ├── money/      记账（月汇总+表单+明细）
│   ├── guoxue/     国学（分类列表）
│   ├── guoxue/reader/  阅读器（拼音对照+字号+朗读）
│   ├── kids/       幼儿启蒙（汉字翻卡+数字+颜色+拼音）
│   ├── english/    英语（每日一词+翻卡）
│   ├── phonetics/  音标（44音素）
│   └── errorbook/  错题本（复习/删除/清空）
├── data/           内置数据（classics_data.js / english_data.js / kids_data.js）
├── utils/          工具（store 存储 / tts 语音 / util 工具）
└── cloudfunctions/ 云函数（getData 热更新 / tts 语音合成）
```

## 九、常见问题

- **语音没声音**：确认云函数 `tts` 已部署 + 环境变量已配置 + 存储桶 `tts-cache` 已创建；首次合成需几秒
- **没提示内容更新**：确认 `yiyu_data` 集合存在且 `_id=latest` 记录 version 大于本地
- **编译报 AppID 错误**：project.config.json 里 `appid` 换成你的
- **分包体积**：当前数据约 200KB，远低于 2MB 限制，无需分包
