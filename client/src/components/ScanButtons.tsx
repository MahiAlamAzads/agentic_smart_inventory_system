import { useRef } from "react";
import { Camera, Upload } from "lucide-react";


export function ScanButtons({
  onCameraClick,
  onFileSelect,
}: {
  onCameraClick?: () => void;
  onFileSelect?: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={onCameraClick}
        className="flex items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
      >
        <Camera className="h-4 w-4" />
        Scan By Camera
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <Upload className="h-4 w-4" />
        Scan By File
      </button>
    </div>
  );
}