import React, { useState, useEffect } from "react";
import {
  NoteSearchFilters,
  SUBJECTS,
  ACADEMIC_LEVELS,
  NOTE_TYPES,
  LANGUAGES,
  DIFFICULTY_LEVELS,
} from "@/types/notes";
import { notesService, NotesListResponse } from "@/lib/services/notes";
import NoteCard from "@/components/notes/note-card";
import { Search, BookOpen, ChevronDown, X } from "lucide-react";
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

const KawanStudyNotes = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<NoteSearchFilters>({});
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [notesData, setNotesData] = useState<NotesListResponse>({
    notes: [],
    total: 0,
    page: 1,
    limit: 10,
    hasMore: false,
  });

  // Load notes data
  const loadNotes = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const result = await notesService.searchNotes(
        searchTerm,
        filters,
        sortBy,
        sortDirection,
        currentPage,
        10
      );

      if (resetPage) {
        setNotesData(result);
        setPage(1);
      } else {
        // Append new notes for pagination
        setNotesData((prev) => ({
          ...result,
          notes:
            currentPage === 1 ? result.notes : [...prev.notes, ...result.notes],
        }));
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load notes on component mount and when filters change
  useEffect(() => {
    loadNotes(true);
  }, [searchTerm, filters, sortBy, sortDirection]);

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && notesData.hasMore) {
      setPage((prev) => prev + 1);
      loadNotes(false);
    }
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
    key: keyof NoteSearchFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  // Handle search term change with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Active filters count
  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          KawanStudy Public Notes
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover and explore academic notes from our community
        </p>
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
              className="pl-10 h-12"
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

            <Select value={sortBy} onValueChange={setSortBy}>
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
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Subject
                </label>
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
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Note Type
                </label>
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
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Language
                </label>
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
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Difficulty
                </label>
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
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Academic Level
                </label>
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
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear all filters
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Results Header */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-muted-foreground">
          Showing {notesData.notes.length} of {notesData.total} notes
        </p>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {notesData.notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {/* Load More / Pagination */}
      {notesData.hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Notes"}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {notesData.notes.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            No notes found
          </h3>
          <p className="text-slate-500 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button onClick={clearFilters}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
};

export default KawanStudyNotes;
