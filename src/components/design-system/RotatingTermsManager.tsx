import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface RotatingTerm {
  id: string;
  term_key: string;
  descriptor_key: string;
  term_fallback: string;
  descriptor_fallback: string;
  icon_name: string;
  active: boolean;
  sort_order: number;
}

export function RotatingTermsManager() {
  const [terms, setTerms] = useState<RotatingTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    const { data, error } = await supabase
      .from('rotating_headline_terms')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setTerms(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    const newTerm = {
      term_key: 'hero.rotating.new.term',
      descriptor_key: 'hero.rotating.new.desc',
      term_fallback: 'New Term',
      descriptor_fallback: 'Add description here.',
      icon_name: 'Sparkles',
      active: true,
      sort_order: terms.length + 1,
    };

    const { error } = await supabase
      .from('rotating_headline_terms')
      .insert([newTerm]);

    if (!error) {
      toast.success('Term added successfully');
      fetchTerms();
    } else {
      toast.error('Failed to add term');
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | boolean) => {
    const { error } = await supabase
      .from('rotating_headline_terms')
      .update({ [field]: value })
      .eq('id', id);

    if (!error) {
      setTerms(terms.map(t => t.id === id ? { ...t, [field]: value } : t));
    } else {
      toast.error('Failed to update term');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('rotating_headline_terms')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Term deleted');
      fetchTerms();
    } else {
      toast.error('Failed to delete term');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Rotating Headline Terms</h2>
          <p className="text-muted-foreground mt-1">
            Manage the rotating terms displayed in the Hero headline
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Term
        </Button>
      </div>

      <div className="space-y-3">
        {terms.map((term) => (
          <Card key={term.id} className="p-4 bg-background text-foreground">
            <div className="flex items-start gap-4">
              <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-move" />
              
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Term Key</label>
                    <Input
                      value={term.term_key}
                      onChange={(e) => handleUpdate(term.id, 'term_key', e.target.value)}
                      onBlur={() => toast.success('Term key saved')}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Term Fallback</label>
                    <Input
                      value={term.term_fallback}
                      onChange={(e) => handleUpdate(term.id, 'term_fallback', e.target.value)}
                      onBlur={() => toast.success('Term fallback saved')}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Descriptor Key</label>
                    <Input
                      value={term.descriptor_key}
                      onChange={(e) => handleUpdate(term.id, 'descriptor_key', e.target.value)}
                      onBlur={() => toast.success('Descriptor key saved')}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Descriptor Fallback</label>
                    <Textarea
                      value={term.descriptor_fallback}
                      onChange={(e) => handleUpdate(term.id, 'descriptor_fallback', e.target.value)}
                      onBlur={() => toast.success('Descriptor fallback saved')}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={term.active}
                      onCheckedChange={(checked) => handleUpdate(term.id, 'active', checked)}
                    />
                    <label className="text-sm text-foreground">Active</label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sort Order: {term.sort_order}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(term.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
