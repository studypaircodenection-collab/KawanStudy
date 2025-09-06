import { useState, useEffect } from "react";
import { toast } from "sonner";
import { dispatchPointsUpdate } from "@/lib/utils/points-events";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  item_data?: any;
}

export interface StoreData {
  items: StoreItem[];
  userPoints: number;
  categories: string[];
}

export function useStore() {
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const fetchStoreData = async (category?: string) => {
    try {
      setLoading(true);
      const url = new URL("/api/store", window.location.origin);
      if (category) {
        url.searchParams.set("category", category);
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.success) {
        setStoreData(result.data);
      } else {
        toast.error("Failed to load store data");
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      toast.error("Failed to load store data");
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (itemId: string) => {
    try {
      setPurchasing(itemId);
      
      const response = await fetch("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "purchase",
          itemId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully purchased ${result.item.name}!`);
        // Dispatch points update event
        dispatchPointsUpdate({
          pointsAwarded: -result.item.price,
          source: 'store_purchase'
        });
        // Refresh store data
        await fetchStoreData();
        return true;
      } else {
        toast.error(result.error || "Failed to purchase item");
        return false;
      }
    } catch (error) {
      console.error("Error purchasing item:", error);
      toast.error("Failed to purchase item");
      return false;
    } finally {
      setPurchasing(null);
    }
  };

  const equipItem = async (itemId: string) => {
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "equip",
          itemId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Equipped ${result.equipped_item}!`);
        // Refresh store data
        await fetchStoreData();
        return true;
      } else {
        toast.error(result.error || "Failed to equip item");
        return false;
      }
    } catch (error) {
      console.error("Error equipping item:", error);
      toast.error("Failed to equip item");
      return false;
    }
  };

  const unequipItem = async (itemId: string) => {
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "unequip",
          itemId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Item unequipped!");
        // Refresh store data
        await fetchStoreData();
        return true;
      } else {
        toast.error(result.error || "Failed to unequip item");
        return false;
      }
    } catch (error) {
      console.error("Error unequipping item:", error);
      toast.error("Failed to unequip item");
      return false;
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  return {
    storeData,
    loading,
    purchasing,
    fetchStoreData,
    purchaseItem,
    equipItem,
    unequipItem,
    refreshStore: fetchStoreData,
  };
}

export const rarityColors = {
  common: "text-gray-600 bg-gray-100",
  rare: "text-blue-600 bg-blue-100",
  epic: "text-purple-600 bg-purple-100",
  legendary: "text-yellow-600 bg-yellow-100",
};

export const categoryNames = {
  profile_border: "Profile Borders",
  profile_badge: "Profile Badges",
  profile_theme: "Profile Themes",
  profile_title: "Profile Titles"
};
