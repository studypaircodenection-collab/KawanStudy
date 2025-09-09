"use client";

import { useState } from "react";
import {
  useStore,
  rarityColors,
  categoryNames,
  type StoreItem,
} from "@/hooks/use-store";
import { useAuth } from "@/lib/context/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomizedAvatar } from "@/components/ui/customized-avatar";
import { Coins, ShoppingBag, Star, Crown, Gem, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StorePage() {
  const {
    storeData,
    loading,
    purchasing,
    purchaseItem,
    equipItem,
    unequipItem,
  } = useStore();
  const { claims } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Star className="h-4 w-4" />;
      case "rare":
        return <Gem className="h-4 w-4" />;
      case "epic":
        return <Crown className="h-4 w-4" />;
      case "legendary":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const filteredItems =
    storeData?.items.filter(
      (item) => selectedCategory === "all" || item.category === selectedCategory
    ) || [];

  const StoreItemCard = ({ item }: { item: StoreItem }) => (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge
            className={`${rarityColors[item.rarity]} flex items-center gap-1`}
          >
            {getRarityIcon(item.rarity)}
            <span className="capitalize">{item.rarity}</span>
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="mb-4">
          {/* Visual preview based on item type */}
          <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg mb-3">
            {item.category === "profile_badge" ? (
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="absolute -bottom-1 -right-1 z-10">
                  <div className="text-xs bg-white dark:bg-gray-700 rounded-full border-2 border-gray-200 dark:border-gray-700 w-6 h-6 flex items-center justify-center shadow-sm">
                    {item.item_data?.value || item.image_url || "🏆"}
                  </div>
                </div>
              </div>
            ) : item.category === "profile_border" ? (
              <div
                className="w-12 h-12 rounded-full border-4"
                style={{ borderColor: item.image_url }}
              />
            ) : item.category === "profile_theme" ? (
              <div
                className={`w-12 h-12 rounded-lg ${getThemePreview(
                  item.image_url
                )}`}
              />
            ) : item.category === "profile_title" ? (
              <div className="flex flex-col items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none"
                >
                  {item.name}
                </Badge>
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs">
                  👤
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                {item.category.replace("_", " ")}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-lg font-semibold">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span>{item.price}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {categoryNames[item.category as keyof typeof categoryNames]}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          {item.owned ? (
            item.equipped ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => unequipItem(item.id)}
              >
                Unequip
              </Button>
            ) : (
              <Button className="w-full" onClick={() => equipItem(item.id)}>
                Equip
              </Button>
            )
          ) : (
            <Button
              className="w-full"
              disabled={!item.canAfford || purchasing === item.id}
              onClick={() => purchaseItem(item.id)}
            >
              {purchasing === item.id
                ? "Purchasing..."
                : !item.canAfford
                ? "Not enough points"
                : "Purchase"}
            </Button>
          )}

          {item.owned && (
            <Badge variant="secondary" className="w-full justify-center">
              {item.equipped ? "Equipped" : "Owned"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const getThemePreview = (theme: string) => {
    switch (theme) {
      case "dark":
        return "bg-gray-800";
      case "ocean":
        return "bg-blue-500";
      case "forest":
        return "bg-green-500";
      case "sunset":
        return "bg-orange-500";
      case "galaxy":
        return "bg-purple-600";
      default:
        return "bg-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-80">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingBag className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Points Store</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Customize your profile with exclusive items using your points!
        </p>

        {/* User Points Display */}
        {storeData && (
          <div className="inline-flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Coins className="h-6 w-6 text-yellow-600" />
            <span className="text-lg font-semibold text-yellow-800">
              {storeData.userPoints} Points
            </span>
          </div>
        )}
      </div>

      {/* Avatar Preview */}
      {claims && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Your Customized Avatar
            </CardTitle>
            <CardDescription>
              See how your equipped items look on your avatar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CustomizedAvatar
              userId={claims.sub}
              src={claims.avatar_url !== "N/A" ? claims.avatar_url : undefined}
              fallback={claims.full_name?.[0] || claims.email?.[0] || "U"}
              size="xl"
              showBadges={true}
              showTitle={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="profile_border">Borders</TabsTrigger>
          <TabsTrigger value="profile_badge">Badges</TabsTrigger>
          <TabsTrigger value="profile_theme">Themes</TabsTrigger>
          <TabsTrigger value="profile_title">Titles</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No items found
              </h3>
              <p className="text-gray-500">
                Try selecting a different category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <StoreItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
