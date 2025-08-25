import { createClient } from "@/lib/supabase/server";

export interface ProfileInitData {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  university?: string;
  yearOfStudy?: string;
  major?: string;
}

/**
 * Initialize a user profile with comprehensive data
 * This function is called automatically by the database trigger,
 * but can also be used for manual profile initialization
 */
export async function initializeUserProfile(
  userId: string,
  data: ProfileInitData = {}
) {
  const supabase = await createClient();

  try {
    // Generate a unique username
    const { data: generatedUsername, error: usernameError } =
      await supabase.rpc("generate_unique_username", {
        base_name: data.fullName || data.email?.split("@")[0] || "user",
      });

    if (usernameError) {
      console.error("Error generating username:", usernameError);
      throw new Error("Failed to generate username");
    }

    // Create or update the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: data.fullName || "",
        username: generatedUsername,
        email: data.email || "",
        phone: data.phone || null,
        bio: "",
        location: data.location || null,
        university: data.university || null,
        year_of_study: data.yearOfStudy || null,
        major: data.major || null,
        avatar_url: data.avatarUrl || "/api/placeholder/100/100",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      throw new Error("Failed to create user profile");
    }

    return profile;
  } catch (error) {
    console.error("Profile initialization error:", error);
    throw error;
  }
}

/**
 * Get a user's complete profile data
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
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
      created_at,
      updated_at
    `
    )
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return profile;
}

/**
 * Get a user's profile by username (for public profile pages)
 */
export async function getProfileByUsername(username: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase.rpc(
    "get_profile_by_username",
    { username_param: username }
  );

  if (error) {
    console.error("Error fetching profile by username:", error);
    return null;
  }

  return profile?.[0] || null;
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_username_availability", {
    username_to_check: username,
  });

  if (error) {
    console.error("Error checking username availability:", error);
    return false;
  }

  return data;
}
