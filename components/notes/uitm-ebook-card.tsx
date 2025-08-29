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

interface UiTMEbookCardProps {
  ebook: UiTMEbook;
}

const UiTMEbookCard: React.FC<UiTMEbookCardProps> = ({ ebook }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img
              src={ebook.image}
              alt={ebook.title}
              className="w-32 h-full object-cover rounded border bg-gray-100"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-book.png";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="text-lg font-semibold leading-tight line-clamp-2 mb-2">
                {ebook.title}
              </h3>

              {ebook.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {ebook.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">Author:</span>
                <span className="truncate">{ebook.author}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Publisher:</span>
                <span className="truncate">{ebook.publisher}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Year:</span>
                <Badge variant="outline" className="text-xs">
                  {ebook.publishYear}
                </Badge>
              </div>

              {ebook.isbn && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">ISBN:</span>
                  <span className="text-xs font-mono">{ebook.isbn}</span>
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
              <Button asChild size="sm">
                <a
                  href={`https://mykmsearch.uitm.edu.my/beta/${ebook.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Access E-book
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
