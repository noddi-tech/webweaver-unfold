import { useState, useEffect } from 'react';
import { Pencil, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ButtonEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonText: string;
  buttonUrl: string;
  onSave: (text: string, url: string) => void;
}

export function ButtonEditModal({
  open,
  onOpenChange,
  buttonText,
  buttonUrl,
  onSave,
}: ButtonEditModalProps) {
  const [text, setText] = useState(buttonText);
  const [url, setUrl] = useState(buttonUrl);

  useEffect(() => {
    if (open) {
      setText(buttonText);
      setUrl(buttonUrl);
    }
  }, [open, buttonText, buttonUrl]);

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Button text cannot be empty');
      return;
    }

    if (!url.trim()) {
      toast.error('Button URL cannot be empty');
      return;
    }

    onSave(text, url);
    toast.success('Button updated successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Button
          </DialogTitle>
          <DialogDescription>
            Update the button text and link URL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter button text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonUrl">Button URL</Label>
            <div className="flex gap-2">
              <Input
                id="buttonUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/demo or https://example.com"
                className="flex-1"
              />
              {url && (
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Use relative paths (e.g., /demo) or full URLs (e.g., https://example.com)
            </p>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Button
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
