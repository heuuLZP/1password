# GitHub Actions 工作流说明

本项目包含两个GitHub Actions工作流配置文件：

## 🚀 CI/CD Pipeline (`ci.yml`)

**触发条件：**
- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支提交Pull Request

**功能：**
1. **构建和测试** - 在多个Node.js版本（18.x, 20.x）上构建项目
2. **代码质量检查** - 进行TypeScript类型检查和依赖安全检查
3. **自动部署** - 当代码推送到main分支时，自动部署到GitHub Pages

## 📋 使用说明

### 启用GitHub Pages部署
如果你想使用自动部署到GitHub Pages功能，需要：

1. 进入仓库的 **Settings** > **Pages**
2. 在 **Source** 中选择 **GitHub Actions**
3. 确保你的仓库是公开的，或者有GitHub Pro/Team账户

### 自定义配置

你可以根据项目需要修改以下配置：

- **Node.js版本**: 在 `ci.yml` 中修改 `matrix.node-version`
- **分支策略**: 修改 `on.push.branches` 和 `on.pull_request.branches`
- **部署目标**: 如果不需要GitHub Pages部署，可以删除 `deploy` job

### 添加代码质量工具

如果你的项目使用了以下工具，可以取消相应的注释：

```yaml
# ESLint检查
- name: 运行ESLint
  run: pnpm exec eslint src/ --ext .ts,.tsx

# Prettier格式检查
- name: 检查代码格式
  run: pnpm exec prettier --check "src/**/*.{ts,tsx,js,jsx}"

# 单元测试
- name: 运行测试
  run: pnpm test
```

## 🔍 工作流状态

工作流运行状态可以在仓库的 **Actions** 标签页中查看。每次推送代码或创建PR时，相应的工作流会自动运行。 