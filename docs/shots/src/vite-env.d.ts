/// <reference types="vite/client" />

declare module '*.ansi?url' {
  const src: string;
  export default src;
}

declare module '*.ansi' {
  const src: string;
  export default src;
}
