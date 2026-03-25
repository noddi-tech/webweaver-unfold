import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestimonialManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['testimonial-settings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('testimonial_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; customer_story_id: string | null; active: boolean } | null;
    },
  });

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ['customer-stories-for-testimonial'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_stories')
        .select('id, company_name, quote_text, quote_author, quote_author_title, company_logo_url, slug')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (settings?.customer_story_id) {
      setSelectedStoryId(settings.customer_story_id);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!settings?.id) return;
      const { error } = await (supabase as any)
        .from('testimonial_settings')
        .update({
          customer_story_id: selectedStoryId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonial-settings'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-testimonial'] });
      toast({ title: 'Saved', description: 'Testimonial updated successfully.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const selectedStory = stories?.find((s) => s.id === selectedStoryId);

  if (settingsLoading || storiesLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Testimonial</CardTitle>
        <CardDescription>
          Select a customer story whose quote will be featured on the homepage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer Story</label>
          <Select
            value={selectedStoryId ?? ''}
            onValueChange={(val) => setSelectedStoryId(val || null)}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a customer story…" />
            </SelectTrigger>
            <SelectContent>
              {stories?.map((story) => (
                <SelectItem key={story.id} value={story.id}>
                  {story.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStory && (
          <div className="rounded-lg border bg-muted/30 p-6 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preview</p>
            <Quote className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
            <blockquote className="text-lg italic leading-relaxed">
              {selectedStory.quote_text || 'No quote text set for this story.'}
            </blockquote>
            <div className="flex items-center gap-3 pt-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={selectedStory.company_logo_url || '/placeholder.svg'}
                  alt={selectedStory.company_name}
                  className="object-contain p-1"
                />
                <AvatarFallback className="bg-muted text-xs">
                  {selectedStory.company_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{selectedStory.quote_author || '—'}</p>
                <p className="text-xs text-muted-foreground">{selectedStory.quote_author_title || '—'}</p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </CardContent>
    </Card>
  );
}
