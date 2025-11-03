import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FAQEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqId: string;
  currentQuestion: string;
  currentAnswer: string;
  onUpdate?: () => void;
}

export function FAQEditModal({
  isOpen,
  onClose,
  faqId,
  currentQuestion,
  currentAnswer,
  onUpdate,
}: FAQEditModalProps) {
  const [question, setQuestion] = useState(currentQuestion);
  const [answer, setAnswer] = useState(currentAnswer);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('faqs')
        .update({
          question,
          answer,
          updated_at: new Date().toISOString(),
        })
        .eq('id', faqId);

      if (error) throw error;

      toast.success('FAQ updated successfully');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit FAQ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question"
            />
          </div>
          <div>
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter answer"
              rows={6}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
