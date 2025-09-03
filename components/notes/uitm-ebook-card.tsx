"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  User,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";
import { UiTMEbook } from "@/lib/types";
import { Text } from "../ui/typography";

interface UiTMEbookCardProps {
  ebook: UiTMEbook;
}

const UiTMEbookCard: React.FC<UiTMEbookCardProps> = ({ ebook }) => {
  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-shrink-0 self-start">
            <img
              src={ebook.image}
              alt={ebook.title}
              className="w-20 sm:w-24 md:w-32 h-fit max-w-full object-contain rounded"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-book.png";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <Text as="h3">{ebook.title}</Text>

              {ebook.description && <Text as="p">{ebook.description}</Text>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="text-foreground font-medium flex-shrink-0">
                  Author:
                </span>
                <span className="truncate min-w-0">{ebook.author}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="text-foreground font-medium flex-shrink-0">
                  Publisher:
                </span>
                <span className="truncate min-w-0">{ebook.publisher}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="text-foreground font-medium">Year:</span>
                <Badge variant="outline" className="text-xs">
                  {ebook.publishYear}
                </Badge>
              </div>

              {ebook.isbn && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <BookOpen className="h-4 w-4 flex-shrink-0" />
                  <span className="text-foreground font-medium flex-shrink-0">
                    ISBN:
                  </span>
                  <span className="text-xs font-mono truncate min-w-0">
                    {ebook.isbn}
                  </span>
                </div>
              )}

              {ebook.subject && (
                <div className="pt-1">
                  <Badge variant="secondary" className="text-xs">
                    {ebook.subject}
                  </Badge>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button asChild size="sm" className="w-full sm:w-auto">
                <a
                  href={`https://mykmsearch.uitm.edu.my/beta/${ebook.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 min-w-0"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Access E-book</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UiTMEbookCard;
