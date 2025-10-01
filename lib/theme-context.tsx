"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeColors {
  primary: string
  background: string
}

interface FontSettings {
  family: string
  size: number
}

interface ThemeContextType {
  mode: ThemeMode
  colors: ThemeColors
  fonts: FontSettings
  effectiveTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  setColors: (colors: Partial<ThemeColors>) => void
  setFonts: (fonts: Partial<FontSettings>) => void
  resetToDefaults: () => void
  isLoading: boolean
}

const defaultColors: ThemeColors = {
  primary: '#2563eb',
  background: '#ffffff'
}

const defaultFonts: FontSettings = {
  family: 'Inter, system-ui, -apple-system, sans-serif',
  size: 14
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper function to save to database
const saveThemeToDatabase = async (themeData: {
  primaryColor: string
  backgroundColor: string
  fontFamily: string
  fontSize: number
  isDarkMode: boolean
}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await fetch('/api/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'theme',
        data: themeData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to save theme to database:', error);
    return false;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [colors, setColors] = useState<ThemeColors>(defaultColors)
  const [fonts, setFonts] = useState<FontSettings>(defaultFonts)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from localStorage on mount
  useEffect(() => {
    const loadTheme = () => {
      try {
        // Load mode
        const savedMode = localStorage.getItem('theme-mode') as ThemeMode
        if (savedMode) {
          setMode(savedMode)
        }

        // Load colors
        const savedColors = localStorage.getItem('theme-colors')
        if (savedColors) {
          const parsedColors = JSON.parse(savedColors)
          setColors(parsedColors)
        }

        // Load fonts
        const savedFonts = localStorage.getItem('theme-fonts')
        if (savedFonts) {
          const parsedFonts = JSON.parse(savedFonts)
          setFonts(parsedFonts)
        }

        console.log('🎨 Theme loaded from localStorage')
      } catch (error) {
        console.error('Failed to load theme from localStorage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  // Determine effective theme based on mode
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (mode === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setEffectiveTheme(systemPrefersDark ? 'dark' : 'light')
      } else {
        setEffectiveTheme(mode)
      }
    }

    updateEffectiveTheme()

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateEffectiveTheme)
      return () => mediaQuery.removeEventListener('change', updateEffectiveTheme)
    }
  }, [mode])

  // Apply theme to document
  useEffect(() => {
    if (isLoading) return

    const applyTheme = () => {
      const root = document.documentElement
      
      // Apply dark/light class
      root.classList.remove('light', 'dark')
      root.classList.add(effectiveTheme)
      
      // Apply primary color
      if (colors.primary.startsWith('#')) {
        root.style.setProperty('--primary', colors.primary)
        root.style.setProperty('--color-primary', colors.primary)
        root.style.setProperty('--ring', colors.primary)
        root.style.setProperty('--color-ring', colors.primary)
      }
      
      // Apply background
      if (colors.background.startsWith('linear-gradient')) {
        document.body.style.background = colors.background
        root.style.setProperty('--background-gradient', colors.background)
      } else if (colors.background.startsWith('#')) {
        document.body.style.background = colors.background
        root.style.setProperty('--background', colors.background)
        root.style.setProperty('--color-background', colors.background)
      }
      
      // Apply fonts
      root.style.setProperty('--font-family', fonts.family)
      root.style.setProperty('--font-size', `${fonts.size}px`)
      document.body.style.fontFamily = fonts.family
      document.body.style.fontSize = `${fonts.size}px`
      
      console.log('🎨 Theme applied to document')
    }

    applyTheme()
  }, [mode, colors, fonts, effectiveTheme, isLoading])

  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
    
    // Save to database (background)
    const isDark = newMode === 'dark' || (newMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    saveThemeToDatabase({
      primaryColor: colors.primary,
      backgroundColor: colors.background,
      fontFamily: fonts.family,
      fontSize: fonts.size,
      isDarkMode: isDark
    })

    console.log('🎨 Mode updated:', newMode)
  }, [colors, fonts])

  const handleSetColors = useCallback((newColors: Partial<ThemeColors>) => {
    const updatedColors = { ...colors, ...newColors }
    setColors(updatedColors)
    localStorage.setItem('theme-colors', JSON.stringify(updatedColors))
    
    // Apply background immediately
    if (updatedColors.background) {
      document.body.style.background = updatedColors.background
      const pageContainers = document.querySelectorAll('[data-page]')
      pageContainers.forEach(container => {
        (container as HTMLElement).style.background = updatedColors.background
      })
    }
    
    // Save to database (background)
    saveThemeToDatabase({
      primaryColor: updatedColors.primary,
      backgroundColor: updatedColors.background,
      fontFamily: fonts.family,
      fontSize: fonts.size,
      isDarkMode: mode === 'dark'
    })

    console.log('🎨 Colors updated:', updatedColors)
  }, [colors, fonts, mode])

  const handleSetFonts = useCallback((newFonts: Partial<FontSettings>) => {
    const updatedFonts = { ...fonts, ...newFonts }
    setFonts(updatedFonts)
    localStorage.setItem('theme-fonts', JSON.stringify(updatedFonts))
    
    // Save to database (background)
    saveThemeToDatabase({
      primaryColor: colors.primary,
      backgroundColor: colors.background,
      fontFamily: updatedFonts.family,
      fontSize: updatedFonts.size,
      isDarkMode: mode === 'dark'
    })

    console.log('🎨 Fonts updated:', updatedFonts)
  }, [colors, fonts, mode])

  const resetToDefaults = useCallback(() => {
    setMode('system')
    setColors(defaultColors)
    setFonts(defaultFonts)
    
    localStorage.setItem('theme-mode', 'system')
    localStorage.setItem('theme-colors', JSON.stringify(defaultColors))
    localStorage.setItem('theme-fonts', JSON.stringify(defaultFonts))
    
    // Save to database (background)
    saveThemeToDatabase({
      primaryColor: defaultColors.primary,
      backgroundColor: defaultColors.background,
      fontFamily: defaultFonts.family,
      fontSize: defaultFonts.size,
      isDarkMode: false
    })

    console.log('🎨 Reset to defaults')
  }, [])

  return (
    <ThemeContext.Provider value={{
      mode,
      colors,
      fonts,
      effectiveTheme,
      setMode: handleSetMode,
      setColors: handleSetColors,
      setFonts: handleSetFonts,
      resetToDefaults,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}