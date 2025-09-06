import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EquippedItem {
  item_id: string;
  item_name: string;
  item_type: 'profile_border' | 'profile_badge' | 'profile_theme' | 'profile_title';
  item_data: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image_url?: string;
}

export function useEquippedItems(userId?: string) {
  const [equippedItems, setEquippedItems] = useState<EquippedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchEquippedItems = async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_equipped_items')
        .select(`
          item_id,
          store_items (
            name,
            category,
            image_url,
            item_data,
            rarity
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching equipped items:', error);
      } else {
        const formattedItems = data?.map(item => ({
          item_id: item.item_id,
          item_name: (item as any).store_items.name,
          item_type: (item as any).store_items.category as EquippedItem['item_type'],
          item_data: (item as any).store_items.item_data || { value: (item as any).store_items.image_url },
          rarity: (item as any).store_items.rarity,
          image_url: (item as any).store_items.image_url
        })) || [];
        
        setEquippedItems(formattedItems);
      }
      
      setLoading(false);
    };

    fetchEquippedItems();
  }, [userId]);

  const getEquippedItemByType = (type: EquippedItem['item_type']) => {
    return equippedItems.find(item => item.item_type === type);
  };

  return {
    equippedItems,
    loading,
    getEquippedItemByType
  };
}
