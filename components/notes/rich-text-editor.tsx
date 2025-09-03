"use client";

import React, { useState } from "react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Type,
  Eye,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "../ui/typography";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your notes...",
  className,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  // Simple markdown formatting functions
  const formatText = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    let newText;
    if (selectedText) {
      newText = beforeText + prefix + selectedText + suffix + afterText;
    } else {
      newText = beforeText + prefix + suffix + afterText;
    }

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start + prefix.length + (selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => formatText("**", "**");
  const formatItalic = () => formatText("*", "*");
  const formatUnderline = () => formatText("<u>", "</u>");
  const formatQuote = () => formatText("> ");
  const formatBulletList = () => formatText("- ");
  const formatNumberedList = () => formatText("1. ");
  const formatHeading = () => formatText("# ");

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/^1\. (.*$)/gim, "<li>$1</li>")
      .replace(/\n/g, "<br>");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Write Your Notes</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant={!isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(false)}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant={isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {!isPreview && (
        <>
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-background rounded-lg mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatHeading}
              title="Heading"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatBold}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatItalic}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatUnderline}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatBulletList}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatNumberedList}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatQuote}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Editor */}
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] resize-none font-mono"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            }}
          />

          {/* Formatting Help */}
          <div className="mt-2">
            <Text as="p">
              <strong>Formatting tips:</strong> **bold**, *italic*, # heading, -
              bullet points, 1. numbered lists, &gt; quotes
            </Text>
          </div>
        </>
      )}

      {isPreview && (
        <div className="min-h-[400px] p-4 border rounded-lg bg-background">
          {content ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          ) : (
            <Text as="p" styleVariant="muted" className=" italic">
              Nothing to preview yet. Start writing to see your formatted notes.
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
