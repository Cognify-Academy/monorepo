"use client";

import { useMDXComponents } from "@/mdx-components";
import React from "react";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = React.useState<string>("");

  React.useEffect(() => {
    const processMarkdown = async () => {
      try {
        const result = await remark().use(remarkGfm).use(html).process(content);
        setHtmlContent(String(result));
      } catch (error) {
        console.error("Error processing markdown:", error);
        setHtmlContent(content); // Fallback to plain text
      }
    };

    if (content) {
      processMarkdown();
    }
  }, [content]);

  if (!htmlContent) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div
      className="prose dark:prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2 [&_td]:text-sm [&_td]:text-gray-700 dark:[&_td]:border-gray-600 dark:[&_td]:text-gray-300 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-gray-900 dark:[&_th]:border-gray-600 dark:[&_th]:bg-gray-800 dark:[&_th]:text-gray-100"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
