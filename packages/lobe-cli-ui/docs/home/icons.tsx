import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function baseProps({ size = 16, ...props }: IconProps) {
  return {
    'fill': 'none' as const,
    'height': size,
    'stroke': 'currentColor',
    'strokeLinecap': 'round' as const,
    'strokeLinejoin': 'round' as const,
    'strokeWidth': 1.75,
    'viewBox': '0 0 24 24',
    'width': size,
    'aria-hidden': true as const,
    ...props,
  };
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function Github(props: IconProps) {
  return (
    <svg {...baseProps({ ...props, strokeWidth: props.strokeWidth ?? 1.5 })}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3.2-.4 6.5-1.6 6.5-7.2a5.6 5.6 0 0 0-1.5-3.9 5.2 5.2 0 0 0-.1-3.9s-1.2-.4-4 1.5a13.5 13.5 0 0 0-7 0c-2.8-1.9-4-1.5-4-1.5a5.2 5.2 0 0 0-.1 3.9A5.6 5.6 0 0 0 2 7.6c0 5.6 3.3 6.8 6.5 7.2a4.8 4.8 0 0 0-1 3.2v4" />
      <path d="M9 18c-4.5 1.5-4.5-2.2-6.5-3" />
    </svg>
  );
}

export function GitCommitHorizontal(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M3 12h6" />
      <path d="M15 12h6" />
    </svg>
  );
}

export function Languages(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Tags(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M13.2 3H6a3 3 0 0 0-3 3v7.2a3 3 0 0 0 .9 2.1l7.8 7.8a2 2 0 0 0 2.8 0l7.1-7.1a2 2 0 0 0 0-2.8z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

export function Blocks(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
    </svg>
  );
}

export function Workflow(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect height="8" rx="2" width="8" x="3" y="3" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect height="8" rx="2" width="8" x="13" y="13" />
    </svg>
  );
}

export function Keyboard(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="M6 8h.001" />
      <path d="M10 8h.001" />
      <path d="M14 8h.001" />
      <path d="M18 8h.001" />
      <path d="M8 12h.001" />
      <path d="M12 12h.001" />
      <path d="M16 12h.001" />
      <path d="M7 16h10" />
    </svg>
  );
}

export function ListTodo(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect height="6" rx="1" width="6" x="3" y="5" />
      <path d="m3 17 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}

export function Terminal(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 19h8" />
      <path d="m4 17 6-6-6-6" />
    </svg>
  );
}

export function Package(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M11 21.7a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
