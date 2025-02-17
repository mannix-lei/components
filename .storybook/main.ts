import type { StorybookConfig } from '@storybook/web-components-vite';
import { argv } from 'node:process';

const devMode = !argv.includes('build');

const config: StorybookConfig = {
  stories: [
    './stories/**/*.stories.ts',
    '../packages/components/**/*.stories.ts'
  ],
  addons: [
    '@storybook/addon-a11y', 
    '@storybook/addon-actions', 
    '@storybook/addon-storysource',
    {
      name: '@storybook/addon-essentials',
      options: {
        actions: false,
        docs: false
      }
    }
  ],
  core: {
    disableTelemetry: true
  },
  framework: '@storybook/web-components-vite',
  docs: {
    autodocs: false
  },
  refs: {
    angular: {
      title: 'Angular',
      url: devMode ? 'http://localhost:6007' : '/angular/'
    }
  },
  staticDirs: [
    { from: '../packages/themes', to: '/themes' }
  ]
};

export default config;
