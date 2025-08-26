import {
  BookOpen,
  ListTodoIcon,
  LucideCalculator,
  Settings,
  User,
} from "lucide-react";
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
export function SearchForm() {
  const [open, setOpen] = React.useState(false);

  const { isMobile } = useSidebar();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="w-full sm:ml-auto sm:w-auto">
      <div className="flex gap-2 items-center">
        {!isMobile ? (
          <p className="text-muted-foreground text-sm">
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
              <span className="text-xs">⌘</span>J
            </kbd>
          </p>
        ) : null}
        <Input
          placeholder="Search"
          onClick={() => setOpen(true)}
          className="cursor-pointer"
        />
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for your friend or Notes..." />

        <CommandList>
          <ScrollArea className="h-60">
            <CommandEmpty>No results found.</CommandEmpty>
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
                  <BookOpen />
                  <span>Chat Center</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link
                  href="/dashboard/leaderboard"
                  onClick={() => setOpen(false)}
                >
                  <BookOpen />
                  <span>Leaderboard</span>
                </Link>
              </CommandItem>
              <CommandItem asChild>
                <Link href="/dashboard/peer" onClick={() => setOpen(false)}>
                  <BookOpen />
                  <span>Find Friends</span>
                </Link>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <User />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </ScrollArea>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
