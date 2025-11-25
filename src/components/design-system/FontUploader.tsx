import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FontFile {
  file: File;
  weight: number;
  style: 'normal' | 'italic';
  url?: string;
}

interface FontUploaderProps {
  fontFamilyName: string;
  onUploadComplete: (fontFiles: Array<{ weight: number; style: string; url: string; format: string }>) => void;
}

export const FontUploader = ({ fontFamilyName, onUploadComplete }: FontUploaderProps) => {
  const [fontFiles, setFontFiles] = useState<FontFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.name.endsWith('.woff2') || 
      file.name.endsWith('.woff') || 
      file.name.endsWith('.ttf')
    );

    if (validFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload .woff2, .woff, or .ttf files',
        variant: 'destructive',
      });
      return;
    }

    const newFontFiles = validFiles.map(file => ({
      file,
      weight: 400,
      style: 'normal' as const,
    }));

    setFontFiles([...fontFiles, ...newFontFiles]);
  };

  const removeFile = (index: number) => {
    setFontFiles(fontFiles.filter((_, i) => i !== index));
  };

  const updateFile = (index: number, updates: Partial<FontFile>) => {
    const updated = [...fontFiles];
    updated[index] = { ...updated[index], ...updates };
    setFontFiles(updated);
  };

  const uploadFonts = async () => {
    if (fontFiles.length === 0) {
      toast({
        title: 'No files',
        description: 'Please select font files to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const uploadedFonts = [];

      for (const fontFile of fontFiles) {
        const fileExtension = fontFile.file.name.split('.').pop();
        const sanitizedFontName = fontFamilyName.replace(/\s+/g, '-').toLowerCase();
        const fileName = `fonts/${sanitizedFontName}-${fontFile.weight}-${fontFile.style}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, fontFile.file, {
            contentType: `font/${fileExtension}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('site-assets')
          .getPublicUrl(fileName);

        uploadedFonts.push({
          weight: fontFile.weight,
          style: fontFile.style,
          url: urlData.publicUrl,
          format: fileExtension === 'woff2' ? 'woff2' : fileExtension === 'woff' ? 'woff' : 'truetype',
        });
      }

      onUploadComplete(uploadedFonts);

      toast({
        title: 'Success',
        description: `${uploadedFonts.length} font file(s) uploaded successfully`,
      });

      setFontFiles([]);
    } catch (error) {
      console.error('Font upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload font files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed bg-background text-foreground">
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2 text-foreground">Upload Font Files</p>
          <p className="text-sm text-muted-foreground mb-4">
            Drop WOFF2, WOFF, or TTF files here or click to browse
          </p>
          <input
            type="file"
            accept=".woff2,.woff,.ttf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="font-upload"
          />
          <label htmlFor="font-upload">
            <Button variant="outline" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {fontFiles.length > 0 && (
        <Card className="bg-background text-foreground">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Selected Files ({fontFiles.length})</h3>
              <Button onClick={uploadFonts} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </div>
            
            {fontFiles.map((fontFile, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{fontFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(fontFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Select
                  value={fontFile.weight.toString()}
                  onValueChange={(value) => updateFile(index, { weight: parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Thin (100)</SelectItem>
                    <SelectItem value="200">Extra Light (200)</SelectItem>
                    <SelectItem value="300">Light (300)</SelectItem>
                    <SelectItem value="400">Regular (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                    <SelectItem value="600">Semi Bold (600)</SelectItem>
                    <SelectItem value="700">Bold (700)</SelectItem>
                    <SelectItem value="800">Extra Bold (800)</SelectItem>
                    <SelectItem value="900">Black (900)</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={fontFile.style}
                  onValueChange={(value) => updateFile(index, { style: value as 'normal' | 'italic' })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="italic">Italic</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
