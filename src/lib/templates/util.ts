// === Enhanced Note Utilities (../../lib/note-utils.js) ===
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

export type NoteFormat = "MARKDOWN" | "HTML" | "JSON";

export interface NoteContent {
  raw: string;
  html: string;
  format: NoteFormat;
}

/**
 * Creates an empty note with default structure
 */
export const createEmptyNote = (): NoteContent => ({
  raw: "",
  html: "",
  format: "HTML" as NoteFormat,
});

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "strike",
      "del",
      "ins",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "span",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "data-*",
    ],
    ALLOW_DATA_ATTR: true,
  });
};

/**
 * Converts markdown to HTML
 */
const markdownToHTML = async (markdown: string): Promise<string> => {
  try {
    // Configure marked for security and TipTap compatibility
    marked.setOptions({
      mangle: false,
      breaks: true,
      gfm: true,
      headerIds: false,  // This option was removed in marked 5.0.0
    } as any);

    const html = await marked(markdown);
    return sanitizeHTML(html);
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    return sanitizeHTML(`<p>${markdown.replace(/\n/g, "<br>")}</p>`);
  }
};

/**
 * Converts JSON to HTML (for TipTap JSON format)
 */
const jsonToHTML = (jsonString: string): string => {
  try {
    const jsonData = JSON.parse(jsonString);

    // If it's TipTap JSON format
    if (jsonData.type === "doc" && jsonData.content) {
      return convertTipTapJSONToHTML(jsonData);
    }

    // Otherwise, treat as plain text
    return sanitizeHTML(
      `<pre><code>${JSON.stringify(jsonData, null, 2)}</code></pre>`
    );
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return sanitizeHTML(`<p>${jsonString}</p>`);
  }
};

/**
 * Converts TipTap JSON format to HTML
 */
const convertTipTapJSONToHTML = (doc: any): string => {
  if (!doc.content || !Array.isArray(doc.content)) {
    return "";
  }

  const processNode = (node: any): string => {
    switch (node.type) {
      case "paragraph":
        const pContent = node.content
          ? node.content.map(processNode).join("")
          : "";
        return `<p>${pContent}</p>`;

      case "text":
        let text = node.text || "";
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            switch (mark.type) {
              case "bold":
                text = `<strong>${text}</strong>`;
                break;
              case "italic":
                text = `<em>${text}</em>`;
                break;
              case "underline":
                text = `<u>${text}</u>`;
                break;
              case "strike":
                text = `<strike>${text}</strike>`;
                break;
              case "code":
                text = `<code>${text}</code>`;
                break;
            }
          });
        }
        return text;

      case "heading":
        const level = node.attrs?.level || 1;
        const hContent = node.content
          ? node.content.map(processNode).join("")
          : "";
        return `<h${level}>${hContent}</h${level}>`;

      case "bulletList":
        const ulContent = node.content
          ? node.content.map(processNode).join("")
          : "";
        return `<ul>${ulContent}</ul>`;

      case "orderedList":
        const olContent = node.content
          ? node.content.map(processNode).join("")
          : "";
        return `<ol>${olContent}</ol>`;

      case "listItem":
        const liContent = node.content
          ? node.content.map(processNode).join("")
          : "";
        return `<li>${liContent}</li>`;

      case "blockquote":
        const bqContent = node.content
          ? node.content.map(processNode).join("")
          : "";
        return `<blockquote>${bqContent}</blockquote>`;

      case "codeBlock":
        const codeContent = node.content
          ? node.content.map(processNode).join("")
          : "";
        return `<pre><code>${codeContent}</code></pre>`;

      case "hardBreak":
        return "<br>";

      default:
        console.warn(`Unknown node type: ${node.type}`);
        return node.content ? node.content.map(processNode).join("") : "";
    }
  };

  const html = doc.content.map(processNode).join("");
  return sanitizeHTML(html);
};

/**
 * Main formatting function that processes notes based on format
 */
export const formatNote = async (
  content: string,
  renderAs: NoteFormat = "HTML"
): Promise<NoteContent> => {
  if (!content || content.trim() === "") {
    return createEmptyNote();
  }

  const trimmedContent = content.trim();

  switch (renderAs) {
    case "HTML":
      return {
        raw: trimmedContent,
        html: sanitizeHTML(trimmedContent),
        format: "HTML",
      };

    case "MARKDOWN":
      const html = await markdownToHTML(trimmedContent);
      return {
        raw: trimmedContent,
        html,
        format: "MARKDOWN",
      };

    case "JSON":
      return {
        raw: trimmedContent,
        html: jsonToHTML(trimmedContent),
        format: "JSON",
      };

    default:
      throw new Error(`Unsupported note format: ${renderAs}`);
  }
};

/**
 * Converts HTML back to TipTap JSON format (for frontend compatibility)
 */
export const htmlToTipTapJSON = (html: string): any => {
  if (!html || html.trim() === "") {
    return {
      type: "doc",
      content: [],
    };
  }

  // This is a simplified conversion - in production you might want to use a proper HTML parser
  // For now, we'll create a basic paragraph structure
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: html.replace(/<[^>]*>/g, ""), // Strip HTML tags for basic text
          },
        ],
      },
    ],
  };
};

/**
 * Validates note content format
 */
export const validateNoteFormat = (
  content: string,
  format: NoteFormat
): boolean => {
  switch (format) {
    case "HTML":
      // Basic HTML validation
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        return !doc.querySelector("parsererror");
      } catch {
        return false;
      }

    case "MARKDOWN":
      // Markdown is generally more forgiving, just check it's a string
      return typeof content === "string";

    case "JSON":
      // Validate JSON structure
      try {
        JSON.parse(content);
        return true;
      } catch {
        return false;
      }

    default:
      return false;
  }
};
