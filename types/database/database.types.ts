export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          username: string | null;
          email: string | null;
          phone: string | null;
          bio: string | null;
          location: string | null;
          university: string | null;
          year_of_study: string | null;
          major: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          username?: string | null;
          email?: string | null;
          phone?: string | null;
          bio?: string | null;
          location?: string | null;
          university?: string | null;
          year_of_study?: string | null;
          major?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          username?: string | null;
          email?: string | null;
          phone?: string | null;
          bio?: string | null;
          location?: string | null;
          university?: string | null;
          year_of_study?: string | null;
          major?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      user_data: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for common use cases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type UserData = Database["public"]["Tables"]["user_data"]["Row"];
export type UserDataInsert =
  Database["public"]["Tables"]["user_data"]["Insert"];
export type UserDataUpdate =
  Database["public"]["Tables"]["user_data"]["Update"];
