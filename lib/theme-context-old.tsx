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
  primary: '#2563eb', // blue-600
  background: '#ffffff'
}

const defaultFonts: FontSettings = {
  family: 'Inter, system-ui, -apple-system, sans-serif',
  size: 14
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [colors, setColors] = useState<ThemeColors>(defaultColors)
  const [fonts, setFonts] = useState<FontSettings>(defaultFonts)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from user preferences or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadThemeFromPreferences = () => {
      // Skip loading if user is currently updating to prevent overriding
      if (isUserUpdating) {
        console.log('🎨 Skipping theme load because user is updating');
        return;
      }
      
      // Skip loading if user updated recently (within 10 seconds)
      const timeSinceLastUpdate = Date.now() - lastUserUpdate;
      if (lastUserUpdate > 0 && timeSinceLastUpdate < 10000) {
        console.log('🎨 Skipping theme load because user updated recently:', timeSinceLastUpdate, 'ms ago');
        return;
      }
      
      // First try to load from user preferences
      if (preferences?.themeSettings) {
        const themeSettings = preferences.themeSettings;
        
        if (themeSettings.primaryColor && themeSettings.backgroundColor) {
          console.log('🎨 Loading theme from database:', themeSettings);
          setColors({
            primary: themeSettings.primaryColor,
            background: themeSettings.backgroundColor
          });
        }

        // Load fonts if available
        if (themeSettings.fontFamily || themeSettings.fontSize) {
          console.log('🎨 Loading fonts from database:', {
            family: themeSettings.fontFamily,
            size: themeSettings.fontSize
          });
          setFonts({
            family: themeSettings.fontFamily || defaultFonts.family,
            size: themeSettings.fontSize || defaultFonts.size
          });
        }
        
        if (themeSettings.isDarkMode !== undefined) {
          setMode(themeSettings.isDarkMode ? 'dark' : 'light');
        }
        
        setIsLoaded(true);
        return;
      }
      
      // Fallback to localStorage for backwards compatibility
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode
      const savedColors = localStorage.getItem('theme-colors')
      const savedFonts = localStorage.getItem('theme-fonts')
      
      if (savedMode || savedColors || savedFonts) {
        console.log('🎨 Loading theme from localStorage, will sync to database');
        
        let newMode = mode;
        let newColors = colors;
        let newFonts = fonts;
        
        if (savedMode) {
          newMode = savedMode;
          setMode(savedMode);
        }
        
        if (savedColors) {
          try {
            const parsedColors = JSON.parse(savedColors);
            newColors = parsedColors;
            setColors(parsedColors);
          } catch (e) {
            console.error('Failed to parse saved colors:', e)
          }
        }

        if (savedFonts) {
          try {
            const parsedFonts = JSON.parse(savedFonts);
            newFonts = parsedFonts;
            setFonts(parsedFonts);
          } catch (e) {
            console.error('Failed to parse saved fonts:', e)
          }
        }
        
        // Sync to database
        if (updateThemeSettings) {
          updateThemeSettings({
            primaryColor: newColors.primary,
            backgroundColor: newColors.background,
            fontFamily: newFonts.family,
            fontSize: newFonts.size,
            isDarkMode: newMode === 'dark'
          });
        }
      }
      
      // Mark as loaded after attempting to load from localStorage
      setIsLoaded(true);
    };

    // Load initially
    loadThemeFromPreferences();

    // Listen for login events to reload theme preferences
    const handleUserLogin = () => {
      console.log('🎨 Theme: User logged in, reloading theme preferences...');
      // Small delay to ensure preferences are available
      setTimeout(loadThemeFromPreferences, 100);
    };

    window.addEventListener('userLoggedIn', handleUserLogin);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, [preferences?.themeSettings, updateThemeSettings, isUserUpdating, lastUserUpdate]);

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

  // Apply theme to document - only after loading from localStorage
  useEffect(() => {
    if (!isLoaded) return; // Don't apply until loaded from localStorage
    
    // Wait for DOM to be ready
    const applyTheme = () => {
      const root = document.documentElement
      
      // Apply dark/light class
      root.classList.remove('light', 'dark')
      root.classList.add(effectiveTheme)
      
      // Convert hex to hsl for CSS variables
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };
      
      console.log('Applying theme colors:', colors);
      
      // Apply primary color
      if (colors.primary.startsWith('#')) {
        const hslPrimary = hexToHsl(colors.primary);
        root.style.setProperty('--primary', `hsl(${hslPrimary})`);
        root.style.setProperty('--color-primary', `hsl(${hslPrimary})`);
        // Also update ring color to match primary for focus states
        root.style.setProperty('--ring', `hsl(${hslPrimary})`);
        root.style.setProperty('--color-ring', `hsl(${hslPrimary})`);
      }
      
      // Handle background - support both solid colors and gradients
      if (colors.background.startsWith('linear-gradient')) {
        // For gradients, apply to body background and page containers
        document.body.style.background = colors.background;
        root.style.setProperty('--background-gradient', colors.background);
        root.style.setProperty('--color-background', 'transparent');
        
        console.log('Applied gradient background to body:', colors.background);
      } else if (colors.background.startsWith('#')) {
        // For solid colors, update CSS variables and all backgrounds
        const hslBackground = hexToHsl(colors.background);
        root.style.setProperty('--background', `hsl(${hslBackground})`);
        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--background-gradient', 'none');
        document.body.style.background = colors.background;
        
        console.log('Applied solid background to body:', colors.background);
      } else {
        // Default fallback - apply to body
        const defaultGradient = effectiveTheme === 'dark' 
          ? 'linear-gradient(135deg, #1e293b, #334155, #475569)'
          : 'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1)';
        document.body.style.background = defaultGradient;
        root.style.setProperty('--background-gradient', defaultGradient);
        
        console.log('Applied default gradient to body for', effectiveTheme, 'theme');
      }
      
      // Apply fonts to document
      console.log('Applying fonts:', fonts);
      root.style.setProperty('--font-family', fonts.family);
      root.style.setProperty('--font-size', `${fonts.size}px`);
      document.body.style.fontFamily = fonts.family;
      document.body.style.fontSize = `${fonts.size}px`;
      
      // Save to localStorage for immediate response
      localStorage.setItem('theme-mode', mode)
      localStorage.setItem('theme-colors', JSON.stringify(colors))
      localStorage.setItem('theme-fonts', JSON.stringify(fonts))
    };
    
    // Run immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyTheme);
    } else {
      // Use setTimeout to ensure all components have mounted and navigation is complete
      setTimeout(applyTheme, 100);
    }
    
    return () => {
      document.removeEventListener('DOMContentLoaded', applyTheme);
    };
    
    // Only save to database on user-initiated changes, not on initial load
    // This prevents excessive API calls during component initialization
  }, [mode, colors, fonts, effectiveTheme, isLoaded])

  // Additional effect to handle page navigation - re-apply background when page changes
  useEffect(() => {
    if (!isLoaded || !colors.background) return;

    const applyBackgroundToPages = () => {
      // Apply to specific page containers with data-page attribute
      const pageContainers = document.querySelectorAll('[data-page]');
      pageContainers.forEach(container => {
        (container as HTMLElement).style.background = colors.background;
      });
      
      // Also ensure body background is applied
      document.body.style.background = colors.background;
      
      console.log('Re-applied background to', pageContainers.length, 'page containers:', colors.background);
    };

    // Apply immediately
    applyBackgroundToPages();

    // Set up MutationObserver to detect when new pages are loaded
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if new elements with data-page attribute were added
          const addedNodes = Array.from(mutation.addedNodes).filter(node => 
            node.nodeType === Node.ELEMENT_NODE
          ) as Element[];
          
          const hasNewPageContainer = addedNodes.some(node => 
            node.hasAttribute?.('data-page') || 
            node.querySelector?.('[data-page]')
          );
          
          if (hasNewPageContainer) {
            // Small delay to ensure the page has fully rendered
            setTimeout(applyBackgroundToPages, 50);
          }
        }
      });
    });

    // Observe changes to the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [colors.background, isLoaded])

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    
    // Immediately save to localStorage
    localStorage.setItem('theme-mode', newMode);
    
    // Save to database
    if (updateThemeSettings) {
      updateThemeSettings({
        primaryColor: colors.primary,
        backgroundColor: colors.background,
        fontFamily: fonts.family,
        fontSize: fonts.size,
        isDarkMode: newMode === 'dark'
      });
    }
    console.log('Mode updated and saved:', newMode);
  }

  const handleSetColors = (newColors: Partial<ThemeColors>) => {
    console.log('🎨 Theme Context: handleSetColors called with:', newColors);
    console.log('🎨 Theme Context: Current colors:', colors);
    
    // Set timestamp and flag to prevent preferences from overriding
    const now = Date.now();
    setLastUserUpdate(now);
    setIsUserUpdating(true);
    
    const updatedColors = { ...colors, ...newColors };
    console.log('🎨 Theme Context: Updated colors:', updatedColors);
    
    // Update state immediately
    setColors(updatedColors);
    
    // Immediately save to localStorage
    localStorage.setItem('theme-colors', JSON.stringify(updatedColors));
    
    // Immediately apply background to body and all page containers
    if (updatedColors.background) {
      // Apply to body
      document.body.style.background = updatedColors.background;
      
      // Apply to all page containers
      const pageContainers = document.querySelectorAll('[data-page]');
      pageContainers.forEach(container => {
        (container as HTMLElement).style.background = updatedColors.background;
      });
      
      console.log('🎨 Theme Context: Applied background to body and', pageContainers.length, 'page containers:', updatedColors.background);
    }
    
    // Save to database
    if (updateThemeSettings) {
      updateThemeSettings({
        primaryColor: updatedColors.primary,
        backgroundColor: updatedColors.background,
        fontFamily: fonts.family,
        fontSize: fonts.size,
        isDarkMode: mode === 'dark'
      }).then(() => {
        console.log('🎨 Theme Context: Database update completed');
        // Clear flag after successful database update
        setTimeout(() => {
          setIsUserUpdating(false);
          console.log('🎨 Theme Context: User updating flag cleared');
        }, 1000);
      }).catch((error) => {
        console.error('🎨 Theme Context: Database update failed:', error);
        // Clear flag even on error
        setTimeout(() => {
          setIsUserUpdating(false);
        }, 1000);
      });
    } else {
      // If no updateThemeSettings function, clear flag after delay
      setTimeout(() => {
        setIsUserUpdating(false);
        console.log('🎨 Theme Context: User updating flag cleared (no update function)');
      }, 3000);
    }
    
    console.log('🎨 Theme Context: Colors updated and saved:', updatedColors);
  }

  const handleSetFonts = (newFonts: Partial<FontSettings>) => {
    console.log('🎨 Theme Context: handleSetFonts called with:', newFonts);
    console.log('🎨 Theme Context: Current fonts:', fonts);
    
    // Set timestamp and flag to prevent preferences from overriding
    const now = Date.now();
    setLastUserUpdate(now);
    setIsUserUpdating(true);
    
    const updatedFonts = { ...fonts, ...newFonts };
    console.log('🎨 Theme Context: Updated fonts:', updatedFonts);
    
    // Update state immediately
    setFonts(updatedFonts);
    
    // Immediately save to localStorage
    localStorage.setItem('theme-fonts', JSON.stringify(updatedFonts));
    
    // Save to database
    if (updateThemeSettings) {
      updateThemeSettings({
        primaryColor: colors.primary,
        backgroundColor: colors.background,
        fontFamily: updatedFonts.family,
        fontSize: updatedFonts.size,
        isDarkMode: mode === 'dark'
      }).then(() => {
        console.log('🎨 Theme Context: Font database update completed');
        // Clear flag after successful database update
        setTimeout(() => {
          setIsUserUpdating(false);
          console.log('🎨 Theme Context: User updating flag cleared');
        }, 1000);
      }).catch((error) => {
        console.error('🎨 Theme Context: Font database update failed:', error);
        // Clear flag even on error
        setTimeout(() => {
          setIsUserUpdating(false);
        }, 1000);
      });
    } else {
      // If no updateThemeSettings function, clear flag after delay
      setTimeout(() => {
        setIsUserUpdating(false);
        console.log('🎨 Theme Context: User updating flag cleared (no update function)');
      }, 3000);
    }
    
    console.log('🎨 Theme Context: Fonts updated and saved:', updatedFonts);
  }

  const resetToDefaults = () => {
    setMode('system')
    setColors(defaultColors)
    setFonts(defaultFonts)
    
    // Immediately save to localStorage
    localStorage.setItem('theme-mode', 'system')
    localStorage.setItem('theme-colors', JSON.stringify(defaultColors))
    localStorage.setItem('theme-fonts', JSON.stringify(defaultFonts))
    
    // Save to database
    if (updateThemeSettings) {
      updateThemeSettings({
        primaryColor: defaultColors.primary,
        backgroundColor: defaultColors.background,
        fontFamily: defaultFonts.family,
        fontSize: defaultFonts.size,
        isDarkMode: false
      });
    }
    console.log('Reset to defaults and saved')
  }

  return (
    <ThemeContext.Provider value={{
      mode,
      colors,
      fonts,
      effectiveTheme,
      setMode: handleSetMode,
      setColors: handleSetColors,
      setFonts: handleSetFonts,
      resetToDefaults
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