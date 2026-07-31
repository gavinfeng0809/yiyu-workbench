# 一隅 · 个人工作台 — APK 构建指南

## 方案一：GitHub Actions 云端构建（推荐，零配置）

> 不需要在本机安装任何工具，全程在 GitHub 云端完成。

### 步骤

1. **在 GitHub 创建一个新仓库**（private 或 public 均可）

2. **将 `cordova/` 目录推送到仓库**
   ```bash
   cd cordova
   git init
   git add .
   git commit -m "一隅 workbench cordova project"
   git branch -M main
   git remote add origin https://github.com/你的用户名/yiyu-workbench.git
   git push -u origin main
   ```

3. **触发构建**
   - 进入仓库 → Actions 标签页
   - 选择 "Build Android APK" workflow
   - 点击 "Run workflow" → 选择 main 分支 → Run

4. **下载 APK**
   - 构建完成后（约 5-8 分钟）
   - 点击对应的 workflow run
   - 在页面底部 "Artifacts" 区域下载 `yiyu-workbench-apk`
   - 解压得到 `app-debug.apk`

5. **安装到手机**
   - 将 APK 传到手机（微信/QQ/U盘均可）
   - 手机上点击安装（需开启"允许未知来源"）
   - 完成！

---

## 方案二：本地构建

### 环境准备

#### 1. 安装 Java JDK 17
- 下载: https://adoptium.net/temurin/releases/?version=17
- 安装后设置环境变量:
  ```bash
  # Linux/Mac
  export JAVA_HOME=/path/to/jdk-17
  export PATH=$JAVA_HOME/bin:$PATH

  # Windows (PowerShell)
  [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.x.x", "User")
  $env:Path += ";$env:JAVA_HOME\bin"
  ```
- 验证: `java -version` 应显示 17.x

#### 2. 安装 Android SDK (Command-line tools only)
- 下载: https://developer.android.com/studio#command-line-tools-only
- 解压到 `~/Android/Sdk/`（或 `C:\Android\Sdk`）
- 设置环境变量:
  ```bash
  export ANDROID_HOME=~/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
  ```
- 安装 SDK 组件:
  ```bash
  sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
  ```
- 接受许可:
  ```bash
  yes | sdkmanager --licenses
  ```

#### 3. 安装 Cordova CLI
```bash
npm install -g cordova@latest
```
验证: `cordova --version`

### 构建步骤

```bash
# 进入 cordova 目录
cd personal-workbench/cordova

# 一键构建
bash build-apk.sh

# 或者分步执行：
bash build-apk.sh --prepare-only   # 仅准备 www/ 目录
cordova platform add android        # 添加 Android 平台
cordova build android               # 构建 APK
```

### 构建产物

APK 路径: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### 安装到手机

```bash
# USB 连接手机，开启 USB 调试
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

或直接将 APK 文件传到手机安装。

---

## 方案三：PWA 安装（最快，无需构建）

> 如果手机浏览器支持 PWA（Android Chrome / Edge），可以直接"安装"到桌面。

1. 将 `index.html` + `pinyin_data.js` + `manifest.json` + `sw.js` 上传到任何 HTTPS 静态托管
   - GitHub Pages（免费）
   - Cloudflare Pages（免费）
   - Vercel（免费）

2. 手机浏览器访问页面

3. 浏览器菜单 → "添加到主屏幕"

4. 桌面出现"一隅"图标，点击即可全屏运行，体验与原生 APP 一致

---

## 常见问题

### Q: 构建报错 "Could not find an installed version of Gradle"
A: Cordova 会自动下载 Gradle，确保网络畅通。如遇问题手动安装 Gradle 8.x。

### Q: 构建报错 "Failed to install the following Android SDK packages"
A: 运行 `sdkmanager --install "platforms;android-34" "build-tools;34.0.0"`

### Q: 语音朗读不工作
A: Android WebView 的 TTS 引擎取决于手机系统设置 → 辅助功能 → 文本转语音。确保已安装中文语音包。

### Q: APK 太大
A: debug APK 约 8-15MB。构建 release 版本更小:
```bash
cordova build android --release
```
（需要签名密钥，参考 Cordova 官方文档）

### Q: 图标怎么换
A: 在 `cordova/res/icon/android/` 下放入对应尺寸的 PNG 图标，重新构建即可。
