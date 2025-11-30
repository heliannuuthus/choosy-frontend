# Husky Git Hooks

这个目录包含了项目的 Git hooks 配置，使用 [husky](https://typicode.github.io/husky/) 来管理。

## 配置说明

### pre-commit Hook

在提交代码前会自动运行以下检查：

1. **代码格式化**: 使用 Prettier 自动格式化暂存区中的代码文件
2. **支持的文件类型**: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.scss`, `.md`

### 使用方法

#### 初始化 Husky

首次安装依赖后，运行：

```bash
pnpm run prepare
```

或者手动运行：

```bash
npx husky install
```

#### 跳过 Pre-commit Hook

如果需要跳过 pre-commit 检查（紧急情况），可以使用：

```bash
git commit --no-verify -m "commit message"
```

## lint-staged 配置

在 `package.json` 中配置了 `lint-staged`：

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

这意味着：
- 只对暂存区（staged）中的文件进行格式化
- 不会影响工作目录中未暂存的文件
- 格式化失败会阻止提交

## 故障排除

### Hook 不生效

1. 确保已运行 `pnpm run prepare`
2. 检查 `.husky/pre-commit` 文件是否有执行权限
3. 确认依赖已正确安装

### 跳过检查

如果遇到问题，可以暂时跳过：

```bash
git commit --no-verify
```

### 手动格式化

```bash
# 检查格式
pnpm run format:check

# 自动格式化
pnpm run format
```
