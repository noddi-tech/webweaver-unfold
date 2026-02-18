import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { parseBlogMarkdown } from "@/lib/markdownUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Minus,
} from "lucide-react";

interface BlogRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  defaultTab?: "edit" | "preview" | "html";
}

const BlogRichTextEditor = ({ value, onChange, defaultTab = "edit" }: BlogRichTextEditorProps) => {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [uploading, setUploading] = useState(false);

  const trackSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      selectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
    }
  }, []);

  const insertAtCursor = useCallback(
    (before: string, after: string = "") => {
      const { start, end } = selectionRef.current;
      const selectedText = value.substring(start, end);

      const newValue =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newValue);

      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          const newCursorPos = start + before.length + selectedText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          selectionRef.current = { start: newCursorPos, end: newCursorPos };
        }
      }, 0);
    },
    [value, onChange]
  );

  const wrapSelection = useCallback(
    (wrapper: string) => {
      insertAtCursor(wrapper, wrapper);
    },
    [insertAtCursor]
  );

  const insertLine = useCallback(
    (prefix: string) => {
      const { start } = selectionRef.current;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const beforeLine = value.substring(0, lineStart);
      const afterStart = value.substring(lineStart);

      const newValue = beforeLine + prefix + afterStart;
      onChange(newValue);

      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          const newPos = start + prefix.length;
          textarea.setSelectionRange(newPos, newPos);
          selectionRef.current = { start: newPos, end: newPos };
        }
      }, 0);
    },
    [value, onChange]
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-images")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl;
      insertAtCursor(`[${text}](${linkUrl})`, "");
      setLinkUrl("");
      setLinkText("");
      setShowLinkPopover(false);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      insertAtCursor(`\n![${imageAlt || "Image"}](${imageUrl})\n`, "");
      setImageUrl("");
      setImageAlt("");
      setShowImagePopover(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          wrapSelection("**");
          break;
        case "i":
          e.preventDefault();
          wrapSelection("*");
          break;
        case "u":
          e.preventDefault();
          wrapSelection("__");
          break;
      }
    }
  };

  const toolbarButtons = [
    { icon: Bold, action: () => wrapSelection("**"), title: "Bold (Ctrl+B)" },
    { icon: Italic, action: () => wrapSelection("*"), title: "Italic (Ctrl+I)" },
    { icon: Underline, action: () => wrapSelection("__"), title: "Underline (Ctrl+U)" },
    { icon: Strikethrough, action: () => wrapSelection("~~"), title: "Strikethrough" },
    { type: "separator" },
    { icon: Heading1, action: () => insertLine("# "), title: "Heading 1" },
    { icon: Heading2, action: () => insertLine("## "), title: "Heading 2" },
    { icon: Heading3, action: () => insertLine("### "), title: "Heading 3" },
    { type: "separator" },
    { icon: List, action: () => insertLine("- "), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertLine("1. "), title: "Numbered List" },
    { icon: Quote, action: () => insertLine("> "), title: "Blockquote" },
    { type: "separator" },
    { icon: Code, action: () => wrapSelection("`"), title: "Inline Code" },
    { icon: Minus, action: () => insertAtCursor("\n---\n", ""), title: "Horizontal Rule" },
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {toolbarButtons.map((btn, idx) =>
          btn.type === "separator" ? (
            <div key={idx} className="w-px h-6 bg-border mx-1" />
          ) : (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={btn.action}
              title={btn.title}
              type="button"
            >
              {btn.icon && <btn.icon className="h-4 w-4" />}
            </Button>
          )
        )}

        {/* Link Button */}
        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Link" type="button">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div>
                <Label>Link Text</Label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Display text"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={insertLink} size="sm" className="w-full" type="button">
                Insert Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image Button */}
        <Popover open={showImagePopover} onOpenChange={setShowImagePopover}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Image" type="button">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div>
                <Label>Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="mt-1"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-popover px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Alt Text</Label>
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Image description"
                />
              </div>
              <Button onClick={insertImage} size="sm" className="w-full" disabled={!imageUrl} type="button">
                Insert Image
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview" | "html")}>
        <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 h-auto p-0">
          <TabsTrigger value="edit" className="rounded-none data-[state=active]:bg-background">
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:bg-background">
            Preview
          </TabsTrigger>
          <TabsTrigger value="html" className="rounded-none data-[state=active]:bg-background">
            HTML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="m-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={trackSelection}
            onMouseUp={trackSelection}
            onKeyUp={trackSelection}
            placeholder="Write your blog post content here... Use markdown for formatting."
            className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 font-mono text-sm resize-y"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-4 min-h-[400px] bg-background">
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: parseBlogMarkdown(value) }}
          />
        </TabsContent>

        <TabsContent value="html" className="m-0">
          <Textarea
            value={parseBlogMarkdown(value)}
            readOnly
            className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 font-mono text-sm resize-y"
          />
        </TabsContent>
      </Tabs>

      {/* Word Count */}
      <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        {value.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
};

export default BlogRichTextEditor;
