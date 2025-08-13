import { StyleSheet } from 'react-native';
import { Colors, StyleConstants } from '../constants/Colors';

export const createSharedStyles = (colorScheme: 'light' | 'dark' = 'light') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: StyleConstants.spacing.xl,
    },
    
    // Card styles
    card: {
      backgroundColor: colors.card,
      borderRadius: StyleConstants.borderRadius,
      padding: StyleConstants.cardPadding,
      marginHorizontal: StyleConstants.spacing.md,
      marginVertical: StyleConstants.spacing.sm,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    cardElevated: {
      backgroundColor: colors.card,
      borderRadius: StyleConstants.borderRadius,
      padding: StyleConstants.cardPadding,
      marginHorizontal: StyleConstants.spacing.md,
      marginVertical: StyleConstants.spacing.sm,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    
    // Button styles
    buttonPrimary: {
      backgroundColor: colors.primary,
      paddingVertical: StyleConstants.spacing.md,
      paddingHorizontal: StyleConstants.spacing.lg,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: StyleConstants.spacing.sm,
    },
    
    buttonSecondary: {
      backgroundColor: colors.accent,
      paddingVertical: StyleConstants.spacing.md,
      paddingHorizontal: StyleConstants.spacing.lg,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: StyleConstants.spacing.sm,
    },
    
    buttonSuccess: {
      backgroundColor: colors.success,
      paddingVertical: StyleConstants.spacing.md,
      paddingHorizontal: StyleConstants.spacing.lg,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: StyleConstants.spacing.sm,
    },
    
    buttonDisabled: {
      backgroundColor: '#a0aec0',
      paddingVertical: StyleConstants.spacing.md,
      paddingHorizontal: StyleConstants.spacing.lg,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: StyleConstants.spacing.sm,
    },
    
    // Text styles
    buttonTextPrimary: {
      color: colors.lightText,
      fontSize: StyleConstants.fontSize.md,
      fontWeight: StyleConstants.fontWeight.semibold,
    },
    
    buttonTextSecondary: {
      color: colors.text,
      fontSize: StyleConstants.fontSize.md,
      fontWeight: StyleConstants.fontWeight.semibold,
    },
    
    // Typography
    title: {
      fontSize: StyleConstants.fontSize.xxl,
      fontWeight: StyleConstants.fontWeight.bold,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: StyleConstants.spacing.lg,
    },
    
    subtitle: {
      fontSize: StyleConstants.fontSize.lg,
      fontWeight: StyleConstants.fontWeight.semibold,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: StyleConstants.spacing.md,
    },
    
    heading: {
      fontSize: StyleConstants.fontSize.lg,
      fontWeight: StyleConstants.fontWeight.semibold,
      color: colors.primary,
      marginBottom: StyleConstants.spacing.md,
    },
    
    body: {
      fontSize: StyleConstants.fontSize.md,
      color: colors.text,
      lineHeight: 24,
    },
    
    bodyCenter: {
      fontSize: StyleConstants.fontSize.md,
      color: colors.text,
      lineHeight: 24,
      textAlign: 'center',
    },
    
    caption: {
      fontSize: StyleConstants.fontSize.sm,
      color: colors.placeholder,
    },
    
    // Input styles
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: StyleConstants.borderRadius,
      paddingVertical: StyleConstants.spacing.md,
      paddingHorizontal: StyleConstants.spacing.md,
      fontSize: StyleConstants.fontSize.md,
      color: colors.text,
      marginVertical: StyleConstants.spacing.sm,
    },
    
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    
    // Layout helpers
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    rowSpaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Spacing
    marginTop: {
      marginTop: StyleConstants.spacing.md,
    },
    
    marginBottom: {
      marginBottom: StyleConstants.spacing.md,
    },
    
    marginVertical: {
      marginVertical: StyleConstants.spacing.md,
    },
    
    marginHorizontal: {
      marginHorizontal: StyleConstants.spacing.md,
    },
    
    // Message styles
    messageSuccess: {
      backgroundColor: '#D4EDDA',
      borderColor: '#C3E6CB',
      borderWidth: 1,
      borderRadius: StyleConstants.borderRadius,
      padding: StyleConstants.spacing.md,
      marginVertical: StyleConstants.spacing.sm,
    },
    
    messageError: {
      backgroundColor: '#F8D7DA',
      borderColor: '#F5C6CB',
      borderWidth: 1,
      borderRadius: StyleConstants.borderRadius,
      padding: StyleConstants.spacing.md,
      marginVertical: StyleConstants.spacing.sm,
    },
    
    messageInfo: {
      backgroundColor: '#D1ECF1',
      borderColor: '#BEE5EB',
      borderWidth: 1,
      borderRadius: StyleConstants.borderRadius,
      padding: StyleConstants.spacing.md,
      marginVertical: StyleConstants.spacing.sm,
    },
    
    messageTextSuccess: {
      color: '#155724',
      textAlign: 'center',
    },
    
    messageTextError: {
      color: '#721C24',
      textAlign: 'center',
    },
    
    messageTextInfo: {
      color: '#0C5460',
      textAlign: 'center',
    },
  });
};