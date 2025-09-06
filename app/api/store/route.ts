import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/store - Get store items and user purchases
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build query for store items
    let itemsQuery = supabase
      .from("store_items")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (category) {
      itemsQuery = itemsQuery.eq("category", category);
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      throw itemsError;
    }

    // Get user's purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from("user_purchases")
      .select("item_id")
      .eq("user_id", user.id);

    if (purchasesError) {
      throw purchasesError;
    }

    // Get user's equipped items
    const { data: equipped, error: equippedError } = await supabase
      .from("user_equipped_items")
      .select("item_id, category")
      .eq("user_id", user.id);

    if (equippedError) {
      throw equippedError;
    }

    // Get user's current points
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    const purchasedItemIds = new Set(purchases.map(p => p.item_id));
    const equippedItemIds = new Set(equipped.map(e => e.item_id));

    // Add ownership and equipped status to items
    const itemsWithStatus = items.map(item => ({
      ...item,
      owned: purchasedItemIds.has(item.id),
      equipped: equippedItemIds.has(item.id),
      canAfford: profile.total_points >= item.price
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: itemsWithStatus,
        userPoints: profile.total_points,
        categories: ["profile_border", "profile_badge", "profile_theme", "profile_title"]
      }
    });

  } catch (error) {
    console.error("Error fetching store data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch store data" },
      { status: 500 }
    );
  }
}

// POST /api/store - Purchase or equip an item
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { action, itemId } = await request.json();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!action || !itemId) {
      return NextResponse.json(
        { success: false, error: "Missing action or itemId" },
        { status: 400 }
      );
    }

    if (action === "purchase") {
      // Purchase item using database function
      const { data, error } = await supabase.rpc("purchase_store_item", {
        p_item_id: itemId,
        p_user_id: user.id
      });

      if (error) {
        throw error;
      }

      return NextResponse.json(data);

    } else if (action === "equip") {
      // Equip item using database function
      const { data, error } = await supabase.rpc("equip_store_item", {
        p_item_id: itemId,
        p_user_id: user.id
      });

      if (error) {
        throw error;
      }

      return NextResponse.json(data);

    } else if (action === "unequip") {
      // Unequip item
      const { error } = await supabase
        .from("user_equipped_items")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      if (error) {
        throw error;
      }

      // Reset profile field based on item category
      const { data: item } = await supabase
        .from("store_items")
        .select("category")
        .eq("id", itemId)
        .single();

      if (item) {
        const updateData: any = {};
        switch (item.category) {
          case "profile_border":
            updateData.profile_border_color = "#e5e7eb";
            break;
          case "profile_badge":
            updateData.profile_badge = null;
            break;
          case "profile_theme":
            updateData.profile_theme = "default";
            break;
          case "profile_title":
            updateData.profile_title = null;
            break;
        }

        await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);
      }

      return NextResponse.json({ success: true, message: "Item unequipped" });

    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error processing store action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
