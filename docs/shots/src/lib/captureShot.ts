import { snapdom } from '@zumer/snapdom';

export type ShotCaptureResult = {
  ok: true;
  engine: 'snapdom';
  mime: 'image/png';
  base64: string;
  width: number;
  height: number;
  warnings: Array<{ code: string; message: string }>;
} | {
  ok: false;
  engine: 'snapdom';
  error: string;
};

const SCALE = 3;

function canvasHasPixels(canvas: HTMLCanvasElement): boolean {
  try {
    const w = Math.min(canvas.width || 0, 64);
    const h = Math.min(canvas.height || 0, 64);
    if (w < 2 || h < 2) return false;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const data = ctx.getImageData(0, 0, w, h).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i]! > 0) return true;
      }
      return false;
    }
    // WebGL: try readPixels via existing context
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('webgl2') as WebGLRenderingContext | null);
    if (!gl) return false;
    const pixels = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels[3]! > 0 || pixels[0]! + pixels[1]! + pixels[2]! > 0;
  } catch {
    return false;
  }
}

async function waitForGrainient(el: HTMLElement, timeoutMs = 5000) {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const canvases = [...el.querySelectorAll('canvas')];
    if (canvases.length > 0 && canvases.every((c) => canvasHasPixels(c))) {
      // one extra frame so SnapDOM's in-rAF readback sees content
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return true;
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }
  return false;
}

/**
 * Capture `.shot-stage` / [data-shot] via SnapDOM (in-page DOM→PNG).
 * scale:3 + dpr:1 ≈ previous Playwright deviceScaleFactor:3, but layout stays at CSS 1×.
 */
export async function captureShotWithSnapdom(
  el: HTMLElement,
  opts?: { scale?: number },
): Promise<ShotCaptureResult> {
  const scale = opts?.scale ?? SCALE;
  try {
    const painted = await waitForGrainient(el);
    if (!painted) {
      console.warn('[shots] Grainient canvas still empty after wait; capturing anyway');
    }

    const result = await snapdom(el, {
      scale,
      dpr: 1,
      embedFonts: true,
      reconcile: true,
      outerShadows: true,
      outerTransforms: true,
      invalidate: true,
      backgroundColor: null,
      debug: true,
    });

    const warnings = (result.warnings || []).map((w) => ({
      code: String(w.code ?? 'warn'),
      message: String(w.message ?? ''),
    }));

    const canvas = await result.toCanvas();
    const width = canvas.width;
    const height = canvas.height;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    );
    if (!blob) {
      return { ok: false, engine: 'snapdom', error: 'canvas.toBlob returned null' };
    }

    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const base64 = btoa(binary);

    return {
      ok: true,
      engine: 'snapdom',
      mime: 'image/png',
      base64,
      width,
      height,
      warnings,
    };
  } catch (err) {
    return {
      ok: false,
      engine: 'snapdom',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

declare global {
  interface Window {
    __shotsCapture?: (selector?: string) => Promise<ShotCaptureResult>;
  }
}

/** Expose for Playwright `page.evaluate(() => window.__shotsCapture())`. */
export function installShotCaptureHook() {
  window.__shotsCapture = async (selector = '[data-shot]') => {
    const el = document.querySelector(selector);
    if (!(el instanceof HTMLElement)) {
      return { ok: false, engine: 'snapdom', error: `missing element ${selector}` };
    }
    return captureShotWithSnapdom(el);
  };
}
