
import { FileImage, FileVideo, FileAudio, FileText, File } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { FileAttachment } from "@/types/chat";
import { formatFileSize } from "@/utils/fileUtils";

interface FileAttachmentDisplayProps {
  attachment: FileAttachment;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.startsWith('audio/')) return FileAudio;
  if (fileType.includes('text') || fileType.includes('pdf')) return FileText;
  return File;
};

export function FileAttachmentDisplay({ attachment }: FileAttachmentDisplayProps) {
  const { currentTheme } = useTheme();
  const FileIcon = getFileIcon(attachment.type);
  const isImage = attachment.type.startsWith('image/');

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg border max-w-xs"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border 
      }}
    >
      {isImage && attachment.previewUrl ? (
        <img 
          src={attachment.previewUrl} 
          alt={attachment.name}
          className="w-12 h-12 object-cover rounded"
          onLoad={() => console.log('Image loaded successfully:', attachment.name)}
          onError={(e) => {
            console.error('Image failed to load:', attachment.previewUrl, attachment.name);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const iconDiv = target.nextElementSibling as HTMLElement;
            if (iconDiv) {
              iconDiv.style.display = 'flex';
            }
          }}
        />
      ) : null}
      
      <div 
        className={`w-12 h-12 flex items-center justify-center rounded ${isImage && attachment.previewUrl ? 'hidden' : ''}`}
        style={{ backgroundColor: currentTheme.colors.primary }}
      >
        <FileIcon className="w-6 h-6 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div 
          className="text-sm font-medium truncate"
          style={{ color: currentTheme.colors.text.primary }}
        >
          {attachment.name}
        </div>
        <div 
          className="text-xs"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          {formatFileSize(attachment.size)}
        </div>
      </div>
    </div>
  );
}
