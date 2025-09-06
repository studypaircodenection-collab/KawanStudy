"use client";

import { useEquippedItems } from '@/hooks/use-equipped-items';
import { useAuth } from '@/lib/context/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const { claims } = useAuth();
  const { equippedItems, loading, getEquippedItemByType } = useEquippedItems(claims?.sub);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Debug Profile System</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify({ 
              userId: claims?.sub,
              userEmail: claims?.email,
              loading 
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipped Items</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(equippedItems, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Customization Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['profile_border', 'profile_badge', 'profile_title'].map(category => {
              const item = getEquippedItemByType(category as any);
              return (
                <div key={category} className="border-b pb-2">
                  <h4 className="font-semibold capitalize">{category.replace('_', ' ')}</h4>
                  {item ? (
                    <div>
                      <p>Name: {item.item_name}</p>
                      <p>Rarity: {item.rarity}</p>
                      {item.item_data && <p>Data: {JSON.stringify(item.item_data)}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-500">None equipped</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
