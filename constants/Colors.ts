/**
 * EcoCycle Green Theme Colors
 */

const primaryGreen = '#2E7D32'; // Dark Green
const secondaryGreen = '#4CAF50'; // Medium Green
const accentAmber = '#FFC107'; // Amber
const backgroundLight = '#F5F5F5';
const textDark = '#333';
const lightText = '#FFFFFF';
const cardBackground = '#FFFFFF';

export const Colors = {
  light: {
    text: textDark,
    background: backgroundLight,
    primary: primaryGreen,
    secondary: secondaryGreen,
    accent: accentAmber,
    card: cardBackground,
    lightText: lightText,
    success: '#48bb78',
    error: '#e53e3e',
    warning: '#FFA000',
    border: '#e2e8f0',
    placeholder: '#999',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    primary: secondaryGreen,
    secondary: primaryGreen,
    accent: accentAmber,
    card: '#1a1a1a',
    lightText: lightText,
    success: '#48bb78',
    error: '#e53e3e',
    warning: '#FFA000',
    border: '#333',
    placeholder: '#666',
    shadow: 'rgba(255, 255, 255, 0.1)',
  },
};

// Common style constants
export const StyleConstants = {
  borderRadius: 12,
  cardPadding: 20,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};