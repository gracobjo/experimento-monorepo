import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // en bytes
  acceptedTypes?: string[];
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['.pdf', '.txt', '.csv', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`No se pueden subir más de ${maxFiles} archivos`);
    }

    Array.from(files).forEach((file) => {
      // Validar tamaño
      if (file.size > maxSize) {
        errors.push(`${file.name} excede el tamaño máximo de ${maxSize / (1024 * 1024)}MB`);
      }

      // Validar tipo
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        errors.push(`${file.name} no es un tipo de archivo permitido`);
      }

      // Validar que no esté vacío
      if (file.size === 0) {
        errors.push(`${file.name} está vacío`);
      }

      if (errors.length === 0) {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return [];
    }

    setError(null);
    return validFiles;
  };

  const handleFiles = (files: FileList) => {
    console.log('FileUpload: handleFiles called with', files.length, 'files');
    console.log('FileUpload: File names:', Array.from(files).map(f => f.name));
    
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      console.log('FileUpload: Valid files to send:', validFiles.map(f => f.name));
      onFileSelect(validFiles);
    }
    
    // Limpiar el input después de procesar los archivos
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const onAreaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onButtonClick(e);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        aria-label="Seleccionar archivos para subir"
        title="Seleccionar archivos para subir"
        placeholder="Selecciona archivos"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
        style={{ display: 'none' }}
      />
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onAreaClick}
        aria-label="Área de carga de archivos"
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="text-gray-600">
            <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
          </div>
          
          <p className="text-xs text-gray-500">
            PDF, TXT, CSV, DOC, DOCX, JPG, PNG, GIF, WEBP hasta {maxSize / (1024 * 1024)}MB
          </p>
          
          <p className="text-xs text-gray-500">
            Máximo {maxFiles} archivos
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 