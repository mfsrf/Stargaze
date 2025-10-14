// Responsive utilities for dynamic screen sizing

import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base dimensions (iPhone 14 Pro as reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Scale size based on screen width
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale size based on screen height
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale font size with max/min bounds
 */
export const scaleFontSize = (size: number, maxSize?: number, minSize?: number): number => {
  const scaled = (SCREEN_WIDTH / BASE_WIDTH) * size;
  if (maxSize && scaled > maxSize) return maxSize;
  if (minSize && scaled < minSize) return minSize;
  return scaled;
};

/**
 * Moderate scale - less aggressive scaling
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = (): { small: number; medium: number; large: number } => {
  if (SCREEN_WIDTH < 375) {
    return { small: 8, medium: 12, large: 16 };
  } else if (SCREEN_WIDTH < 414) {
    return { small: 12, medium: 16, large: 20 };
  } else {
    return { small: 16, medium: 20, large: 24 };
  }
};

/**
 * Get responsive font sizes
 */
export const getResponsiveFontSizes = () => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  
  return {
    tiny: Math.round(9 * scale),
    small: Math.round(11 * scale),
    body: Math.round(13 * scale),
    medium: Math.round(15 * scale),
    large: Math.round(17 * scale),
    xlarge: Math.round(20 * scale),
    xxlarge: Math.round(24 * scale),
  };
};

/**
 * Check if device is a small screen
 */
export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 667;
};

/**
 * Check if device is a large screen (tablet)
 */
export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH >= 768;
};

/**
 * Get number of columns for grid layouts
 */
export const getGridColumns = (itemWidth: number, spacing: number = 16): number => {
  const availableWidth = SCREEN_WIDTH - spacing * 2;
  const columns = Math.floor(availableWidth / (itemWidth + spacing));
  return Math.max(1, columns);
};

/**
 * Responsive screen dimensions
 */
export const RESPONSIVE = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmall: isSmallScreen(),
  isLarge: isLargeScreen(),
  padding: getResponsivePadding(),
  fonts: getResponsiveFontSizes(),
};
