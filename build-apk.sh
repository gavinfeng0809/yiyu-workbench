#!/usr/bin/env bash
# ================================================================
# 一隅 · 个人工作台 — APK 一键构建脚本
# 用法: bash build-apk.sh [--prepare-only]
# ================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
WWW_DIR="$SCRIPT_DIR/www"

echo "=========================================="
echo "  一隅 · 个人工作台 APK 构建"
echo "=========================================="
echo ""

# ---- 1. 检查依赖 ----
echo "[1/6] 检查构建环境..."

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "  [X] 未找到 $1"
    return 1
  fi
  echo "  [OK] $1: $(command -v "$1")"
  return 0
}

HAS_JAVA=true
HAS_CORDOVA=true
HAS_SDK=true

check_cmd java || HAS_JAVA=false
check_cmd cordova || HAS_CORDOVA=false

if [ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]; then
  echo "  [X] 未设置 ANDROID_HOME 环境变量"
  HAS_SDK=false
else
  echo "  [OK] ANDROID_HOME: ${ANDROID_HOME:-${ANDROID_SDK_ROOT}}"
fi

if [ "$HAS_JAVA" = false ] || [ "$HAS_CORDOVA" = false ] || [ "$HAS_SDK" = false ]; then
  echo ""
  echo "[!] 构建环境不完整，请先安装以下工具："
  [ "$HAS_JAVA" = false ]    && echo "    - Java JDK 17: https://adoptium.net/"
  [ "$HAS_CORDOVA" = false ] && echo "    - Cordova CLI: npm install -g cordova"
  [ "$HAS_SDK" = false ]     && echo "    - Android SDK: https://developer.android.com/studio#command-line-tools-only"
  echo ""
  echo "    设置环境变量："
  echo "    export ANDROID_HOME=/path/to/android-sdk"
  echo "    export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools"
  echo ""
  echo "    安装 SDK 组件："
  echo "    sdkmanager 'platform-tools' 'platforms;android-34' 'build-tools;34.0.0'"
  echo ""
  exit 1
fi

echo ""

# ---- 2. 准备 www/ 目录 ----
echo "[2/6] 准备 www/ 目录..."
rm -rf "$WWW_DIR"
mkdir -p "$WWW_DIR"

cp "$SRC_DIR/index.html" "$WWW_DIR/index.html"
cp "$SRC_DIR/pinyin_data.js" "$WWW_DIR/pinyin_data.js"

echo "  [OK] 已复制 index.html + pinyin_data.js 到 www/"
echo ""

# ---- 3. 适配 Cordova ----
echo "[3/6] 适配 Cordova WebView..."

INDEX="$WWW_DIR/index.html"

# 3a. 在 </head> 前插入 cordova.js
sed -i 's|</head>|<script src="cordova.js"></script>\n</head>|' "$INDEX"

# 3b. 删除 PWA manifest 和 apple-touch-icon（WebView 不需要）
sed -i '/<link rel="manifest"/d' "$INDEX"
sed -i '/<link rel="apple-touch-icon"/d' "$INDEX"

# 3c. 替换 init IIFE 为 deviceready 监听
# 原: (function init(){ ... })();
# 新: function initApp(){ ... }; document.addEventListener('deviceready', initApp, false);
# 兼容非 Cordova 环境（浏览器直接打开也工作）
sed -i 's|^(function init(){|function initApp(){|' "$INDEX"
sed -i 's|^  if(.serviceWorker. in navigator)|  /* PWA SW registration skipped in Cordova */|' "$INDEX"

# 替换结尾的 })(); 为 init 触发逻辑
# 使用 Perl 做多行替换更可靠
perl -i -0pe 's/\}\)\(\);\s*\n<\/script>/}\n  if(typeof cordova!=="undefined"){\n    document.addEventListener("deviceready",initApp,false);\n  }else{\n    initApp();\n  }\n<\/script>/' "$INDEX"

echo "  [OK] Cordova 适配完成"
echo ""

# ---- 4. 检查/添加 Android 平台 ----
echo "[4/6] 检查 Android 平台..."
cd "$SCRIPT_DIR"

if [ ! -d "platforms/android" ]; then
  echo "  添加 Android 平台..."
  cordova platform add android
  echo "  [OK] Android 平台已添加"
else
  echo "  [OK] Android 平台已存在"
fi
echo ""

# ---- 5. 如果只是准备，到此为止 ----
if [ "${1:-}" = "--prepare-only" ]; then
  echo "[5/6] --prepare-only 模式，跳过构建"
  echo ""
  echo "=========================================="
  echo "  准备完成！www/ 目录已就绪"
  echo "  运行 cordova build android 构建 APK"
  echo "=========================================="
  exit 0
fi

# ---- 6. 构建 APK ----
echo "[5/6] 构建 APK..."
cordova build android
echo ""
echo "[6/6] 构建完成！"
echo ""

# 找到 APK 文件
APK_PATH=$(find "platforms/android/app/build/outputs/apk" -name "*.apk" 2>/dev/null | head -1)
if [ -n "$APK_PATH" ]; then
  ABS_APK="$(cd "$(dirname "$APK_PATH")" && pwd)/$(basename "$APK_PATH")"
  echo "=========================================="
  echo "  APK 路径:"
  echo "  $ABS_APK"
  echo ""
  echo "  安装到手机:"
  echo "  adb install \"$ABS_APK\""
  echo "=========================================="
else
  echo "[!] 未找到 APK 文件，请检查构建日志"
  echo "    预期路径: platforms/android/app/build/outputs/apk/"
fi
