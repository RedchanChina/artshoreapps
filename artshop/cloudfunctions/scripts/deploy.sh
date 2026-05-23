#!/bin/bash

set -e

ENV_ID=${1:-""}
FUNCTIONS_DIR="$(cd "$(dirname "$0")/.." && pwd)/cloudfunctions"
FUNCTIONS=("user" "artwork" "artist" "order" "payment" "community" "store")

if [ -z "$ENV_ID" ]; then
  echo "用法: ./deploy.sh <环境ID> [函数名]"
  echo ""
  echo "示例:"
  echo "  ./deploy.sh artshop-xxxxx          # 部署所有云函数"
  echo "  ./deploy.sh artshop-xxxxx user     # 仅部署 user 云函数"
  echo ""
  echo "可用函数: ${FUNCTIONS[*]}"
  exit 1
fi

echo "=== ArtShop 云函数部署 ==="
echo "环境ID: $ENV_ID"
echo ""

if ! command -v tcb &> /dev/null; then
  echo "正在安装 CloudBase CLI..."
  npm install -g @cloudbase/cli
fi

tcb login

DEPLOY_TARGET=${2:-""}

deploy_function() {
  local func_name=$1
  local func_dir="$FUNCTIONS_DIR/$func_name"

  if [ ! -d "$func_dir" ]; then
    echo "✗ 函数目录不存在: $func_dir"
    return 1
  fi

  echo "→ 部署 $func_name ..."

  if [ ! -d "$func_dir/node_modules" ]; then
    echo "  安装依赖..."
    (cd "$func_dir" && npm install --production)
  fi

  tcb fn deploy "$func_name" --envId "$ENV_ID" --dir "$func_dir"

  echo "✓ $func_name 部署完成"
  echo ""
}

if [ -n "$DEPLOY_TARGET" ]; then
  if [[ " ${FUNCTIONS[*]} " =~ " ${DEPLOY_TARGET} " ]]; then
    deploy_function "$DEPLOY_TARGET"
  else
    echo "✗ 未知函数: $DEPLOY_TARGET"
    echo "可用函数: ${FUNCTIONS[*]}"
    exit 1
  fi
else
  for func in "${FUNCTIONS[@]}"; do
    deploy_function "$func"
  done
fi

echo "=== 部署完成 ==="
echo ""
echo "后续步骤:"
echo "  1. 运行数据库初始化: node cloudfunctions/scripts/init-db.js"
echo "  2. 更新前端 ENV_ID: 修改 src/api/cloudbase.ts 中的 ENV_ID"
echo "  3. 在 CloudBase 控制台配置安全域名"
