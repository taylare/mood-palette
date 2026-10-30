import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Change this to match your GitHub repository name.
// A site served at https://<username>.github.io/my-repo/ needs '/my-repo/' as its base.
const REPO_NAME = 'mood-palette';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use the repository sub-path only for production builds so local dev still runs at "/".
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
}));
