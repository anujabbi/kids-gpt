
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { printImage } from "@/utils/printUtils";
import { useState } from "react";

interface ImagePrintButtonProps {
  imageUrl: string;
  imageName?: string;
  className?: string;
}

export function ImagePrintButton({ imageUrl, imageName, className }: ImagePrintButtonProps) {
  const { currentTheme } = useTheme();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printImage(imageUrl, imageName);
    } finally {
      // Reset the printing state after a short delay
      setTimeout(() => setIsPrinting(false), 1000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      disabled={isPrinting}
      className={`gap-2 ${className}`}
      style={{
        borderColor: currentTheme.colors.border,
        color: currentTheme.colors.text.secondary,
      }}
    >
      <Printer className="h-4 w-4" />
      {isPrinting ? 'Printing...' : 'Print'}
    </Button>
  );
}
