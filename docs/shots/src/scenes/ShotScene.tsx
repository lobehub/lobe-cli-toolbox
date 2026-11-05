import { ThemeScope } from '@lobehub/ui';
import { Grainient } from '@lobehub/ui/awesome';
import { useEffect, useState } from 'react';

import { TerminalFrame } from '../chrome/TerminalFrame';
import { AnsiTerminal } from '../lib/ansiToTerminal';

type ShotSceneProps = {
  src: string;
  shotId: string;
};

export function ShotScene({ src, shotId }: ShotSceneProps) {
  const [ansi, setAnsi] = useState<string>('');

  useEffect(() => {
    const ac = new AbortController();
    setAnsi('');
    fetch(src, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${src}`);
        return r.text();
      })
      .then((text) => {
        setAnsi(text);
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        console.error('failed to load ansi', src, err);
      });
    return () => {
      ac.abort();
    };
  }, [src]);

  return (
    <ThemeScope appearance="dark" primaryColor="purple">
      <div className="shot-stage" data-ready={ansi ? '1' : '0'} data-shot={shotId}>
        <div aria-hidden className="shot-bg">
          <Grainient
            grainAmount={0.06}
            noiseScale={0.4}
            rotationAmount={120}
            timeSpeed={0}
            warpAmplitude={80}
            warpStrength={0.35}
            zoom={1.75}
          />
        </div>
        <div className="shot-frame-wrap">
          <TerminalFrame>
            {ansi ? (
              <AnsiTerminal ansi={ansi} />
            ) : (
              <span style={{ opacity: 0.5 }}>Loading ANSI…</span>
            )}
          </TerminalFrame>
        </div>
      </div>
    </ThemeScope>
  );
}
