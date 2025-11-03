import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  type: 'general' | 'features' | 'pricing';
  active: boolean;
  sort_order: number | null;
}

export function FAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    type: 'general' as 'general' | 'features' | 'pricing',
    active: true,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('type', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFaqs((data || []) as FAQ[]);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newFAQ.question || !newFAQ.answer) {
      toast.error('Question and answer are required');
      return;
    }

    try {
      const maxSortOrder = Math.max(...faqs.filter(f => f.type === newFAQ.type).map(f => f.sort_order || 0), 0);
      
      const { error } = await supabase
        .from('faqs')
        .insert([{ ...newFAQ, sort_order: maxSortOrder + 1 }]);

      if (error) throw error;

      toast.success('FAQ created successfully');
      setNewFAQ({ question: '', answer: '', type: 'general', active: true });
      fetchFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error('Failed to create FAQ');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<FAQ>) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('FAQ updated successfully');
      fetchFAQs();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await handleUpdate(id, { active });
  };

  if (loading) {
    return <div>Loading FAQs...</div>;
  }

  const faqsByType = {
    general: faqs.filter(f => f.type === 'general'),
    features: faqs.filter(f => f.type === 'features'),
    pricing: faqs.filter(f => f.type === 'pricing'),
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={newFAQ.type} onValueChange={(value: any) => setNewFAQ({ ...newFAQ, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="features">Features</SelectItem>
                <SelectItem value="pricing">Pricing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={newFAQ.question}
              onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
              placeholder="Enter question"
            />
          </div>

          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              value={newFAQ.answer}
              onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
              placeholder="Enter answer"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={newFAQ.active}
              onCheckedChange={(checked) => setNewFAQ({ ...newFAQ, active: checked })}
            />
            <Label>Active</Label>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create FAQ
          </Button>
        </CardContent>
      </Card>

      {(['general', 'features', 'pricing'] as const).map((type) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="capitalize">{type} FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqsByType[type].length === 0 ? (
              <p className="text-muted-foreground text-sm">No FAQs in this category</p>
            ) : (
              faqsByType[type].map((faq) => (
                <Card key={faq.id} className="p-4">
                  {editingId === faq.id ? (
                    <div className="space-y-4">
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const updated = faqs.map(f => 
                            f.id === faq.id ? { ...f, question: e.target.value } : f
                          );
                          setFaqs(updated);
                        }}
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = faqs.map(f => 
                            f.id === faq.id ? { ...f, answer: e.target.value } : f
                          );
                          setFaqs(updated);
                        }}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleUpdate(faq.id, { 
                            question: faq.question, 
                            answer: faq.answer 
                          })}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            fetchFAQs();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">{faq.question}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={faq.active}
                            onCheckedChange={(checked) => handleToggleActive(faq.id, checked)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(faq.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
