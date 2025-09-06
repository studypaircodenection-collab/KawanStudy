"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEquippedItems } from '@/hooks/use-equipped-items';
import { cn } from '@/lib/utils';

interface CustomizedAvatarProps {
  userId: string;
  src?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadges?: boolean;
  showTitle?: boolean;
  className?: string;
}

export function CustomizedAvatar({
  userId,
  src,
  fallback,
  size = 'md',
  showBadges = true,
  showTitle = true,
  className
}: CustomizedAvatarProps) {
  const { getEquippedItemByType } = useEquippedItems(userId);

  const border = getEquippedItemByType('profile_border');
  const badge = getEquippedItemByType('profile_badge');
  const title = getEquippedItemByType('profile_title');

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const getBorderStyle = () => {
    if (!border) return {};
    
    return {
      border: `3px solid ${border.item_data.value}`,
      borderRadius: '50%'
    };
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Title above avatar */}
      {showTitle && title && (
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
          <Badge 
            variant="secondary" 
            className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none"
          >
            {title.item_name}
          </Badge>
        </div>
      )}

      {/* Avatar with border */}
      <Avatar 
        className={cn(sizeClasses[size], className)} 
        style={getBorderStyle()}
      >
        <AvatarImage src={src} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      {/* Badge overlay */}
      {showBadges && badge && (
        <div className="absolute -bottom-1 -right-1 z-10">
          <div className="text-lg bg-white rounded-full border-2 border-gray-200 w-6 h-6 flex items-center justify-center">
            {badge.item_data.value}
          </div>
        </div>
      )}
    </div>
  );
}
