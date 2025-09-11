"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,

  Search,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import NoteCard from "@/components/notes/note-card";
import { notFound } from "next/navigation";
import { useNotes, NotesFilters } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  SUBJECTS,
  ACADEMIC_LEVELS,
  NOTE_TYPES,
  LANGUAGES,
  DIFFICULTY_LEVELS,
} from "@/types/notes";

interface UserNotesPageProps {
  params: Promise<{ username: string }>;
}

function UserNotesContent({ username }: { username: string }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const {
    data,
    loading,
    error,
    filters,
    currentPage,
    updateFilters,
    clearFilters,
    goToPage,
  } = useNotes({
    username,
    initialFilters: { sortBy: "created_at", sortDirection: "desc" },
    autoLoad: true,
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    notFound();
  }

  const { notes, userProfile, total, limit } = data;

  // Filter options
  const filterOptions = {
    subjects: SUBJECTS,
    noteTypes: NOTE_TYPES,
    languages: LANGUAGES,
    difficulties: DIFFICULTY_LEVELS,
    academicLevels: ACADEMIC_LEVELS,
  };

  // Handle filter changes
  const handleFilterChange = (
    key: keyof NotesFilters,
    value: string | undefined
  ) => {
    updateFilters({ [key]: value === "all" ? undefined : value });
  };

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Simple debounce - you might want to use a proper debounce hook
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value || undefined });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Pagination
  const totalPages = Math.ceil(total / limit);
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);


  return (
    <div className="container mx-auto space-y-4">
      {/* Search and Filter Bar */}
      <div className="pb-2">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search notes by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={isFiltersOpen ? "default" : "outline"}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  isFiltersOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
                <SelectItem value="view_count">Views</SelectItem>
                <SelectItem value="like_count">Likes</SelectItem>
                <SelectItem value="estimated_read_time">Read Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collapsible Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <Label>Subject</Label>
                <Select
                  value={filters.subject}
                  onValueChange={(value) =>
                    handleFilterChange("subject", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any subject</SelectItem>
                    {filterOptions.subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Note Type</Label>
                <Select
                  value={filters.noteType}
                  onValueChange={(value) =>
                    handleFilterChange("noteType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any type</SelectItem>
                    {filterOptions.noteTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Language</Label>
                <Select
                  value={filters.language}
                  onValueChange={(value) =>
                    handleFilterChange("language", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any language</SelectItem>
                    {filterOptions.languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) =>
                    handleFilterChange("difficulty", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any difficulty</SelectItem>
                    {filterOptions.difficulties.map((difficulty) => (
                      <SelectItem
                        key={difficulty.value}
                        value={difficulty.value}
                      >
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Academic Level</Label>
                <Select
                  value={filters.academicLevel}
                  onValueChange={(value) =>
                    handleFilterChange("academicLevel", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any level</SelectItem>
                    {filterOptions.academicLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearFilters();
                    setSearchTerm("");
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear all filters
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {userProfile?.fullName || userProfile?.username}&apos;s Notes
          </h2>
          <p className="text-muted-foreground">
            {total > 0
              ? `Showing ${startItem}-${endItem} of ${total} notes`
              : "No notes found"}
          </p>
        </div>
        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground">
              {userProfile?.fullName || userProfile?.username} doesn&apos;t have
              any public notes matching your criteria.
            </p>
            {activeFiltersCount > 0 && (
              <Button
                onClick={() => {
                  clearFilters();
                  setSearchTerm("");
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {getPageNumbers().map((pageNum: number) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(pageNum);
                  }}
                  isActive={pageNum === currentPage}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default async function UserNotesPage({ params }: UserNotesPageProps) {
  const { username } = await params;
  return <UserNotesContent username={username} />;
}
