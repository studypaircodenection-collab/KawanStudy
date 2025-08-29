"use client";

import React, { useEffect, useState } from "react";
import { UiTMEbook, EbookSearchQuery } from "@/lib/types";
import { Search, BookOpen, AlertTriangle, User, Calendar } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import UiTMEbookCard from "./uitm-ebook-card";

const UiTMNotes = () => {
  const [ebooks, setEbooks] = useState<UiTMEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<EbookSearchQuery>({
    query: "",
    author: "",
    publishYear: "",
    page: 1,
  });

  // Generate years from 1950 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) =>
    (currentYear - i).toString()
  );

  const fetchEbooks = async (params: EbookSearchQuery = searchQuery) => {
    setLoading(true);
    try {
      // Build the URL with search parameters for EBOOK category
      let searchUrl =
        "https://mykmsearch.uitm.edu.my/beta/page.php?p=02&type=ad&searchby=1&category=EBOOK";

      if (params.query) {
        searchUrl += `&query=${encodeURIComponent(params.query)}`;
      }
      if (params.author) {
        searchUrl += `&author=${encodeURIComponent(params.author)}`;
      }
      if (params.publishYear) {
        searchUrl += `&year=${encodeURIComponent(params.publishYear)}`;
      }
      if (params.page && params.page > 1) {
        searchUrl += `&page=${params.page}`;
      }

      const proxyUrl = `/api/proxy?url=${encodeURIComponent(searchUrl)}`;

      const res = await fetch(proxyUrl);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const cards = Array.from(doc.querySelectorAll(".card"));
      const data: UiTMEbook[] = cards.map((card) => {
        // Extract title from the link
        const titleLink = card.querySelector(".card-title a");

        const title =
          titleLink?.textContent?.trim().replace(/^#\d+\s*-?\s*/, "") || "";
        const em = card.getElementsByTagName("em");
        const description = em.length > 0 ? em[0].textContent : "";
        // Extract details from paragraph elements
        const paragraphs = Array.from(card.querySelectorAll("p"));
        let author = "";
        let publisher = "";
        let publishYear = "";
        let isbn = "";
        let subject = "";

        paragraphs.forEach((p) => {
          const text = p.textContent || "";
          if (text.includes("Author/Editor:")) {
            author = text.replace("Author/Editor:", "").trim();
          } else if (text.includes("Publisher:")) {
            publisher = text.replace("Publisher:", "").trim();
          } else if (text.includes("Publish Year:") || text.includes("Year:")) {
            publishYear = text.replace(/Publish Year:|Year:/, "").trim();
          } else if (text.includes("ISBN:")) {
            isbn = text.replace("ISBN:", "").trim();
          } else if (text.includes("Subject:")) {
            subject = text.replace("Subject:", "").trim();
          }
        });

        const link = titleLink?.getAttribute("href") || "";
        const image = card.querySelector("img")?.getAttribute("src") || "";

        return {
          title,
          description,
          author,
          publisher,
          publishYear,
          isbn,
          subject,
          link,
          image,
        };
      });

      setEbooks(data.filter((ebook) => ebook.title)); // Filter out empty titles
      console.log("Fetched e-books:", data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching e-books:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEbooks(searchQuery);
  };

  const handleReset = () => {
    const resetQuery = {
      query: "",
      author: "",
      publishYear: "",
      page: 1,
    };
    setSearchQuery(resetQuery);
    fetchEbooks(resetQuery);
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  // Active filters count
  const activeFiltersCount = Object.values(searchQuery).filter(
    (value) => value && value !== 1
  ).length;

  return (
    <div className="space-y-6">
      <Alert variant={"destructive"}>
        <AlertTriangle />
        <AlertTitle>Heads up Non-UiTM Peeps!</AlertTitle>
        <AlertDescription>
          To Access the e-books under this category, you are required to log in
          through UiTM PERMATA Library. Which is only available for UiTM
          Students.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          UiTM E-Book Digital Library
        </h1>
        <p className="text-slate-600 text-lg">
          Discover and explore E-Books provided by UiTM PTAR database.
        </p>
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Query */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Book Title
          </label>
          <Input
            placeholder="Enter book title..."
            value={searchQuery.query || ""}
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, query: e.target.value })
            }
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Author Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <User className="h-4 w-4" />
            Author
          </label>
          <Input
            placeholder="Enter author name..."
            value={searchQuery.author || ""}
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, author: e.target.value })
            }
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Publish Year Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Publish Year
          </label>
          <Select
            value={searchQuery.publishYear || undefined}
            onValueChange={(value) =>
              setSearchQuery({
                ...searchQuery,
                publishYear: value === "all" ? "" : value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Actions */}
        <div className="space-y-2">
          <label className="text-sm font-medium invisible">Actions</label>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm font-medium">Active filters:</span>
          {searchQuery.query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Title: {searchQuery.query}
              <button
                onClick={() => setSearchQuery({ ...searchQuery, query: "" })}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
          {searchQuery.author && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Author: {searchQuery.author}
              <button
                onClick={() => setSearchQuery({ ...searchQuery, author: "" })}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
          {searchQuery.publishYear && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Year: {searchQuery.publishYear}
              <button
                onClick={() =>
                  setSearchQuery({ ...searchQuery, publishYear: "" })
                }
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Section */}
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading e-books...</span>
          </CardContent>
        </Card>
      ) : ebooks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No e-books found.</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search criteria or clear filters to see more
              results.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {ebooks.length} e-books
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {ebooks.map((ebook, idx) => (
              <UiTMEbookCard key={idx} ebook={ebook} />
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="max-w-3xl">
        <h3 className="text-lg font-semibold mb-2">Disclaimer</h3>
        <p className="text-sm text-gray-600">
          The e-books provided are for educational purposes only. KawanStudy
          does not claim ownership of any content or materials on this page. All
          rights of the respective owners are acknowledged. Visit{" "}
          <a
            href="https://www.uitm.edu.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            UiTM Official Website
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default UiTMNotes;
