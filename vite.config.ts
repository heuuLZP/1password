import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { createStyleImportPlugin } from 'vite-plugin-style-import';

// 获取当前文件的目录路径
const __dirname = path.resolve(__dirname, 'src');

export default defineConfig({
  plugins: [
    react(),
    createStyleImportPlugin({
      libs: [
        {
          libraryName: 'antd',
          esModule: true,
          resolveStyle: (name) => {
            return `antd/es/${name}/style/index`;
          },
        },
      ],
    }),
  ],
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#7c4dff',
          'success-color': '#10b981',
          'warning-color': '#f59e0b',
          'error-color': '#ef4444',
          'info-color': '#3b82f6',
          'border-radius-base': '6px',
          'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)',
          'font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': __dirname
    }
  }
}); 