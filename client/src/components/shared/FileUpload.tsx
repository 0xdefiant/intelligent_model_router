import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ onFileSelect, accept = '.csv,.png,.jpg,.jpeg,.pdf', label = 'Upload a receipt or CSV' }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-ramp p-8 text-center transition-colors cursor-pointer ${
        dragActive ? 'border-ramp-green bg-ramp-green/5' : 'border-ramp-gray-300 hover:border-ramp-gray-400'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto text-ramp-gray-400 mb-3" size={32} />
        <p className="text-sm font-medium text-ramp-gray-700">{label}</p>
        <p className="text-xs text-ramp-gray-500 mt-1">Drag & drop or click to browse</p>
        <p className="text-xs text-ramp-gray-400 mt-1">CSV, PNG, JPG, PDF supported</p>
      </label>
    </div>
  );
}
