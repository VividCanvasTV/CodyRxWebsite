import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        compounding: resolve(__dirname, 'services/compounding/index.html'),
      },
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          minSize: 20000,
          groups: [
            {
              name: 'map-vendor',
              test: /node_modules[\\/](?:@react-three|three|postprocessing|@dimforge|d3-|topojson|us-atlas)/,
              priority: 30,
            },
            {
              name: 'motion-vendor',
              test: /node_modules[\\/]framer-motion/,
              priority: 20,
            },
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler)/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  server: {
    host: true,
  },
})
