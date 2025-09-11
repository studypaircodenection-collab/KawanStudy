"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Loader2,
  Search,
  Calendar,
  MapPin,
  GraduationCap,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// Types based on the UiTM API structure
interface TimetableEntry {
  courseCode: string;
  courseName: string;
  section: string;
  day: string;
  time: string;
  venue: string;
  lecturer: string;
  creditHours: number;
}

// Mock data based on the real UiTM system - converted for combobox
const campusOptions = [
  { value: "B", label: "SELANGOR CAMPUS - ( Please Select a Faculty )" },
  { value: "APB", label: "SELANGOR CAMPUS - LANGUAGE COURSES" },
  { value: "CITU", label: "SELANGOR CAMPUS - CITU COURSES" },
  { value: "HEP", label: "SELANGOR CAMPUS - CO-CURRICULUM COURSES" },
  { value: "A", label: "A - UITM KAMPUS SERI ISKANDAR" },
  { value: "A4", label: "A4 - UITM KAMPUS TAPAH" },
  { value: "B10", label: "B10 - UITM KAMPUS DENGKIL" },
  { value: "C", label: "C - UITM KAMPUS JENGKA" },
  { value: "C3", label: "C3 - UITM KAMPUS RAUB" },
  { value: "D", label: "D - UITM KAMPUS MACHANG" },
  { value: "D2", label: "D2 - UITM KAMPUS KOTA BHARU" },
  { value: "J", label: "J - UITM KAMPUS SEGAMAT" },
  { value: "J4", label: "J4 - UITM KAMPUS PASIR GUDANG" },
  { value: "K", label: "K - UITM KAMPUS SUNGAI PETANI" },
  { value: "M", label: "M - UITM KAMPUS ALOR GAJAH" },
  { value: "M1", label: "M1 - UITM KAMPUS BANDARAYA MELAKA" },
  { value: "M3", label: "M3 - UITM KAMPUS JASIN" },
];

const facultyOptions = [
  { value: "CS", label: "CS - FACULTY OF COMPUTER AND MATHEMATICAL SCIENCES" },
  { value: "ED", label: "ED - FACULTY OF EDUCATION" },
  { value: "BM", label: "BM - FACULTY OF BUSINESS MANAGEMENT" },
  { value: "EC", label: "EC - FACULTY OF ECONOMICS AND MANAGEMENT" },
  { value: "EE", label: "EE - FACULTY OF ELECTRICAL ENGINEERING" },
  { value: "ME", label: "ME - FACULTY OF MECHANICAL ENGINEERING" },
  {
    value: "AR",
    label: "AR - FACULTY OF ARCHITECTURE, PLANNING AND SURVEYING",
  },
  { value: "AD", label: "AD - FACULTY OF ART AND DESIGN" },
  { value: "HS", label: "HS - FACULTY OF HEALTH SCIENCES" },
  { value: "PH", label: "PH - FACULTY OF PHARMACY" },
];

// Mock timetable data
const mockTimetableData: TimetableEntry[] = [
  {
    courseCode: "CSC508",
    courseName: "SOFTWARE ENGINEERING",
    section: "CS2434A",
    day: "MONDAY",
    time: "08:00 - 11:00",
    venue: "MAKMAL KOMPUTER 1 (FK)",
    lecturer: "DR. AHMAD BIN ALI",
    creditHours: 3,
  },
  {
    courseCode: "CSC508",
    courseName: "SOFTWARE ENGINEERING",
    section: "CS2434A",
    day: "WEDNESDAY",
    time: "14:00 - 17:00",
    venue: "BILIK KULIAH 5 (FK)",
    lecturer: "DR. AHMAD BIN ALI",
    creditHours: 3,
  },
  {
    courseCode: "CSC583",
    courseName: "MOBILE APPLICATION DEVELOPMENT",
    section: "CS2434B",
    day: "TUESDAY",
    time: "09:00 - 12:00",
    venue: "MAKMAL KOMPUTER 2 (FK)",
    lecturer: "DR. SITI AMINAH",
    creditHours: 3,
  },
  {
    courseCode: "CSC583",
    courseName: "MOBILE APPLICATION DEVELOPMENT",
    section: "CS2434B",
    day: "THURSDAY",
    time: "15:00 - 18:00",
    venue: "BILIK KULIAH 3 (FK)",
    lecturer: "DR. SITI AMINAH",
    creditHours: 3,
  },
];

