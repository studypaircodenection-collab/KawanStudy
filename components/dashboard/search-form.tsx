import {
  BookOpen,
  FileLockIcon,
  ListTodoIcon,
  LucideCalculator,
  MessageCircleIcon,
  Settings,
  TrophyIcon,
  UploadIcon,
  User,
  UsersIcon,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-provider";
import { Input } from "../ui/input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
export function SearchForm() {
  const [open, setOpen] = React.useState(false);

  const { claims } = useAuth();
  const { isMobile } = useSidebar();
  const router = useRouter();

  // Detect if user is on Mac or Windows/Linux
  const isMac = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  }, []);

  const commandKey = isMac ? "⌘" : "Ctrl";

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push(`/dashboard/profile/${claims?.username}`);
      }

      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push(`/dashboard/peer`);
      }

      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push(`/dashboard/settings`);
      }

      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="sm:w-full w-auto max-w-lg">
      <div className="relative w-full ">
        <Input
          placeholder="Search"
          onClick={() => setOpen(true)}
          className="cursor-pointer pr-16 w-full "
          readOnly
        />
        {!isMobile && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="bg-muted text-muted-foreground inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-70 select-none">
              <span className="text-xs">{commandKey}</span>+ J
            </kbd>
          </div>
        )}
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for your friend or Notes..." />

        <CommandList>
          <ScrollArea className="h-60">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem asChild>
                <Link
                  href="/dashboard/notes/upload"
                  onClick={() => setOpen(false)}
                >
                  <UploadIcon />
                  <span>Upload New Notes</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link href="/dashboard/quiz/" onClick={() => setOpen(false)}>
                  <FileLockIcon />
                  <span>Find Quiz</span>
                </Link>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Suggestions">
              <CommandItem asChild>
                <Link
                  href="/dashboard/carrymark-calculator"
                  onClick={() => setOpen(false)}
                >
                  <LucideCalculator />
                  <span>CarryMark Calculator</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link
                  href="/dashboard/schedule-manager"
                  onClick={() => setOpen(false)}
                >
                  <ListTodoIcon />
                  <span>Schedule Manager</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link
                  href="/dashboard/past-year"
                  onClick={() => setOpen(false)}
                >
                  <BookOpen />
                  <span>Past Year Paper</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link href="/dashboard/chat" onClick={() => setOpen(false)}>
                  <MessageCircleIcon />
                  <span>Chat Center</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link
                  href="/dashboard/leaderboard"
                  onClick={() => setOpen(false)}
                >
                  <TrophyIcon />
                  <span>Leaderboard</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link href="/dashboard/peer" onClick={() => setOpen(false)}>
                  <UsersIcon />
                  <span>Find Friends</span>
                </Link>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem asChild>
                <Link
                  href={`/dashboard/profile/${claims?.username}`}
                  onClick={() => setOpen(false)}
                >
                  <User />
                  <span>My Profile</span>
                  <CommandShortcut>{commandKey} + P</CommandShortcut>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link href={`/dashboard/peer`} onClick={() => setOpen(false)}>
                  <UsersIcon />
                  <span>Peers</span>
                  <CommandShortcut>{commandKey} + F</CommandShortcut>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link href="/dashboard/settings" onClick={() => setOpen(false)}>
                  <Settings />
                  <span>Settings</span>
                  <CommandShortcut>{commandKey} + S</CommandShortcut>
                </Link>
              </CommandItem>
            </CommandGroup>
          </ScrollArea>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
