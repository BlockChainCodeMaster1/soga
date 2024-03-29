import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// add package @types/node
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    proxy: {
      "/api": {
        target: "http://13.212.236.185:8166/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  // import.meta.env.xx
  envPrefix: 'DAPP',
  build: {
    // sourcemap: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Error: Can't find stylesheet to import.
        // @import 'src/style/index.scss';
        // @notice: "@import './xx/xx/xx.scss';"
        // additionalData: "@import './src/style/global.less';"
      }
    }
  },
  define: {
    'process.env': process.env
  }
})
