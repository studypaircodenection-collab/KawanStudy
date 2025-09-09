"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-provider";
import { CustomizedAvatar } from "../ui/customized-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DisplayUser {
  id?: string;
  email?: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export function NavUser({ user }: { user: DisplayUser }) {
  const { isMobile } = useSidebar();
  const { setClaims } = useAuth();

  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setClaims(null);
    router.push("/auth/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.username}
                />
                <AvatarFallback className="rounded-lg">
                  <UserRoundIcon className="size-4" />
                </AvatarFallback>
              </Avatar> */}
              <CustomizedAvatar
                src={user.user_metadata?.avatar_url}
                userId={user.id || ""}
                size="sm"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                {user.user_metadata?.username ? (
                  <span className="truncate font-medium">
                    {user.user_metadata?.username}
                  </span>
                ) : null}
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <CustomizedAvatar
                  src={user.user_metadata?.avatar_url}
                  userId={user.id || ""}
                  size="sm"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.user_metadata?.username}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/profile/${
                    user.user_metadata?.username || "undefined"
                  }`}
                >
                  <BadgeCheck />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/peer">
                  <UsersIcon />
                  My Friends
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <SettingsIcon />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
