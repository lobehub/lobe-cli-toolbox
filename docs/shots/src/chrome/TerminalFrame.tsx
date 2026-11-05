import type { CSSProperties, ReactNode } from 'react';

type TerminalFrameProps = {
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
};

/**
 * Dark near-opaque terminal chrome.
 * Title bar shares the window fill — traffic lights only, no title text.
 * Colors/radius/shadow/font come from Lobe UI CSS variables in styles.css.
 */
export function TerminalFrame({ children, style, bodyStyle }: TerminalFrameProps) {
  return (
    <div className="terminal-window" style={style}>
      <div aria-hidden className="terminal-titlebar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
      </div>
      <div className="terminal-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}
