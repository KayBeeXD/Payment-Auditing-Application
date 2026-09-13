import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Payment-Auditing-Application/', // Explicit base for https://kaybeexd.github.io/Payment-Auditing-Application/
})
