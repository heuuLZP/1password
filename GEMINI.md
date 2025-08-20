# GEMINI.md

## Project Overview
## 项目概述

This project is a self-developed password management tool. It is a web-based application built with React, Vite, and TypeScript. The user interface is built with Ant Design, and styling is done with Less.
本项目是一个自研的密码管理工具。它是一个基于 React、Vite 和 TypeScript 构建的 Web 应用程序。用户界面使用 Ant Design 构建，样式使用 Less 完成。

The core functionality of the application is to provide a secure way to store and manage passwords. It uses AES-256-GCM for encryption and PBKDF2 for key derivation. All encryption and decryption happens locally in the browser, and the encrypted data is stored in the browser's local storage. The application is designed to be a purely local tool with no network communication.
该应用程序的核心功能是提供一种安全的方式来存储和管理密码。它使用 AES-256-GCM 进行加密，使用 PBKDF2 进行密钥派生。所有的加密和解密都在浏览器本地进行，加密后的数据存储在浏览器的本地存储中。该应用程序被设计成一个纯本地工具，没有网络通信。

## Building and Running
## 构建和运行

### Prerequisites
### 先决条件

- Node.js and pnpm
- Node.js 和 pnpm

### Development
### 开发

To start the development server, run:
要启动开发服务器，请运行：

```bash
pnpm install
pnpm start
```

This will start the development server on `http://localhost:3000`.
这将在 `http://localhost:3000` 上启动开发服务器。

### Building
### 构建

To build the application for production, run:
要为生产环境构建应用程序，请运行：

```bash
pnpm build
```

The production files will be generated in the `dist` directory.
生产文件将生成在 `dist` 目录中。

### Previewing the Production Build
### 预览生产版本

To preview the production build, run:
要预览生产版本，请运行：

```bash
pnpm preview
```

## Development Conventions
## 开发约定

### Code Style
### 代码风格

The project uses TypeScript and follows standard React best practices. The code is organized into components, and each component has its own module for styles (using Less modules).
该项目使用 TypeScript 并遵循标准的 React 最佳实践。代码被组织成组件，每个组件都有自己的样式模块（使用 Less 模块）。

### State Management
### 状态管理

The main application state is managed in the `App.tsx` component using the `useState` hook.
主应用程序状态在 `App.tsx` 组件中使用 `useState` 钩子进行管理。

### Encryption
### 加密

The encryption logic is encapsulated in `src/lib/crypto.ts` and the storage logic in `src/lib/storage.ts`. The application uses AES-256-GCM for encryption and PBKDF2 for key derivation.
加密逻辑封装在 `src/lib/crypto.ts` 中，存储逻辑封装在 `src/lib/storage.ts` 中。该应用程序使用 AES-256-GCM 进行加密，使用 PBKDF2 进行密钥派生。

### UI
### 用户界面

The user interface is built with Ant Design components. The main components are:
用户界面是使用 Ant Design 组件构建的。主要组件有：

- `LockScreen`: The screen for entering the master password.
- `LockScreen`: 用于输入主密码的屏幕。
- `Dashboard`: The main dashboard for managing passwords after unlocking the vault.
- `Dashboard`: 解锁保管库后用于管理密码的主仪表板。
- `EntryList`: A component for listing password entries.
- `EntryList`: 用于列出密码条目的组件。
- `PasswordEntry`: A component for viewing and editing a password entry.
- `PasswordEntry`: 用于查看和编辑密码条目的组件。
- `GroupManager`: A component for managing password groups.
- `GroupManager`: 用于管理密码组的组件。
- `ImportExport`: A component for importing and exporting the password vault.
- `ImportExport`: 用于导入和导出密码保管库的组件。
- `ChangePassword`: A component for changing the master password.
- `ChangePassword`: 用于更改主密码的组件。