import PackageJson from '@/../package.json'
import { useAppStore } from '@/store'
import { GithubOutlined } from '@ant-design/icons'
import { Button, Dropdown, Space } from 'antd'
import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { shallow } from 'zustand/shallow'
import Logo from './Logo'
import { ThemeList, themeIcon } from './style'

/******************************************************
 *********************** Style *************************
 ******************************************************/
const View = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 46px;
  padding: 16px 24px;

  background: ${({ theme }) => theme.colorBgContainer};
  border-bottom: 1px solid ${({ theme }) => theme.colorBorderSecondary};
`

/******************************************************
 ************************* Dom *************************
 ******************************************************/

interface HeaderProps {
  children?: ReactNode
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const [themeMode, onSetThemeMode] = useAppStore((st) => [st.themeMode, st.onSetThemeMode], shallow)

  return (
    <>
      <View>
        <Logo />
        <Space>
          {children}
          <a href={PackageJson.repository.url} target="_blank" rel="noreferrer">
            <Button icon={<GithubOutlined />} />
          </a>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: ThemeList({ onSetThemeMode }),
            }}
          >
            <Button icon={themeIcon[themeMode]} />
          </Dropdown>
        </Space>
      </View>
    </>
  )
}

export default React.memo(Header)
