import React from 'react';
import * as LucideIcons from 'lucide-react';

interface AppIconProps {
  name: keyof typeof LucideIcons;
  size?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function AppIcon({
  name,
  size = 24,
  className = '',
  onClick,
  disabled = false,
}: AppIconProps) {
  const IconComponent = LucideIcons[name] as React.ComponentType<{
    size?: number;
    className?: string;
    onClick?: () => void;
  }>;

  if (!IconComponent) return null;

  return (
    <IconComponent
      size={size}
      className={`${className} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    />
  );
}