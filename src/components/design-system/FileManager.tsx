import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Save, RotateCcw, Download, Globe } from "lucide-react";

interface StaticFile {
  id: string;
  file_path: string;
  content: string;
  mime_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const FileManager = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<StaticFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<StaticFile | null>(null);
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [newFileMimeType, setNewFileMimeType] = useState("text/plain");
  const [newFileDescription, setNewFileDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("static_files")
        .select("*")
        .order("file_path");

      if (error) throw error;
      setFiles(data || []);
      
      // Auto-select llms.txt if it exists
      if (data && data.length > 0 && !selectedFile) {
        const llmsFile = data.find(file => file.file_path === "llms.txt");
        if (llmsFile) {
          setSelectedFile(llmsFile);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading files",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("static_files")
        .update({
          content: selectedFile.content,
          description: selectedFile.description,
          mime_type: selectedFile.mime_type,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedFile.id)
        .select()
        .single();

      if (error) throw error;

      // Update the selected file with the returned data
      if (data) {
        setSelectedFile(data);
      }

      // Broadcast event for real-time updates
      window.dispatchEvent(new Event("staticFileUpdated"));
      
      toast({
        title: "File saved successfully",
        description: `${selectedFile.file_path} has been updated`
      });
      
      // Refresh the files list to show updated timestamp
      await fetchFiles();
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error saving file",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewFile = async () => {
    if (!newFilePath.trim() || !newFileContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both file path and content",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("static_files")
        .insert({
          file_path: newFilePath.trim(),
          content: newFileContent.trim(),
          mime_type: newFileMimeType,
          description: newFileDescription.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "File created successfully",
        description: `${newFilePath} has been created`
      });
      
      // Reset form
      setNewFilePath("");
      setNewFileContent("");
      setNewFileDescription("");
      setNewFileMimeType("text/plain");
      
      // Refresh and select new file
      await fetchFiles();
      if (data) {
        setSelectedFile(data);
      }
    } catch (error: any) {
      toast({
        title: "Error creating file",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("static_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      toast({
        title: "File deleted successfully"
      });
      
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
      
      fetchFiles();
    } catch (error: any) {
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (file: StaticFile) => {
    const blob = new Blob([file.content], { type: file.mime_type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Static Files
            </CardTitle>
            <CardDescription>
              Manage static files served by your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFile?.id === file.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedFile(file)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">/{file.file_path}</span>
                      <Badge variant="secondary" className="text-xs">
                        {file.mime_type}
                      </Badge>
                      <a
                        href={`/${file.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    </div>
                    {file.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {file.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* File Editor */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedFile ? `Edit ${selectedFile.file_path}` : "Select a file to edit"}
            </CardTitle>
            {selectedFile && (
              <CardDescription>
                Last updated: {new Date(selectedFile.updated_at).toLocaleString()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedFile ? (
              <>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={selectedFile.description || ""}
                    onChange={(e) => setSelectedFile({
                      ...selectedFile,
                      description: e.target.value
                    })}
                    placeholder="Optional description of this file"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>MIME Type</Label>
                  <Select
                    value={selectedFile.mime_type}
                    onValueChange={(value) => setSelectedFile({
                      ...selectedFile,
                      mime_type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text/plain">text/plain</SelectItem>
                      <SelectItem value="text/html">text/html</SelectItem>
                      <SelectItem value="application/json">application/json</SelectItem>
                      <SelectItem value="text/css">text/css</SelectItem>
                      <SelectItem value="text/javascript">text/javascript</SelectItem>
                      <SelectItem value="text/xml">text/xml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    ref={contentRef}
                    value={selectedFile.content}
                    onChange={(e) => setSelectedFile({
                      ...selectedFile,
                      content: e.target.value
                    })}
                    className="font-mono text-sm min-h-[400px]"
                    placeholder="File content..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={saveFile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fetchFiles()}
                    disabled={loading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reload
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a file from the list to start editing
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Create New File */}
      <Card>
        <CardHeader>
          <CardTitle>Create New File</CardTitle>
          <CardDescription>
            Add a new static file to your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>File Path</Label>
              <Input
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                placeholder="e.g., robots.txt, sitemap.xml"
              />
            </div>
            
            <div className="space-y-2">
              <Label>MIME Type</Label>
              <Select value={newFileMimeType} onValueChange={setNewFileMimeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text/plain">text/plain</SelectItem>
                  <SelectItem value="text/html">text/html</SelectItem>
                  <SelectItem value="application/json">application/json</SelectItem>
                  <SelectItem value="text/css">text/css</SelectItem>
                  <SelectItem value="text/javascript">text/javascript</SelectItem>
                  <SelectItem value="text/xml">text/xml</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={newFileDescription}
              onChange={(e) => setNewFileDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={newFileContent}
              onChange={(e) => setNewFileContent(e.target.value)}
              className="font-mono text-sm min-h-[200px]"
              placeholder="Enter file content..."
            />
          </div>

          <Button onClick={createNewFile} disabled={loading}>
            Create File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileManager;