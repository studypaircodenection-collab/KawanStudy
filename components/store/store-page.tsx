"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomizedAvatar } from "@/components/ui/customized-avatar";
import { useStore, StoreItem } from "@/hooks/use-store";
import { useAuth } from "@/lib/context/auth-provider";
import { Coins, ShoppingCart, Star } from "lucide-react";

const rarityColors = {
  common: "bg-gray-100 text-gray-800 border-gray-300",
  rare: "bg-blue-100 text-blue-800 border-blue-300",
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  legendary: "bg-yellow-100 text-yellow-800 border-yellow-300"
};

const rarityGradients = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600", 
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600"
};

interface StorePageProps {
  className?: string;
}

export default function StorePage({ className }: StorePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("profile_border");
  const { storeData, loading, purchaseItem, equipItem, purchasing } = useStore();
  const { claims } = useAuth();

  const categories = [
    { id: "profile_border", name: "Borders", icon: "⭕" },
    { id: "profile_badge", name: "Badges", icon: "🏆" },
    { id: "profile_title", name: "Titles", icon: "👑" },
    { id: "profile_theme", name: "Themes", icon: "🎨" }
  ];

  const filteredItems = storeData?.items.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
  ) || [];

  const handlePurchase = async (item: StoreItem) => {
    const success = await purchaseItem(item.id);
    if (success) {
      // Auto-equip the item after purchase
      await equipItem(item.id);
    }
  };

  const handleEquip = async (item: StoreItem) => {
    await equipItem(item.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground">Customize your profile with amazing items</p>
        </div>
        
        {/* Points Display */}
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-semibold">{storeData?.userPoints || 0}</span>
          <span className="text-sm text-muted-foreground">points</span>
        </div>
      </div>

      {/* Avatar Preview */}
      {claims && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CustomizedAvatar
              userId={claims.sub}
              src={claims.avatar_url}
              fallback={claims.full_name?.[0] || claims.email?.[0] || "U"}
              size="xl"
              showBadges={true}
              showTitle={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className={`relative overflow-hidden transition-transform hover:scale-105 ${
                  item.rarity === 'legendary' ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/25' :
                  item.rarity === 'epic' ? 'ring-2 ring-purple-400 shadow-lg shadow-purple-400/25' :
                  item.rarity === 'rare' ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/25' :
                  'border-gray-200'
                }`}>
                  {/* Rarity Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradients[item.rarity]} opacity-5`} />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${rarityColors[item.rarity]} capitalize`}
                      >
                        {item.rarity}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="relative">
                    {/* Item Preview */}
                    <div className="flex justify-center mb-4">
                      {item.category === 'profile_border' && (
                        <div className="w-16 h-16 rounded-lg border-4 flex items-center justify-center"
                             style={{ borderColor: item.image_url || '#ccc' }}>
                          🖼️
                        </div>
                      )}
                      {item.category === 'profile_badge' && (
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                            👤
                          </div>
                          <div className="absolute -bottom-1 -right-1 z-10">
                            <div className="text-sm bg-white rounded-full border-2 border-gray-200 w-7 h-7 flex items-center justify-center shadow-sm">
                              {(item.item_data?.value) || item.image_url || "🏆"}
                            </div>
                          </div>
                        </div>
                      )}
                      {item.category === 'profile_title' && (
                        <div className="flex flex-col items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none"
                          >
                            {item.name}
                          </Badge>
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                            👤
                          </div>
                        </div>
                      )}
                      {item.category === 'profile_theme' && (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white">
                          🎨
                        </div>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{item.price}</span>
                      </div>

                      {item.owned ? (
                        item.equipped ? (
                          <Badge variant="secondary" className="w-full justify-center">
                            Equipped
                          </Badge>
                        ) : (
                          <Button 
                            onClick={() => handleEquip(item)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={purchasing === item.id}
                          >
                            Equip
                          </Button>
                        )
                      ) : (
                        <Button 
                          onClick={() => handlePurchase(item)}
                          disabled={!item.canAfford || purchasing === item.id}
                          size="sm"
                          className="w-full"
                        >
                          {purchasing === item.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Buy
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items available in this category</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
