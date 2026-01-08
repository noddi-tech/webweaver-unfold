/**
 * Simple markdown-to-HTML converter for job content
 * Supports: bullet lists, headings, bold, and paragraph breaks
 */

export function parseJobMarkdown(text: string | null): string {
  if (!text) return '';
  
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Trim the line for processing but preserve original for empty line checks
    const trimmedLine = line.trim();
    
    // Handle empty lines
    if (trimmedLine === '') {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push('<br />');
      continue;
    }
    
    // Handle headings (## Heading)
    const headingMatch = trimmedLine.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">${escapeHtml(headingMatch[1])}</h3>`);
      continue;
    }
    
    // Handle bullet points (- item or * item)
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        result.push('<ul class="list-disc list-outside ml-6 space-y-2 my-4">');
        inList = true;
      }
      result.push(`<li>${processInlineMarkdown(bulletMatch[1])}</li>`);
      continue;
    }
    
    // Handle numbered lists (1. item)
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      // For numbered lists, we'll just convert to bullet for simplicity
      if (!result[result.length - 1]?.includes('<ul')) {
        result.push('<ul class="list-disc list-outside ml-6 space-y-2 my-4">');
        inList = true;
      }
      result.push(`<li>${processInlineMarkdown(numberedMatch[1])}</li>`);
      continue;
    }
    
    // Regular paragraph text
    if (inList) {
      result.push('</ul>');
      inList = false;
    }
    result.push(`<p class="mb-3">${processInlineMarkdown(trimmedLine)}</p>`);
  }
  
  // Close any open list
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('\n');
}

/**
 * Process inline markdown: **bold**, *italic*
 */
function processInlineMarkdown(text: string): string {
  let result = escapeHtml(text);
  
  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  
  return result;
}

/**
 * Basic HTML escaping to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
