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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useColorSystem } from '@/hooks/useColorSystem';

interface ButtonEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonText: string;
  buttonUrl: string;
  buttonBgColor?: string;
  onSave: (text: string, url: string, bgColor: string) => void;
}

export function ButtonEditModal({
  open,
  onOpenChange,
  buttonText,
  buttonUrl,
  buttonBgColor = 'primary',
  onSave,
}: ButtonEditModalProps) {
  const [text, setText] = useState(buttonText);
  const [url, setUrl] = useState(buttonUrl);
  const [bgColor, setBgColor] = useState(buttonBgColor);
  const { SOLID_COLORS, GRADIENT_COLORS, loading } = useColorSystem();

  useEffect(() => {
    if (open) {
      setText(buttonText);
      setUrl(buttonUrl);
      setBgColor(buttonBgColor);
    }
  }, [open, buttonText, buttonUrl, buttonBgColor]);

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Button text cannot be empty');
      return;
    }

    if (!url.trim()) {
      toast.error('Button URL cannot be empty');
      return;
    }

    onSave(text, url, bgColor);
    toast.success('Button updated successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Button
          </DialogTitle>
          <DialogDescription>
            Update the button text, link URL, and styling
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
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
          </TabsContent>

          <TabsContent value="styling" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>Background Color</Label>
              
              {/* Live Preview */}
              <div className="p-6 border rounded-lg bg-background">
                <Button 
                  size="lg"
                  className="rounded-full px-8 py-4"
                  style={{
                    backgroundColor: bgColor.startsWith('gradient-') || bgColor.startsWith('glass-')
                      ? undefined
                      : `hsl(var(--${bgColor}))`,
                    backgroundImage: bgColor.startsWith('gradient-') || bgColor.startsWith('glass-')
                      ? `var(--${bgColor})`
                      : undefined,
                  }}
                >
                  {text || 'Preview'}
                </Button>
              </div>

              {/* Color Picker Grid */}
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading colors...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Solid Colors</p>
                    <div className="grid grid-cols-8 gap-2">
                      {SOLID_COLORS.map((color) => (
                        <button
                          key={color.value}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            bgColor === color.cssVar.replace('--', '')
                              ? 'border-primary ring-2 ring-primary/20 scale-110'
                              : 'border-transparent hover:border-border'
                          }`}
                          style={{
                            backgroundColor: `hsl(${color.hslValue})`,
                          }}
                          onClick={() => setBgColor(color.cssVar.replace('--', ''))}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Gradients</p>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADIENT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          className={`w-full h-12 rounded-lg border-2 transition-all ${
                            bgColor === color.cssVar.replace('--', '')
                              ? 'border-primary ring-2 ring-primary/20 scale-105'
                              : 'border-transparent hover:border-border'
                          }`}
                          style={{
                            backgroundImage: `var(${color.cssVar})`,
                          }}
                          onClick={() => setBgColor(color.cssVar.replace('--', ''))}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} className="w-full mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Button
        </Button>
      </DialogContent>
    </Dialog>
  );
}
