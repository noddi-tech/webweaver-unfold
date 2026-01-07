import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useBlogPosts, useFeaturedBlogPost } from '@/hooks/useBlogPosts';
import { useEditMode } from '@/contexts/EditModeContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EditableTranslation } from '@/components/EditableTranslation';

const Blog = () => {
  const { t, i18n } = useAppTranslation();
  const { editMode } = useEditMode();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: posts, isLoading } = useBlogPosts(editMode);
  const { data: featuredPost } = useFeaturedBlogPost();

  const categories = ['all', 'product', 'industry'];
  
  const filteredPosts = posts?.filter(post => {
    if (!selectedCategory || selectedCategory === 'all') return true;
    return post.category?.toLowerCase() === selectedCategory;
  }) || [];

  const handleActiveToggle = async (postId: string, active: boolean) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ active })
      .eq('id', postId);
    
    if (error) {
      toast.error('Failed to update post status');
    } else {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success(active ? 'Post published' : 'Post unpublished');
    }
  };

  const handleFeaturedToggle = async (postId: string, featured: boolean) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ featured })
      .eq('id', postId);
    
    if (error) {
      toast.error('Failed to update featured status');
    } else {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post-featured'] });
      toast.success(featured ? 'Post featured' : 'Post unfeatured');
    }
  };

  const handleSortOrderChange = async (postId: string, sortOrder: number) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ sort_order: sortOrder })
      .eq('id', postId);
    
    if (error) {
      toast.error('Failed to update sort order');
    } else {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <EditableTranslation translationKey="blog.hero.title">
              {t('blog.hero.title', 'Navio Blog')}
            </EditableTranslation>
          </h1>
          <p className="text-xl text-muted-foreground">
            <EditableTranslation translationKey="blog.hero.subtitle">
              {t('blog.hero.subtitle', 'Insights, updates, and stories from the Navio team')}
            </EditableTranslation>
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && !editMode && (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <Link to={`/${i18n.language}/blog/${featuredPost.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-2 gap-0">
                  {featuredPost.featured_image_url && (
                    <div className="aspect-video md:aspect-auto">
                      <img 
                        src={featuredPost.featured_image_url} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Star className="w-3 h-3 mr-1" />
                        {t('blog.featured', 'Featured')}
                      </Badge>
                      {featuredPost.category && (
                        <Badge variant="outline">{featuredPost.category}</Badge>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {featuredPost.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredPost.published_at)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t('blog.reading_time', '{minutes} min read').replace('{minutes}', String(featuredPost.reading_time_minutes))}
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category || (!selectedCategory && category === 'all') ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category === 'all' ? null : category)}
              >
                {t(`blog.categories.${category}`, category.charAt(0).toUpperCase() + category.slice(1))}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                <EditableTranslation translationKey="blog.no_posts">
                  {t('blog.no_posts', 'No blog posts available yet.')}
                </EditableTranslation>
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${!post.active ? 'opacity-60' : ''}`}>
                  {editMode && (
                    <div className="p-4 border-b bg-muted/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active</span>
                        <Switch 
                          checked={post.active} 
                          onCheckedChange={(checked) => handleActiveToggle(post.id, checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Featured</span>
                        <Switch 
                          checked={post.featured} 
                          onCheckedChange={(checked) => handleFeaturedToggle(post.id, checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sort Order</span>
                        <Input
                          type="number"
                          value={post.sort_order}
                          onChange={(e) => handleSortOrderChange(post.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                        />
                      </div>
                    </div>
                  )}
                  <Link to={`/${i18n.language}/blog/${post.slug}`}>
                    {post.featured_image_url && (
                      <div className="aspect-video">
                        <img 
                          src={post.featured_image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.published_at)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.reading_time_minutes}m
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
