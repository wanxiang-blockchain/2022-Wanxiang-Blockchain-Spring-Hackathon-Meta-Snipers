import { defineConfig } from 'umi';
import routes from './routes';
import proxy from './proxy';
import postCssPxToViewport from 'postcss-px-to-viewport';
export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  define: {
    'process.env.MetaForestEnv': process.env.MetaForestEnv,
  },
  proxy,
  routes: routes,
  antd: { mobile: false },
  extraPostCSSPlugins: [
    postCssPxToViewport({
      viewportWidth: 750,
    }),
  ],
});
