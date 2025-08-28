"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Calendar,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Text } from "@/components/ui/typography";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Paper {
  title: string;
  faculty: string;
  session: string;
  year: string;
  link: string;
  image: string;
}

interface SearchQuery {
  query?: string;
  faculty?: string;
  session?: string;
  year?: string;
  page?: number;
}

const faculties = [
  "CENTRE OF FOUNDATION STUDIES",
  "ACCOUNTANCY",
  "APPLIED SCIENCES",
  "BUSINESS MANAGEMENT",
  "COMPUTER SCIENCES AND MATHEMATIC",
  "ELECTRICAL ENGINEERING",
  "MECHANICAL ENGINEERING",
  "CIVIL ENGINEERING",
  "CHEMICAL ENGINEERING",
  "ARCHITECTURE, PLANNING, AND SURVEYING",
  "LAW",
  "EDUCATION",
  "HEALTH SCIENCES",
  "PHARMACY",
  "DENTISTRY",
  "PLANTATION AND AGROTECHNOLOGY",
  "HOTEL AND TOURISM MANAGEMENT",
  "COMMUNICATION AND MEDIA STUDIES",
  "ART AND DESIGN",
  "MUSIC",
  "FILM, THEATRE AND ANIMATION",
  "ACADEMY OF LANGUAGE STUDIES",
  "ACADEMY OF CONTEMPORARY ISLAMIC STUDIES",
  "ADMINISTRATIVE SCIENCE AND POLICY STUDIES",
  "INFORMATION MANAGEMENT",
  "SPORTS SCIENCE AND RECREATION",
];

const UiTMLibrary = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    faculty: "",
    session: "",
    year: "",
    page: 1,
  });

  const years = Array.from({ length: 26 }, (_, i) => (2025 - i).toString());

  const FetchData = async (params: SearchQuery = searchQuery) => {
    setLoading(true);
    try {
      // Build the URL with search parameters
      let searchUrl =
        "https://mykmsearch.uitm.edu.my/beta/page.php?p=02&type=ad&searchby=1&category=EXAM+PAPER";

      if (params.query) {
        searchUrl += `&query=${encodeURIComponent(params.query)}`;
      }
      if (params.faculty) {
        searchUrl += `&author=${encodeURIComponent(params.faculty)}`;
      }
      if (params.year) {
        searchUrl += `&year=${encodeURIComponent(params.year)}`;
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
      const data: Paper[] = cards.map((card) => {
        // Extract title from the link
        const titleLink = card.querySelector(".card-title a");
        const title =
          titleLink?.textContent?.trim().replace(/^#\d+\s*-?\s*/, "") || "";

        // Extract details from paragraph elements
        const paragraphs = Array.from(card.querySelectorAll("p"));
        let faculty = "";
        let session = "";
        let year = "";

        paragraphs.forEach((p) => {
          const text = p.textContent || "";
          if (text.includes("Faculty:")) {
            faculty = text.replace("Faculty:", "").trim();
          } else if (text.includes("Session:")) {
            session = text.replace("Session:", "").trim();
          } else if (text.includes("Year:")) {
            year = text.replace("Year:", "").trim();
          }
        });

        const link = titleLink?.getAttribute("href") || "";
        const image = card.querySelector("img")?.getAttribute("src") || "";

        return { title, faculty, session, year, link, image };
      });

      setPapers(data.filter((paper) => paper.title)); // Filter out empty titles
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exam papers:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    FetchData(searchQuery);
  };

  const handleReset = () => {
    const resetQuery = {
      query: "",
      faculty: "",
      session: "",
      year: "",
      page: 1,
    };
    setSearchQuery(resetQuery);
    FetchData(resetQuery);
  };

  useEffect(() => {
    FetchData();
  }, []);

  return (
    <div className="space-y-4">
      <Alert variant={"destructive"}>
        <AlertTriangle />
        <AlertTitle>Heads up Non-UiTM Peeps!</AlertTitle>
        <AlertDescription>
          To Access the notes under this category, you are required to log in
          through UiTM PERMATA Library. Which is only available for UiTM
          Students.
        </AlertDescription>
      </Alert>
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          UiTM Past Year Exam Papers
        </h1>

        {/* Search Form */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Query */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Subject/Course
            </label>
            <Input
              placeholder="Enter subject name..."
              value={searchQuery.query || ""}
              onChange={(e) =>
                setSearchQuery({ ...searchQuery, query: e.target.value })
              }
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Faculty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Faculty
            </label>
            <Select
              value={searchQuery.faculty || undefined}
              onValueChange={(value) =>
                setSearchQuery({
                  ...searchQuery,
                  faculty: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Year
            </label>
            <Select
              value={searchQuery.year || undefined}
              onValueChange={(value) =>
                setSearchQuery({
                  ...searchQuery,
                  year: value === "all" ? "" : value,
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
        {(searchQuery.query || searchQuery.faculty || searchQuery.year) && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm font-medium">Active filters:</span>
            {searchQuery.query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Subject: {searchQuery.query}
                <button
                  onClick={() => setSearchQuery({ ...searchQuery, query: "" })}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery.faculty && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Faculty: {searchQuery.faculty.substring(0, 20)}...
                <button
                  onClick={() =>
                    setSearchQuery({ ...searchQuery, faculty: "" })
                  }
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery.year && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Year: {searchQuery.year}
                <button
                  onClick={() => setSearchQuery({ ...searchQuery, year: "" })}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading exam papers...</span>
          </CardContent>
        </Card>
      ) : papers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No exam papers found.</p>
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
              Showing {papers.length} exam papers
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {papers.map((paper, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={paper.image}
                      alt={paper.title}
                      className="w-16 h-20 object-cover rounded border bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-book.png";
                      }}
                    />
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-semibold leading-tight">
                        <a
                          href={`https://mykmsearch.uitm.edu.my/beta/${paper.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {paper.title}
                        </a>
                      </h3>

                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Faculty:</span>
                          <span className="text-gray-600">{paper.faculty}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Year:</span>
                          <Badge variant="outline" className="text-xs">
                            {paper.year}
                          </Badge>
                        </div>
                      </div>

                      {paper.session && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Session:</span>{" "}
                          {paper.session}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-3xl">
        <Text as="h3">Disclaimer</Text>
        <Text as="p" styleVariant="muted">
          The exam papers provided are for educational purposes only. KawanStudy
          do not claim ownership of any content or materials on this page. All
          rights of the respective owners are acknowledged. visit{" "}
          <a
            href="https://www.uitm.edu.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            UITM Official Website
          </a>
          .
        </Text>
      </div>
    </div>
  );
};

export default UiTMLibrary;
