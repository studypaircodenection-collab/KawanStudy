import { NextRequest, NextResponse } from "next/server";

const UITM_API_URL =
  "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result.cfm";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Create a new FormData object to forward to UiTM
    const uitmFormData = new FormData();
    uitmFormData.append("cam_name", formData.get("cam_name") as string);

    if (formData.get("fac_name")) {
      uitmFormData.append("fac_name", formData.get("fac_name") as string);
    }

    uitmFormData.append("subj_code", formData.get("subj_code") as string);
    uitmFormData.append(
      "semester",
      (formData.get("semester") as string) || "20254"
    );

    // Make request to UiTM system
    const response = await fetch(UITM_API_URL, {
      method: "POST",
      body: uitmFormData,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!response.ok) {
      throw new Error(`UiTM API returned status: ${response.status}`);
    }

    const htmlText = await response.text();

    // Parse the HTML and extract timetable data
    const timetableData = parseUiTMResponse(htmlText);

    return NextResponse.json({
      success: true,
      data: timetableData,
      rawHtml: htmlText, // Include raw HTML for debugging
    });
  } catch (error) {
    console.error("UiTM API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch data from UiTM system",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function parseUiTMResponse(html: string) {
  // This is a server-side HTML parser using regex since DOMParser is not available
  const timetableData: any[] = [];

  try {
    // Look for table rows containing timetable data
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
    const tableMatches = html.match(tableRegex);

    if (tableMatches) {
      for (const table of tableMatches) {
        // Extract rows from the table
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const rows = [...table.matchAll(rowRegex)];

        // Skip header row (index 0) and process data rows
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i][1];
          const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
          const cells = [...row.matchAll(cellRegex)];

          if (cells.length >= 7) {
            const entry = {
              courseCode: cleanText(cells[0]?.[1] || ""),
              courseName: cleanText(cells[1]?.[1] || ""),
              section: cleanText(cells[2]?.[1] || ""),
              day: cleanText(cells[3]?.[1] || ""),
              time: cleanText(cells[4]?.[1] || ""),
              venue: cleanText(cells[5]?.[1] || ""),
              lecturer: cleanText(cells[6]?.[1] || ""),
              creditHours: parseInt(cleanText(cells[7]?.[1] || "0")) || 0,
            };

            // Only add if we have essential data
            if (entry.courseCode && entry.courseName) {
              timetableData.push(entry);
            }
          }
        }
      }
    }

    // If no structured data found, look for "No Record Found" message
    if (timetableData.length === 0) {
      const noRecordPattern = /no\s+record\s+found/i;
      if (noRecordPattern.test(html)) {
        return []; // Return empty array for "no records found"
      }
    }
  } catch (parseError) {
    console.error("HTML parsing error:", parseError);
  }

  return timetableData;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .trim(); // Remove leading/trailing whitespace
}

export async function GET() {
  return NextResponse.json(
    {
      message: "UiTM Schedule API - Use POST method with form data",
      requiredFields: ["cam_name", "subj_code"],
      optionalFields: ["fac_name", "semester"],
    },
    { status: 405 }
  );
}