const UiTMSchedulePage = () => {
  const [selectedCampus, setSelectedCampus] = useState<string>("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [courseCode, setCourseCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFacultyDropdown, setShowFacultyDropdown] =
    useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<TimetableEntry[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentSemester, setCurrentSemester] = useState<string>("20254");

  // Effect to show faculty dropdown when campus is selected
  useEffect(() => {
    if (selectedCampus && selectedCampus !== "") {
      setShowFacultyDropdown(true);
    } else {
      setShowFacultyDropdown(false);
      setSelectedFaculty("");
    }
  }, [selectedCampus]);

  const handleSearch = async () => {
    if (!selectedCampus) {
      toast.error("Please select a valid Campus");
      return;
    }

    if (!courseCode.trim()) {
      toast.error("Please enter a course code");
      return;
    }

    setIsLoading(true);
    setHasSearched(false);

    try {
      // Create form data matching the original UiTM system
      const formData = new FormData();
      formData.append("search_campus", selectedCampus);
      if (selectedFaculty) {
        formData.append("search_faculty", selectedFaculty);
      }
      formData.append("search_course", courseCode.toUpperCase());

      // Make API call through our proxy
      const response = await fetch("/api/uitm-schedule", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      const parsedResults = result.data || [];
      setSearchResults(parsedResults);
      setHasSearched(true);

      if (parsedResults.length === 0) {
        toast.info(
          "No records found. Please try again with a different Campus/Faculty/Course."
        );
      } else {
        toast.success(`Found ${parsedResults.length} timetable entries`);
      }
    } catch (error) {
      console.error("Search error:", error);

      // Fallback to mock data if API fails (for development/demo purposes)
      toast.warning("Unable to connect to UiTM system. Showing demo data.");

      const filteredResults = mockTimetableData.filter((entry) =>
        entry.courseCode.toLowerCase().includes(courseCode.toLowerCase())
      );

      setSearchResults(filteredResults);
      setHasSearched(true);

      if (filteredResults.length > 0) {
        toast.info(`Showing ${filteredResults.length} demo entries`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCampus("");
    setSelectedFaculty("");
    setCourseCode("");
    setSearchResults([]);
    setHasSearched(false);
    setShowFacultyDropdown(false);
  };

  return (
    <div className="container mx-auto">
      <div className="max-w-4xl  mx-auto flex items-center py-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">UiTM Class Timetable</h1>
            <p className="text-sm text-muted-foreground">
              Universiti Teknologi MARA
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Search Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              CLASS TIMETABLE
            </CardTitle>
            <CardDescription className="text-base">
              Search for class schedules by selecting your campus and entering a
              course code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campus Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="campus"
                className="text-sm font-medium flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Select a Campus:
              </Label>
              <Combobox
                options={campusOptions}
                value={selectedCampus}
                onValueChange={setSelectedCampus}
                placeholder="Choose your campus..."
                searchPlaceholder="Search campus..."
                emptyMessage="No campus found."
                clearable={true}
              />
            </div>

            {/* Faculty Selection - Only show when campus is selected */}
            {showFacultyDropdown && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label
                  htmlFor="faculty"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Select a Faculty (if relevant):
                </Label>
                <Combobox
                  options={facultyOptions}
                  value={selectedFaculty}
                  onValueChange={setSelectedFaculty}
                  placeholder="Choose your faculty (optional)..."
                  searchPlaceholder="Search faculty..."
                  emptyMessage="No faculty found."
                  clearable={true}
                />
              </div>
            )}

            {/* Course Code Input */}
            <div className="space-y-2">
              <Label htmlFor="courseCode" className="text-sm font-medium">
                Course Code:
              </Label>
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., CSC508, CSC583, ITT440..."
                className="w-full"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Search Results
                  </CardTitle>
                  <CardDescription>Semester: {currentSemester}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {searchResults.length}{" "}
                  {searchResults.length === 1 ? "result" : "results"} found
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {searchResults.length === 0 ? (
                <div className="space-y-2 text-center py-4">
                  <p className="font-semibold">No Record Found</p>
                  <p>Please Try Again With a Different Campus/Faculty/Course</p>
                  <p>Or Your Campus are not Open for display</p>
                  <p className="text-sm text-muted-foreground">Thank You</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((entry, index) => (
                    <Card
                      key={index}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h3 className="font-semibold text-lg text-purple-700">
                              {entry.courseCode}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {entry.courseName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Section: {entry.section}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{entry.day}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span>{entry.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <span>{entry.venue}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <GraduationCap className="h-4 w-4 text-purple-600" />
                              <span>{entry.lecturer}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Credit Hours:</span>{" "}
                              {entry.creditHours}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          © 2022 Academic Affairs Division.
        </div>
      </div>
    </div>
  );
};

export default UiTMSchedulePage;
