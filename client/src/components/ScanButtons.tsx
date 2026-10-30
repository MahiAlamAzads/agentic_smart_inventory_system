import { Upload, Loader2 } from "lucide-react";
import type { ChangeEvent } from "react";

export interface ScanButtonsProps {
  onFileSelect?: (file: File) => void;
  isScanning?: boolean;
}

export function ScanButtons({
  onFileSelect,
  isScanning = false,
}: ScanButtonsProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    e.target.value = ""; // allows picking the same file again
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label
          className={`flex items-center justify-center gap-2 rounded-md border border-gray-800 bg-black px-4 py-2 text-sm font-medium text-gray-100 transition shadow-sm ${
            isScanning
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer hover:bg-neutral-800 active:scale-[0.98]"
          }`}
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{isScanning ? "Scanning document..." : "Scan Document / Invoice"}</span>
          <input
            type="file"
            accept="image/*,application/pdf,.docx,.txt,.csv,.md"
            className="hidden"
            disabled={isScanning}
            onChange={handleFileChange}
          />
        </label>

        {isScanning && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Analyzing attachment with AI...
          </span>
        )}
      </div>
    </div>
  );
}

export default ScanButtons;
