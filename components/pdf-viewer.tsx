"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  Maximize,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface PDFViewerProps {
  fileUrl: string;
  title?: string;
  onDownload?: () => void;
  className?: string;
}

export default function PDFViewer({
  fileUrl,
  title,
  onDownload,
  className = "",
}: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const openInNewTab = () => {
    window.open(fileUrl, "_blank");
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              PDF Preview Unavailable
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              The PDF cannot be displayed in the browser preview. You can still
              open or download the file.
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="default" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            {onDownload && (
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Button variant="outline" size="sm" onClick={openInNewTab}>
        <Maximize className="h-4 w-4 mr-1" />
        Full Screen
      </Button>

      {/* PDF Document */}
      <Card className="relative overflow-hidden p-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Loading PDF...
              </span>
            </div>
          </div>
        )}

        <div className="p-4" style={{ zoom: `100%` }}>
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=${1}&view=FitH`}
            className="w-full border-0 shadow-sm rounded h-[1000px]"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title || "PDF Document"}
            allow="fullscreen"
          />
        </div>
      </Card>

      {/* Alternative Viewers */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">
          Having trouble viewing the PDF? Try these alternatives:
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(
                `https://docs.google.com/viewer?url=${encodeURIComponent(
                  fileUrl
                )}&embedded=true`,
                "_blank"
              )
            }
          >
            Google Docs Viewer
          </Button>
          <Button variant="ghost" size="sm" onClick={openInNewTab}>
            Browser PDF Viewer
          </Button>
        </div>
      </div>
    </div>
  );
}
