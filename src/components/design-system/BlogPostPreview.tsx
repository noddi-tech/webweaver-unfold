import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Clock, User, Monitor, Smartphone } from "lucide-react";
import { parseBlogMarkdown } from "@/lib/markdownUtils";
import { cn } from "@/lib/utils";

interface BlogPostPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    title: string;
    excerpt: string | null;
    content: string | null;
    featured_image_url: string | null;
    author_name: string | null;
    author_avatar_url: string | null;
    author_title: string | null;
    category: string | null;
    tags: string[];
    reading_time_minutes: number;
    published_at: string | null;
  };
}

const BlogPostPreview = ({ open, onOpenChange, post }: BlogPostPreviewProps) => {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between">
          <DialogTitle>Blog Post Preview</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
          <div
            className={cn(
              "mx-auto bg-background rounded-lg shadow-lg overflow-hidden",
              viewMode === "desktop" ? "max-w-4xl" : "max-w-[375px]"
            )}
          >
            <article className={cn("p-4", viewMode === "desktop" ? "md:p-8" : "")}>
              {/* Back Link */}
              <div className="inline-flex items-center gap-2 text-muted-foreground mb-6 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </div>

              {/* Category Badge */}
              {post.category && (
                <Badge variant="outline" className="mb-4">
                  {post.category}
                </Badge>
              )}

              {/* Title */}
              <h1
                className={cn(
                  "font-bold text-foreground mb-6",
                  viewMode === "desktop"
                    ? "text-3xl md:text-4xl lg:text-5xl"
                    : "text-2xl"
                )}
              >
                {post.title || "Untitled Post"}
              </h1>

              {/* Meta Info */}
              <div
                className={cn(
                  "flex flex-wrap items-center gap-4 text-muted-foreground mb-8",
                  viewMode === "mobile" ? "text-sm" : ""
                )}
              >
                {post.author_name && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={post.author_avatar_url || undefined} alt={post.author_name} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-foreground font-medium">{post.author_name}</span>
                      {post.author_title && (
                        <span className="text-sm"> · {post.author_title}</span>
                      )}
                    </div>
                  </div>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.reading_time_minutes} min read
                </span>
              </div>

              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="aspect-video mb-8 rounded-xl overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              {post.content && (
                <div
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: parseBlogMarkdown(post.content) }}
                />
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Author Bio */}
              {post.author_name && (
                <div className="mt-8 p-4 bg-muted rounded-xl">
                  <div className="flex items-start gap-4">
                    <Avatar className={cn(viewMode === "desktop" ? "w-16 h-16" : "w-12 h-12")}>
                      <AvatarImage src={post.author_avatar_url || undefined} alt={post.author_name} />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{post.author_name}</h3>
                      {post.author_title && (
                        <p className="text-muted-foreground text-sm">{post.author_title}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostPreview;
