import LiveInkTerminal from './LiveInkTerminal';

export interface XtermPreviewProps {
  ansi: string;
  /** @deprecated Captions removed; ignored. */
  caption?: string;
  cols?: number;
  rows?: number;
  title?: string;
}

/** Legacy static entry point shares the tested screen/protocol separation. */
export default function XtermPreview({ ansi, cols = 80, rows = 24 }: XtermPreviewProps) {
  return <LiveInkTerminal ansi={ansi} cols={cols} demoId="static-ansi" rows={rows} />;
}
