import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), selectedFiles.length > 0 ? selectedFiles : undefined);
      setMessage("");
      clearSelectedFiles();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    const filesToAdd: File[] = [];
    const previewUrlsToAdd: string[] = [];

    // Convert FileList to Array if needed
    const filesArray = Array.from(newFiles);

    // Check if adding these files would exceed the limit
    if (selectedFiles.length + filesArray.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `You can only select up to ${MAX_FILES} files. Please remove some files first.`,
        variant: "destructive",
      });
      return false;
    }

    for (const file of filesArray) {
      // Validate file type (images only for Stage 2)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `"${file.name}" is not an image file. Please select image files only (PNG, JPG, GIF, etc.)`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `"${file.name}" is larger than 5MB. Please select smaller images.`,
          variant: "destructive",
        });
        continue;
      }

      // Check for duplicates
      if (selectedFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
        toast({
          title: "Duplicate file",
          description: `"${file.name}" is already selected.`,
          variant: "destructive",
        });
        continue;
      }

      filesToAdd.push(file);
      previewUrlsToAdd.push(URL.createObjectURL(file));
    }

    if (filesToAdd.length > 0) {
      setSelectedFiles(prev => [...prev, ...filesToAdd]);
      setFilePreviewUrls(prev => [...prev, ...previewUrlsToAdd]);
      return true;
    }

    return false;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    validateAndAddFiles(files);
    
    // Clear the input so the same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaperclipClick = () => {
    if (selectedFiles.length >= MAX_FILES) {
      toast({
        title: "Maximum files reached",
        description: `You can only select up to ${MAX_FILES} files. Please remove some files first.`,
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    // Clean up preview URLs
    filePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setFilePreviewUrls([]);
  };

  const removeFile = (indexToRemove: number) => {
    // Clean up the preview URL for the removed file
    URL.revokeObjectURL(filePreviewUrls[indexToRemove]);
    
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setFilePreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      filePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [filePreviewUrls]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t bg-white p-4">
      <div className="mx-auto max-w-4xl">
        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Selected Files ({selectedFiles.length}/{MAX_FILES})
              </span>
              {selectedFiles.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedFiles}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-start gap-3 p-2 bg-white rounded border">
                  {/* Image thumbnail */}
                  {filePreviewUrls[index] && (
                    <div className="flex-shrink-0">
                      <img
                        src={filePreviewUrls[index]}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(file.size / 1024)}KB • {file.type.split('/')[1].toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div 
            className={`flex items-end gap-2 bg-white border rounded-xl shadow-sm transition-all ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50 shadow-md' 
                : 'border-gray-300 focus-within:border-gray-400 focus-within:shadow-md'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-xl flex items-center justify-center z-10 border-2 border-dashed border-blue-400">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-medium">
                    Drop your images here ({MAX_FILES - selectedFiles.length} remaining)
                  </p>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaperclipClick}
              className={`m-2 transition-colors ${
                selectedFiles.length > 0
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-gray-400 hover:text-gray-600'
              } ${selectedFiles.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={selectedFiles.length >= MAX_FILES}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedFiles.length > 0
                  ? `Add a message with your ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}...` 
                  : `Message ChatGPT or drag & drop images (up to ${MAX_FILES})...`
              }
              className="flex-1 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 max-h-32 min-h-[40px]"
              disabled={disabled}
              rows={1}
            />
            
            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              className="m-2 bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Hidden file input - allow multiple selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </form>
      </div>
    </div>
  );
}
