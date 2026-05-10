#!/bin/bash
# RPG-Todo 一键推送到 GitHub 脚本
# 在 rpg-todo 目录下的 Git Bash 里运行

set -e

REPO_NAME="rpg-todo"
GITHUB_USER="CZYI"

echo "================================================"
echo "  RPG 待办冒险 - GitHub Pages 部署脚本"
echo "================================================"
echo ""

# 1. 检查是否在正确目录
if [ ! -f "index.html" ]; then
  echo "❌ 请在 rpg-todo 目录下运行此脚本"
  exit 1
fi

# 2. 初始化 git（如果还没有）
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git 仓库已初始化"
fi

# 3. 设置主分支名为 main
git checkout -b main 2>/dev/null || git checkout main 2>/dev/null || true

# 4. 添加所有文件
git add .
echo "✅ 文件已暂存"

# 5. 提交
git commit -m "feat: RPG 待办冒险 v1.0 - 初始部署" 2>/dev/null || echo "（没有新变更需要提交）"

# 6. 提示用户创建 GitHub 仓库
echo ""
echo "================================================"
echo "  接下来需要你做一步："
echo "================================================"
echo ""
echo "  1. 打开浏览器访问："
echo "     https://github.com/new"
echo ""
echo "  2. 仓库名填写：$REPO_NAME"
echo "  3. 选择 Public（公开）"
echo "  4. 【不要】勾选 Initialize README"
echo "  5. 点击 Create repository"
echo ""
echo "  创建完成后，按回车继续..."
read -r

# 7. 添加远程并推送
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "✅ 远程仓库已添加"

git push -u origin main
echo ""
echo "✅ 代码已推送！"
echo ""

# 8. 提示开启 GitHub Pages
echo "================================================"
echo "  最后一步：开启 GitHub Pages"
echo "================================================"
echo ""
echo "  1. 访问：https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
echo "  2. Source 选择：GitHub Actions"
echo "  3. 保存"
echo ""
echo "  稍等 1-2 分钟，网站将上线于："
echo "  👉 https://$GITHUB_USER.github.io/$REPO_NAME/"
echo ""
echo "================================================"
echo "  🎉 部署完成！"
echo "================================================"
