import { render as inkRender, type RenderOptions } from 'ink';
import type { ReactNode } from 'react';

const render = (children: ReactNode, options?: RenderOptions) => inkRender(children, options);

export default render;
