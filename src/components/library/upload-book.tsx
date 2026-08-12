"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function UploadBook() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10);
    setStatus("Uploading PDF...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Upload and Extract Text
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(50);
      setStatus("Extracting text and structure...");

      // Simulate the remaining AI pipeline stages for now
      // In a real app, this would poll a job queue status
      setTimeout(() => {
        setProgress(75);
        setStatus("Analyzing concepts...");
        
        setTimeout(() => {
          setProgress(100);
          setStatus("Book Ready!");
          
          setTimeout(() => {
            setIsUploading(false);
            setOpen(false);
            setFile(null);
            setProgress(0);
            setStatus("");
            // Refresh library here
          }, 1000);
        }, 1500);
      }, 1500);

    } catch (error) {
      console.error(error);
      setStatus("Error uploading book.");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore - Base UI Trigger types don't expose asChild correctly here */}
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload a new book</DialogTitle>
          <DialogDescription>
            Select a PDF book to add to your Deep Reading Library.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {!isUploading ? (
            <div>
              <Button onClick={() => document.getElementById('book-upload')?.click()} disabled={isUploading}>
                {isUploading ? "Processing..." : "Select PDF Book"}
              </Button>
              <input
                id="book-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="w-full space-y-2">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-center text-muted-foreground">{status}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          {!isUploading && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!file}>
                Process Book
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
