declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

interface Window {
  WebViewJavascriptBridge: any;
  WVJBCallbacks: any;
  MetaForestEnv: 'local' | 'dev' | 'test' | 'prod';
  __META_FOREST_BRIDGE__: any;
}

interface ResultWrapper<T> {
  code: string;
  msg: string;
  data: T;
}

interface ResponseResult {
  data: any;
  error: any;
}

declare module 'postcss-px-to-viewport';
