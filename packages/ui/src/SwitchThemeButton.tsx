import { Button, YStack } from 'tamagui'
import { useThemeSetting } from './theme-logic'
import { Moon, Sun } from '@tamagui/lucide-icons'

export const SwitchThemeButton = () => {
  const { current, toggle, setTheme } = useThemeSetting()
  const isDark = current === 'dark'

  return (
      <Button 
        size="$4"
        theme={isDark ? 'light' : 'dark'}
        onPress={toggle}
        icon={isDark ? Sun : Moon}
      >
        {isDark ? 'Light' : 'Dark'} mode ({current})
      </Button>
  )
}
