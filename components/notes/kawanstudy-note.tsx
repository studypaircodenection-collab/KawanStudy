import React, { useState } from "react";
import {
  SUBJECTS,
  ACADEMIC_LEVELS,
  NOTE_TYPES,
  LANGUAGES,
  DIFFICULTY_LEVELS,
} from "@/types/notes";
import { useNotes, NotesFilters } from "@/hooks/use-notes";
import NoteCard from "@/components/notes/note-card";
import { Search, BookOpen, ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Text } from "../ui/typography";
import { Label } from "../ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
  PaginationItem,
  PaginationLink,
} from "../ui/pagination";

const KawanStudyNotes = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    data,
    loading,
    filters,
    currentPage,
    updateFilters,
    clearFilters,
    goToPage,
  } = useNotes({
    initialFilters: { sortBy: "created_at", sortDirection: "desc" },
    autoLoad: true,
  });

  // Default empty data
  const notesData = data || {
    notes: [],
    total: 0,
    page: 1,
    limit: 12,
    hasMore: false,
  };

  console.log("Notes Data:", notesData);

  // Calculate pagination info
  const totalPages = Math.ceil(notesData.total / notesData.limit);
  const startItem = (currentPage - 1) * notesData.limit + 1;
  const endItem = Math.min(currentPage * notesData.limit, notesData.total);

  // Generate page numbers for pagination
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

  // Filter options using the actual constants from types
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

  // Handle search term change with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Simple debounce using setTimeout
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value || undefined });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Active filters count
  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Text as="h2" className="mb-2">
          KawanStudy Public Notes
        </Text>
        <Text as="p" styleVariant="muted" className="text-muted-foreground">
          Discover and explore academic notes from our community
        </Text>
      </div>

      {/* Search and Filter Bar */}
      <div className="pb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search notes by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle and Sort */}
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
      {loading ? (
        <div className="mb-6 flex justify-between items-center">
          <Text as="p" styleVariant="muted">
            {notesData.total > 0
              ? `Showing ${startItem}-${endItem} of ${notesData.total} notes`
              : "No notes found"}
          </Text>
          {totalPages > 1 && (
            <Text as="p" styleVariant="muted" className="text-sm">
              Page {currentPage} of {totalPages}
            </Text>
          )}
        </div>
      ) : null}

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {notesData.notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
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

      {/* Empty State */}
      {!loading && notesData.notes.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <Text as="h3">No notes found</Text>
          <Text as="p" styleVariant="muted">
            Try adjusting your search terms or filters
          </Text>
          <Button
            onClick={() => {
              clearFilters();
              setSearchTerm("");
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default KawanStudyNotes;
