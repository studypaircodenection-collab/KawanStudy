import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get comprehensive user profile data including gamification
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        username,
        email,
        phone,
        bio,
        location,
        university,
        year_of_study,
        major,
        avatar_url,
        header_image_url,
        total_points,
        current_streak,
        longest_streak,
        level,
        experience_points,
        last_activity_date,
        linkedin_url,
        github_url,
        instagram_url,
        tiktok_url,
        website_url,
        created_at,
        updated_at
      `
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profile || null,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      username,
      email,
      phone,
      bio,
      location,
      university,
      year_of_study,
      major,
      avatar_url,
      header_image_url,
      linkedin_url,
      github_url,
      instagram_url,
      tiktok_url,
      website_url,
    } = body;

    // Validate required fields
    if (!full_name || typeof full_name !== "string") {
      return NextResponse.json({ error: "Invalid full_name" }, { status: 400 });
    }

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check if username is already taken by another user
    if (username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Username check error:", checkError);
        return NextResponse.json(
          { error: "Failed to validate username" },
          { status: 500 }
        );
      }

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user profile with all fields
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name,
        username,
        email,
        phone: phone || null,
        bio: bio || "",
        location: location || null,
        university: university || null,
        year_of_study: year_of_study || null,
        major: major || null,
        avatar_url: avatar_url || "/api/placeholder/100/100",
        header_image_url: header_image_url || null,
        linkedin_url: linkedin_url || null,
        github_url: github_url || null,
        instagram_url: instagram_url || null,
        tiktok_url: tiktok_url || null,
        website_url: website_url || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
