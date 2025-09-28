/**
 * Utility functions for dynamic font sizing based on theme settings
 */

// Get current font scale from CSS variables
export function getFontScale(): number {
  if (typeof window === 'undefined') return 1;
  
  const rootStyle = getComputedStyle(document.documentElement);
  const fontScale = rootStyle.getPropertyValue('--font-scale');
  
  if (fontScale) {
    const scale = parseFloat(fontScale);
    return isNaN(scale) ? 1 : scale;
  }
  
  // Fallback: calculate from current base font size
  const baseFontSize = rootStyle.getPropertyValue('--base-font-size');
  if (baseFontSize) {
    const size = parseFloat(baseFontSize);
    return isNaN(size) ? 1 : size / 16; // 16px is our base
  }
  
  return 1;
}

// Get scaled font sizes for charts
export function getChartFontSizes() {
  const scale = getFontScale();
  
  return {
    tick: Math.max(8, Math.round(10 * scale)), // Min 8px for readability
    legend: Math.max(10, Math.round(12 * scale)), // Min 10px
    label: Math.max(9, Math.round(11 * scale)), // Min 9px
    tooltip: Math.max(11, Math.round(13 * scale)), // Min 11px
  };
}

// Get current theme font settings
export function getThemeFontSettings() {
  if (typeof window === 'undefined') {
    return { family: 'Inter, system-ui, sans-serif', size: 16 };
  }
  
  const rootStyle = getComputedStyle(document.documentElement);
  const fontFamily = rootStyle.getPropertyValue('--font-family') || 'Inter, system-ui, sans-serif';
  const fontSize = parseFloat(rootStyle.getPropertyValue('--font-size')) || 16;
  
  return {
    family: fontFamily.trim(),
    size: fontSize
  };
}

// CSS custom property values for responsive font sizing
export function getFontSizeCSS(baseSize: number): string {
  return `calc(${baseSize}px * var(--font-scale, 1))`;
}