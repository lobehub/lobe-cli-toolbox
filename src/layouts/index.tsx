import { Header } from '@/components'
import { useAppStore } from '@/store'
import { ThemeProvider, setupStyled } from 'antd-style'
import 'antd/dist/reset.css'
import styled, { ThemeContext } from 'styled-components'
import { Outlet } from 'umi'
import { shallow } from 'zustand/shallow'
import GlobalStyle from './GlobalStyle'

/******************************************************
 *********************** Style *************************
 ******************************************************/

const View = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100vw;
  height: 100vh;
`

const Content = styled.div`
  position: relative;

  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;

  width: 100vw;
`

/******************************************************
 ************************* Dom *************************
 ******************************************************/

const Layout: React.FC = () => {
  const [themeMode] = useAppStore((st) => [st.themeMode], shallow)
  setupStyled({ ThemeContext })
  return (
    <ThemeProvider themeMode={themeMode}>
      <GlobalStyle />
      <View>
        <Header />
        <Content>
          <Outlet />
        </Content>
      </View>
    </ThemeProvider>
  )
}

export default Layout
