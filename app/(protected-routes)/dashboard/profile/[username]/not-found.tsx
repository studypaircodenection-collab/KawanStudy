import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, ArrowLeft, Search } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <UserX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              The user profile you're looking for doesn't exist or may have been
              removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                This could happen if:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• The username was typed incorrectly</li>
                <li>• The user changed their username</li>
                <li>• The account was deactivated</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Leaderboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
