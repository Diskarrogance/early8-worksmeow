# 开发环境搭建

---

## 前置条件

| 工具 | 版本 | 确认 |
|------|------|------|
| Node.js | ≥ 22.x | `node -v` |
| npm | ≥ 10.x | `npm -v` |
| Git | ≥ 2.40 | `git -v` |

当前开发机已验证环境：

```powershell
PS> node -v       # v22.21.1
PS> npm -v        # 10.x (捆绑)
PS> git -v        # git version 2.47.1
```

---

## 克隆与安装

```bash
git clone https://github.com/Diskarrogance/early8-agent-desktop.git
cd early8-agent-desktop
npm install
```

> **注意**：`postinstall` 脚本会调用 `electron-builder install-app-deps`，可能下载 Electron 二进制。如网络受限，设置代理：
>
> ```bash
> npm config set proxy http://127.0.0.1:7892
> npm config set https-proxy http://127.0.0.1:7892
> ```

---

## 开发启动

```bash
# 同时启动 main process 和 renderer（Vite HMR）
npm run dev
```

这会启动两个 watch 进程：
- `tsc -p tsconfig.main.json --watch` → 编译 Main Process / Engine (CommonJS → `dist/main/`)
- `vite` → 编译 Renderer (ESModule HMR → `dist/renderer/`)

然后在另一个终端启动 Electron：

```bash
# 开发模式（加载 Vite dev server）
NODE_ENV=development npx electron .
```

或者直接一步到位（需要等 Vite 先就绪）：

```bash
npm run dev
# 新终端:
npx electron .
```

---

## 生产构建

```bash
npm run build          # tsc + vite build
npm run start          # electron .
```

安装包打包：

```bash
npx electron-builder --win
# 输出目录: release/
```

---

## 常见问题

### npm install 报错

```
gyp: XXXX ... node-gyp rebuild ...
```

Electron 原生模块需要平台二进制。尝试：

```bash
npm install --ignore-scripts
npx electron-builder install-app-deps
```

### Vite 端口冲突

Vite 默认 `5173`，改 `vite.config.ts`：
```typescript
server: { port: 3000 }
```

### Electron 窗口全白

确认 `NODE_ENV=development` 时 Vite 是否已在运行。关闭所有 electron 进程重试。

---

## 项目脚本参考

| 命令 | 用途 |
|------|------|
| `npm run dev` | 并行编译 main + renderer（watch） |
| `npm run dev:main` | 仅编译 main process（watch） |
| `npm run dev:renderer` | 仅启动 Vite dev server |
| `npm run build` | 生产构建（tsc + vite） |
| `npm run start` | 启动 Electron |
| `npx electron .` | 同上，可用 `NODE_ENV=development` |
| `npm run postinstall` | 安装 Electron 原生模块 |
