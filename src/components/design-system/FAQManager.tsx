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
import { Plus, Trash2, Save, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

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

  const handleMoveFAQ = async (faq: FAQ, direction: 'up' | 'down') => {
    const typeFAQs = faqs.filter(f => f.type === faq.type).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const currentIndex = typeFAQs.findIndex(f => f.id === faq.id);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === typeFAQs.length - 1) return;
    
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapFAQ = typeFAQs[swapIndex];
    
    try {
      const currentSortOrder = faq.sort_order || 0;
      const swapSortOrder = swapFAQ.sort_order || 0;
      
      await supabase.from('faqs').update({ sort_order: swapSortOrder }).eq('id', faq.id);
      await supabase.from('faqs').update({ sort_order: currentSortOrder }).eq('id', swapFAQ.id);
      
      toast.success('FAQ order updated');
      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ order:', error);
      toast.error('Failed to update order');
    }
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
            <Label htmlFor="new-faq-question">Question</Label>
            <Input
              id="new-faq-question"
              autoFocus
              aria-required="true"
              value={newFAQ.question}
              onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
              placeholder="Enter question"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-faq-answer">Answer</Label>
            <Textarea
              id="new-faq-answer"
              aria-required="true"
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
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => {
                            const updated = faqs.map(f => 
                              f.id === faq.id ? { ...f, question: e.target.value } : f
                            );
                            setFaqs(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer</Label>
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
                      </div>
                      <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Input
                          type="number"
                          value={faq.sort_order || 0}
                          onChange={(e) => {
                            const updated = faqs.map(f => 
                              f.id === faq.id ? { ...f, sort_order: parseInt(e.target.value) || 0 } : f
                            );
                            setFaqs(updated);
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleUpdate(faq.id, { 
                            question: faq.question, 
                            answer: faq.answer,
                            sort_order: faq.sort_order
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
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleMoveFAQ(faq, 'up')}
                              disabled={faqsByType[type].findIndex(f => f.id === faq.id) === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleMoveFAQ(faq, 'down')}
                              disabled={faqsByType[type].findIndex(f => f.id === faq.id) === faqsByType[type].length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground font-mono">#{faq.sort_order || 0}</span>
                              <h4 className="font-semibold">{faq.question}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
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
