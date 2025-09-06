"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomizedAvatar } from './customized-avatar';
import { useEquippedItems } from '@/hooks/use-equipped-items';
import { cn } from '@/lib/utils';

interface UserProfileCardProps {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalPoints?: number;
  level?: number;
  showStats?: boolean;
  className?: string;
}

export function UserProfileCard({
  userId,
  username,
  avatarUrl,
  totalPoints,
  level,
  showStats = true,
  className
}: UserProfileCardProps) {
  const { equippedItems, getEquippedItemByType } = useEquippedItems(userId);

  const border = getEquippedItemByType('profile_border');
  const theme = getEquippedItemByType('profile_theme');

  const getCardStyle = () => {
    const style: React.CSSProperties = {};
    
    if (border) {
      style.border = `3px solid ${border.item_data.value}`;
      style.borderRadius = '12px';
    }
    
    if (theme) {
      // Apply theme colors based on the theme value
      switch (theme.item_data.value) {
        case 'dark':
          style.background = 'linear-gradient(135deg, #374151 0%, #1f2937 100%)';
          style.color = '#ffffff';
          break;
        case 'ocean':
          style.background = 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
          style.color = '#ffffff';
          break;
        case 'forest':
          style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          style.color = '#ffffff';
          break;
        case 'sunset':
          style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
          style.color = '#ffffff';
          break;
        case 'galaxy':
          style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
          style.color = '#ffffff';
          break;
      }
    }
    
    return style;
  };

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-lg', className)} style={getCardStyle()}>
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-3">
          <CustomizedAvatar
            userId={userId}
            src={avatarUrl}
            fallback={username.charAt(0).toUpperCase()}
            size="xl"
            showBadges={true}
            showTitle={true}
          />
        </div>
        <h3 className="font-semibold text-lg">{username}</h3>
      </CardHeader>
      
      {showStats && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div>
              <p className="text-2xl font-bold">{totalPoints?.toLocaleString() || 0}</p>
              <p className="text-sm opacity-75">Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{level || 1}</p>
              <p className="text-sm opacity-75">Level</p>
            </div>
          </div>
          
          {/* Display equipped items */}
          {equippedItems.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2 opacity-90">Equipped Items:</p>
              <div className="flex flex-wrap gap-1">
                {equippedItems.map((item) => (
                  <Badge 
                    key={item.item_id} 
                    variant="outline" 
                    className="text-xs bg-white/10 border-white/20"
                  >
                    {item.item_type === 'profile_badge' && item.item_data.value} {item.item_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
