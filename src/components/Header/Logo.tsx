import { darkLogo, lightLogo } from '@/components/Header/style'
import { useThemeMode } from 'antd-style'
import React from 'react'

interface LogoProps {
  size?: number

  style?: React.CSSProperties
}

const Logo: React.FC<LogoProps> = ({ size = 20, style }) => {
  const { isDarkMode } = useThemeMode()
  return <img src={isDarkMode ? darkLogo : lightLogo} alt="logo" style={{ height: size, ...style }} />
}

export default React.memo(Logo)
