"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ChevronDown, X } from "lucide-react";
import { PaperCard } from "./paper-card";
import { PaperUploadForm } from "./paper-upload-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface Paper {
  id: string;
  title: string;
  description?: string;
  subject: string;
  academicLevel: string;
  year: number;
  institution?: string;
  courseCode?: string;
  courseName?: string;
  professor?: string;
  semester?: string;
  tags: string[];
  paperType?: string;
  language: string;
  difficultyLevel: string;
  hasSolution: boolean;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  userProfile: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

interface PaperBrowserProps {
  showUploadButton?: boolean;
}

export function PaperBrowser({ showUploadButton = true }: PaperBrowserProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    subject: "all",
    academicLevel: "all",
    paperType: "all",
    difficultyLevel: "all",
    hasSolution: "all",
    year: "",
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const subjects = [
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "computer_science",
    "engineering",
    "medicine",
    "business",
    "economics",
    "psychology",
    "history",
    "english",
    "philosophy",
    "law",
    "art",
    "other",
  ];

  const academicLevels = [
    "undergraduate_year_1",
    "undergraduate_year_2",
    "undergraduate_year_3",
    "undergraduate_year_4",
    "masters",
    "phd",
    "other",
  ];

  const paperTypes = [
    "exam",
    "quiz",
    "assignment",
    "project",
    "lab_report",
    "research_paper",
    "thesis",
    "other",
  ];

  const difficultyLevels = ["easy", "medium", "hard", "expert"];

  // Active filters count
  const activeFiltersCount =
    Object.values(filters).filter(
      (value) => value && value !== "all" && value !== ""
    ).length + (searchQuery ? 1 : 0);

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (filters.subject && filters.subject !== "all")
        params.append("subject", filters.subject);
      if (filters.academicLevel && filters.academicLevel !== "all")
        params.append("academicLevel", filters.academicLevel);
      if (filters.paperType && filters.paperType !== "all")
        params.append("paperType", filters.paperType);
      if (filters.difficultyLevel && filters.difficultyLevel !== "all")
        params.append("difficultyLevel", filters.difficultyLevel);
      if (filters.hasSolution && filters.hasSolution !== "all")
        params.append("hasSolution", filters.hasSolution);
      if (filters.year) params.append("year", filters.year);

      const response = await fetch(`/api/papers?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }

      const data = await response.json();
      setPapers(data.papers);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [currentPage, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPapers();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      subject: "all",
      academicLevel: "all",
      paperType: "all",
      difficultyLevel: "all",
      hasSolution: "all",
      year: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
    fetchPapers();
  };

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    fetchPapers(); // Refresh the list
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Paper Library</h1>
          <p className="text-muted-foreground">
            Browse and download academic papers shared by the community
          </p>
        </div>

        {showUploadButton && (
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>Upload Paper</Button>
            </DialogTrigger>
            <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Paper</DialogTitle>
              </DialogHeader>
              <PaperUploadForm
                onSuccess={handleUploadSuccess}
                onCancel={() => setShowUploadDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
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
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="view_count">Most Viewed</SelectItem>
                <SelectItem value="like_count">Most Liked</SelectItem>
                <SelectItem value="download_count">Most Downloaded</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collapsible Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <Label>Subject</Label>
                <Select
                  value={filters.subject}
                  onValueChange={(value) =>
                    handleFilterChange("subject", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {academicLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Paper Type</Label>
                <Select
                  value={filters.paperType}
                  onValueChange={(value) =>
                    handleFilterChange("paperType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {paperTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select
                  value={filters.difficultyLevel}
                  onValueChange={(value) =>
                    handleFilterChange("difficultyLevel", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Has Solution</Label>
                <Select
                  value={filters.hasSolution}
                  onValueChange={(value) =>
                    handleFilterChange("hasSolution", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Papers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Papers</SelectItem>
                    <SelectItem value="true">With Solution</SelectItem>
                    <SelectItem value="false">Question Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Year</Label>
                <Input
                  placeholder="Year"
                  type="number"
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  min="2000"
                  max="2030"
                />
              </div>
            </div>

            {/* Clear Filters */}
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

      {/* Papers Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : papers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No papers found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page =
                Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  disabled={isLoading}
                  className="w-10"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
