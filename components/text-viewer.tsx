"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Maximize } from "lucide-react";

interface TextContentViewerProps {
  content: string;
  title?: string;
  onDownload?: () => void;
  className?: string;
}

const TextContentViewer = ({
  content,
  title,
  onDownload,
  className = "",
}: TextContentViewerProps) => {
  // Enhanced markdown to HTML converter that matches the rich text editor
  const markdownToHtml = (markdown: string) => {
    let html = markdown;

    // Convert headings (must be done first to avoid conflicts)
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-medium mt-6 mb-3 text-foreground">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-semibold mt-8 mb-4 text-foreground">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>'
    );

    // Convert text formatting
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-foreground">$1</strong>'
    );
    html = html.replace(
      /\*(.*?)\*/g,
      '<em class="italic text-foreground">$1</em>'
    );
    html = html.replace(
      /<u>(.*?)<\/u>/g,
      '<u class="underline text-foreground">$1</u>'
    );

    // Convert quotes
    html = html.replace(
      /^> (.*$)/gim,
      '<blockquote class="border-l-4 border-muted-foreground/30 pl-4 py-2 my-4 bg-muted/20 text-muted-foreground italic">$1</blockquote>'
    );

    // Convert lists - handle multiple consecutive list items
    const lines = html.split("\n");
    let processedLines = [];
    let inUnorderedList = false;
    let inOrderedList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Handle unordered lists
      if (trimmedLine.match(/^- (.+)/)) {
        const listContent = trimmedLine.replace(/^- /, "");
        if (!inUnorderedList) {
          processedLines.push(
            '<ul class="list-disc list-inside space-y-1 my-4 ml-4">'
          );
          inUnorderedList = true;
        }
        if (inOrderedList) {
          processedLines.push("</ol>");
          inOrderedList = false;
          processedLines.push(
            '<ul class="list-disc list-inside space-y-1 my-4 ml-4">'
          );
        }
        processedLines.push(`<li class="text-foreground">${listContent}</li>`);
      }
      // Handle ordered lists
      else if (trimmedLine.match(/^\d+\. (.+)/)) {
        const listContent = trimmedLine.replace(/^\d+\. /, "");
        if (!inOrderedList) {
          processedLines.push(
            '<ol class="list-decimal list-inside space-y-1 my-4 ml-4">'
          );
          inOrderedList = true;
        }
        if (inUnorderedList) {
          processedLines.push("</ul>");
          inUnorderedList = false;
          processedLines.push(
            '<ol class="list-decimal list-inside space-y-1 my-4 ml-4">'
          );
        }
        processedLines.push(`<li class="text-foreground">${listContent}</li>`);
      }
      // Regular line
      else {
        if (inUnorderedList) {
          processedLines.push("</ul>");
          inUnorderedList = false;
        }
        if (inOrderedList) {
          processedLines.push("</ol>");
          inOrderedList = false;
        }

        // Handle empty lines and regular paragraphs
        if (trimmedLine === "") {
          processedLines.push('<br class="my-2">');
        } else if (!trimmedLine.match(/^<(h[1-3]|blockquote)/)) {
          processedLines.push(
            `<p class="mb-3 text-foreground leading-relaxed">${line}</p>`
          );
        } else {
          processedLines.push(line);
        }
      }
    }

    // Close any open lists
    if (inUnorderedList) {
      processedLines.push("</ul>");
    }
    if (inOrderedList) {
      processedLines.push("</ol>");
    }

    return processedLines.join("\n");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
      console.log("Content copied to clipboard");
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  const openInNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${title || "Note Content"}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
              }
              h1, h2, h3 { color: #1a1a1a; margin-top: 2rem; margin-bottom: 1rem; }
              h1 { font-size: 1.5rem; font-weight: bold; }
              h2 { font-size: 1.25rem; font-weight: 600; }
              h3 { font-size: 1.125rem; font-weight: 500; }
              blockquote { 
                border-left: 4px solid #ccc; 
                padding-left: 1rem; 
                margin: 1rem 0; 
                font-style: italic; 
                background: #f9f9f9; 
                padding: 0.5rem 1rem;
              }
              ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
              li { margin: 0.25rem 0; }
              p { margin-bottom: 0.75rem; line-height: 1.6; }
              strong { font-weight: 600; }
              em { font-style: italic; }
              u { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>${title || "Note Content"}</h1>
            ${markdownToHtml(content)}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Text Controls */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {content.length.toLocaleString()} characters
            </span>
            <span className="text-sm text-muted-foreground">
              • {Math.ceil(content.length / 1000)} min read
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>

            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <Maximize className="h-4 w-4 mr-1" />
              Full Screen
            </Button>

            {onDownload && (
              <Button size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Text Content */}
      <Card className="p-0 overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(content),
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Format Guide */}
      <Card className="p-4 bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-2">Supported formatting:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>**bold**</strong> → <strong>bold</strong>
            </div>
            <div>
              <em>*italic*</em> → <em>italic</em>
            </div>
            <div>
              <u>&lt;u&gt;underline&lt;/u&gt;</u> → <u>underline</u>
            </div>
            <div>
              # Heading → <strong>Heading</strong>
            </div>
            <div>- List item → • List item</div>
            <div>&gt; Quote → Quote block</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TextContentViewer;
