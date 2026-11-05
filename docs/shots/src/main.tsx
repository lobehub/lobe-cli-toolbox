import '@lobehub/ui/theme.css';
import '@lobehub/ui/style.css';
import '@lobehub/ui/css/awesome/Grainient.css';
import './styles.css';

import { ConfigProvider, setLobeTheme } from '@lobehub/ui';
import { motion } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { installShotCaptureHook } from './lib/captureShot';

/**
 * Grainient uses WebGL with preserveDrawingBuffer:false by default.
 * SnapDOM reads canvases via toDataURL inside rAF; headless / late capture
 * still often gets an empty buffer. Force preserve so DOM→PNG keeps the bg.
 */
(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type: string, attrs?: any) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      const next = { ...attrs, preserveDrawingBuffer: true };
      return orig.call(this, type, next);
    }
    return orig.call(this, type as any, attrs);
  } as typeof HTMLCanvasElement.prototype.getContext;
})();

setLobeTheme({ appearance: 'dark', primaryColor: 'purple' });
installShotCaptureHook();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider cdn="aliyun" motion={motion}>
      <App />
    </ConfigProvider>
  </StrictMode>,
);
