"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StoreButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative hover:bg-accent transition-colors"
          >
            <Link href="/dashboard/store">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Points Store</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Points Store</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
