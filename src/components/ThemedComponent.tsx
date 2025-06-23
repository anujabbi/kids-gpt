
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedComponentProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'background' | 'surface' | 'primary' | 'secondary';
  textVariant?: 'primary' | 'secondary' | 'accent';
}

export const ThemedComponent: React.FC<ThemedComponentProps> = ({
  children,
  className,
  variant = 'background',
  textVariant = 'primary',
}) => {
  const { currentTheme } = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface':
        return currentTheme.colors.surface;
      case 'primary':
        return currentTheme.colors.primary;
      case 'secondary':
        return currentTheme.colors.secondary;
      default:
        return currentTheme.colors.background;
    }
  };

  const getTextColor = () => {
    switch (textVariant) {
      case 'secondary':
        return currentTheme.colors.text.secondary;
      case 'accent':
        return currentTheme.colors.text.accent;
      default:
        return currentTheme.colors.text.primary;
    }
  };

  return (
    <div
      className={cn(className)}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        borderColor: currentTheme.colors.border,
      }}
    >
      {children}
    </div>
  );
};
