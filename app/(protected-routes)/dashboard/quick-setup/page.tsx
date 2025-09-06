"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/context/auth-provider';
import { createClient } from '@/lib/supabase/client';

export default function QuickSetupPage() {
  const { claims } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const checkStoreItems = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('store_items')
        .select('*');
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        const categoryCounts = data?.reduce((acc: any, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {}) || {};
        
        setMessage(`Store items: ${Object.entries(categoryCounts).map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
        console.log('Store items:', data);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Quick Setup</h1>
        <p className="text-muted-foreground">
          Use this page to quickly check system status and debug store functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={checkStoreItems}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Check Store Items'}
          </Button>
          
          {message && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <p>{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
