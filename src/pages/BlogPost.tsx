import { useParams, Link } from 'react-router-dom';
import { useRef } from 'react';
import { ArrowLeft, Calendar, Clock, User, Facebook, Linkedin, Mail } from 'lucide-react';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import TableOfContents from '@/components/blog/TableOfContents';
import { parseBlogMarkdown } from '@/lib/markdownUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useAppTranslation();
  
  const { data: post, isLoading, error } = useBlogPost(slug || '');
  const { data: allPosts } = useBlogPosts();

  const relatedPosts = allPosts?.filter(p => 
    p.id !== post?.id && 
    (p.category === post?.category || p.tags?.some(tag => post?.tags?.includes(tag)))
  ).slice(0, 3) || [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <article className="pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-3xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="aspect-video w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </article>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-24 px-4 text-center">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
            <Link to={`/${i18n.language}/blog`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('blog.back_to_blog', 'Back to Blog')}
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgressBar contentRef={contentRef} readingTimeMinutes={post.reading_time_minutes} />
      <Header />
      
      <article className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-12">
            {/* Main content */}
            <div ref={contentRef} className="flex-1 max-w-3xl">
          {/* Back Link */}
          <Link 
            to={`/${i18n.language}/blog`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.back_to_blog', 'Back to Blog')}
          </Link>

          {/* Category Badge */}
          {post.category && (
            <Badge variant="outline" className="mt-6 mb-4">
              {post.category}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
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
            
            {/* Separator */}
            {post.author_name && (
              <span className="hidden sm:inline text-muted-foreground/40">|</span>
            )}
            
            {/* Date and Read Time grouped */}
            <div className="flex items-center gap-4">
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {t('blog.reading_time', '{minutes} min read').replace('{minutes}', String(post.reading_time_minutes))}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="aspect-video mb-12 rounded-xl overflow-hidden">
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
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author Bio */}
          {post.author_name && (
            <div className="mt-12 p-6 bg-muted rounded-xl">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={post.author_avatar_url || undefined} alt={post.author_name} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{post.author_name}</h3>
                  {post.author_title && (
                    <p className="text-muted-foreground">{post.author_title}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Share Section */}
          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-foreground font-medium mb-4">
              {t('blog.share_post', 'Share this post')}
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-5 h-5 text-foreground" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Share on X"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-foreground" />
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Share via Email"
              >
                <Mail className="w-5 h-5 text-foreground" />
              </a>
            </div>
          </div>
            </div>

            {/* Table of Contents sidebar */}
            {post.content && (
              <TableOfContents 
                content={post.content} 
                contentRef={contentRef}
              />
            )}
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="pb-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl pt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {t('blog.related_posts', 'Related Posts')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/${i18n.language}/blog/${relatedPost.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    {relatedPost.featured_image_url && (
                      <div className="aspect-video">
                        <img 
                          src={relatedPost.featured_image_url} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {relatedPost.reading_time_minutes} min read
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
