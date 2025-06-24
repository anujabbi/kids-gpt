
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Upload } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { UploadProgress } from "@/services/fileUploadService";

interface FileUploadProgressProps {
  progress: UploadProgress[];
}

export function FileUploadProgress({ progress }: FileUploadProgressProps) {
  const { currentTheme } = useTheme();

  if (progress.length === 0) return null;

  return (
    <div 
      className="p-3 rounded-lg border space-y-2"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border 
      }}
    >
      <div 
        className="text-sm font-medium flex items-center gap-2"
        style={{ color: currentTheme.colors.text.primary }}
      >
        <Upload className="h-4 w-4" />
        Uploading Files
      </div>
      
      {progress.map((item) => (
        <div key={item.fileId} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: currentTheme.colors.text.secondary }}>
              File {item.fileId.slice(-8)}...
            </span>
            <div className="flex items-center gap-1">
              {item.status === 'completed' && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {item.status === 'error' && (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span style={{ color: currentTheme.colors.text.secondary }}>
                {item.progress}%
              </span>
            </div>
          </div>
          
          <Progress 
            value={item.progress} 
            className="h-1"
          />
          
          {item.error && (
            <div className="text-xs text-red-500 mt-1">
              {item.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
