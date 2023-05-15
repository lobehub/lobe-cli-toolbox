import { createGlobalStyle } from 'antd-style'

const GlobalStyle = createGlobalStyle`body {
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: ${({ theme }) => theme.fontSize};
  color: ${({ theme }) => theme.colorTextBase};
  background: ${({ theme }) => theme.colorBgBase};
}
`

export default GlobalStyle
