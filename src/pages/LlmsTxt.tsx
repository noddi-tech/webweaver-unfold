import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LlmsTxt = () => {
  useEffect(() => {
    const fetchAndServeFile = async () => {
      try {
        const { data, error } = await supabase
          .from("static_files")
          .select("content, mime_type")
          .eq("file_path", "llms.txt")
          .single();

        if (error || !data) {
          // If file not found, serve a 404 response
          document.body.innerHTML = '';
          const errorText = document.createTextNode("File not found");
          document.body.appendChild(errorText);
          return;
        }

        // Clear the body and serve the file content as plain text
        document.body.innerHTML = '';
        const pre = document.createElement('pre');
        pre.textContent = data.content; // textContent auto-escapes HTML
        pre.style.fontFamily = "var(--font-mono)";
        pre.style.whiteSpace = "pre-wrap";
        pre.style.padding = "16px";
        document.body.style.margin = "0";
        document.body.appendChild(pre);
        
        // Set the content type in the document
        const meta = document.createElement('meta');
        meta.httpEquiv = "Content-Type";
        meta.content = data.mime_type;
        document.head.appendChild(meta);

      } catch (error) {
        console.error("Error fetching llms.txt:", error);
        document.body.innerHTML = '';
        const errorText = document.createTextNode("Error loading file");
        document.body.appendChild(errorText);
      }
    };

    fetchAndServeFile();
  }, []);

  // Return nothing as we're manipulating the DOM directly
  return null;
};

export default LlmsTxt;