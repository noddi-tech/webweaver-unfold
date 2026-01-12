/**
 * Markdown-to-HTML converter for blog and job content
 * Supports: headings, lists, bold, italic, links, images, code, blockquotes, horizontal rules
 */

/**
 * Parse blog markdown with full feature support
 */
export function parseBlogMarkdown(text: string | null): string {
  if (!text) return '';
  
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmedLine = line.trim();
    
    // Handle code blocks (```)
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        result.push(`<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">${escapeHtml(codeContent.join('\n'))}</code></pre>`);
        codeContent = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        // Start code block
        if (inList) {
          result.push(listType === 'ol' ? '</ol>' : '</ul>');
          inList = false;
          listType = null;
        }
        inCodeBlock = true;
        codeLanguage = trimmedLine.slice(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }
    
    // Handle empty lines
    if (trimmedLine === '') {
      if (inList) {
        result.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
        listType = null;
      }
      continue;
    }
    
    // Handle horizontal rules (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmedLine)) {
      if (inList) {
        result.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
        listType = null;
      }
      result.push('<hr class="my-8 border-border" />');
      continue;
    }
    
    // Handle headings (# ## ### #### ##### ######)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) {
        result.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
        listType = null;
      }
      const level = headingMatch[1].length;
      const headingClasses: Record<number, string> = {
        1: 'text-3xl font-bold text-foreground mt-8 mb-4',
        2: 'text-2xl font-bold text-foreground mt-8 mb-4',
        3: 'text-xl font-semibold text-foreground mt-6 mb-3',
        4: 'text-lg font-semibold text-foreground mt-4 mb-2',
        5: 'text-base font-semibold text-foreground mt-4 mb-2',
        6: 'text-sm font-semibold text-foreground mt-4 mb-2',
      };
      result.push(`<h${level} class="${headingClasses[level]}">${processInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }
    
    // Handle blockquotes (> text)
    const blockquoteMatch = trimmedLine.match(/^>\s*(.*)$/);
    if (blockquoteMatch) {
      if (inList) {
        result.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
        listType = null;
      }
      result.push(`<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">${processInlineMarkdown(blockquoteMatch[1])}</blockquote>`);
      continue;
    }
    
    // Handle bullet points (- item or * item)
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (inList && listType === 'ol') {
        result.push('</ol>');
        inList = false;
        listType = null;
      }
      if (!inList) {
        result.push('<ul class="list-disc list-outside ml-6 space-y-2 my-4">');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li>${processInlineMarkdown(bulletMatch[1])}</li>`);
      continue;
    }
    
    // Handle numbered lists (1. item)
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (inList && listType === 'ul') {
        result.push('</ul>');
        inList = false;
        listType = null;
      }
      if (!inList) {
        result.push('<ol class="list-decimal list-outside ml-6 space-y-2 my-4">');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li>${processInlineMarkdown(numberedMatch[1])}</li>`);
      continue;
    }
    
    // Regular paragraph text
    if (inList) {
      result.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
      listType = null;
    }
    result.push(`<p class="mb-4 leading-relaxed">${processInlineMarkdown(trimmedLine)}</p>`);
  }
  
  // Close any open elements
  if (inList) {
    result.push(listType === 'ol' ? '</ol>' : '</ul>');
  }
  if (inCodeBlock) {
    result.push(`<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">${escapeHtml(codeContent.join('\n'))}</code></pre>`);
  }
  
  return result.join('\n');
}

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
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push('<br />');
      continue;
    }
    
    const headingMatch = trimmedLine.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">${escapeHtml(headingMatch[1])}</h3>`);
      continue;
    }
    
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        result.push('<ul class="list-disc list-outside ml-6 space-y-2 my-4">');
        inList = true;
      }
      result.push(`<li>${processJobInlineMarkdown(bulletMatch[1])}</li>`);
      continue;
    }
    
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (!result[result.length - 1]?.includes('<ul')) {
        result.push('<ul class="list-disc list-outside ml-6 space-y-2 my-4">');
        inList = true;
      }
      result.push(`<li>${processJobInlineMarkdown(numberedMatch[1])}</li>`);
      continue;
    }
    
    if (inList) {
      result.push('</ul>');
      inList = false;
    }
    result.push(`<p class="mb-3">${processJobInlineMarkdown(trimmedLine)}</p>`);
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('\n');
}

/**
 * Process inline markdown for blog content: **bold**, *italic*, `code`, [links](url), ![images](url)
 */
function processInlineMarkdown(text: string): string {
  let result = escapeHtml(text);
  
  // Images: ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />');
  
  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');
  
  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
  
  return result;
}

/**
 * Process inline markdown for job content: **bold**, *italic*
 */
function processJobInlineMarkdown(text: string): string {
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
