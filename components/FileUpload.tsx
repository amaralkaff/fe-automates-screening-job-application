'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import { Label } from '@/components/retroui/Label';
import { Alert } from '@/components/retroui/Alert';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFilesChange: (cvFile: File | null, projectReportFile: File | null) => void;
  disabled?: boolean;
}

interface FileWithPreview {
  file: File;
  preview: string;
  type: 'cv' | 'project_report';
}

export default function FileUpload({ onFilesChange, disabled = false }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string[] => {
    const fileErrors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB (reduced for better processing)
    const allowedTypes = ['application/pdf'];

    if (file.size > maxSize) {
      fileErrors.push(`File ${file.name} is too large. Maximum size is 5MB.`);
    }

    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      fileErrors.push(`File ${file.name} must be a PDF.`);
    }

    // Additional check for very large files that might cause batch processing issues
    if (file.size > 2 * 1024 * 1024) { // 2MB
      fileErrors.push(`Warning: File ${file.name} is large (${(file.size / 1024 / 1024).toFixed(1)}MB) and may cause processing delays.`);
    }

    return fileErrors;
  };

  const processFiles = useCallback((acceptedFiles: File[], fileType: 'cv' | 'project_report') => {
    const newErrors: string[] = [];
    const validFiles: FileWithPreview[] = [];

    acceptedFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        validFiles.push({
          file,
          preview: file.name,
          type: fileType
        });
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      const updatedFiles = files.filter(f => f.type !== fileType).concat(validFiles);
      setFiles(updatedFiles);

      const cvFile = updatedFiles.find(f => f.type === 'cv')?.file || null;
      const projectFile = updatedFiles.find(f => f.type === 'project_report')?.file || null;
      onFilesChange(cvFile, projectFile);
    }
  }, [files, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    const cvFile = updatedFiles.find(f => f.type === 'cv')?.file || null;
    const projectFile = updatedFiles.find(f => f.type === 'project_report')?.file || null;
    onFilesChange(cvFile, projectFile);
  }, [files, onFilesChange]);

  const cvDropzone = useDropzone({
    onDrop: (acceptedFiles) => processFiles(acceptedFiles, 'cv'),
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: disabled || !!files.find(f => f.type === 'cv'),
    multiple: false
  });

  const projectDropzone = useDropzone({
    onDrop: (acceptedFiles) => processFiles(acceptedFiles, 'project_report'),
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: disabled || !!files.find(f => f.type === 'project_report'),
    multiple: false
  });

  const cvFile = files.find(f => f.type === 'cv');
  const projectFile = files.find(f => f.type === 'project_report');

  return (
    <div className="space-y-4 sm:space-y-6">
      {errors.length > 0 && (
        <Alert status="error">
          <AlertCircle className="h-4 w-4" />
          <Alert.Description>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert.Description>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CV Upload */}
        <Card>
          <Card.Content className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <Label htmlFor="cv-upload" className="text-sm sm:text-base font-semibold">
                CV/Resume *
                <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-2 block sm:inline">
                  (PDF format)
                </span>
              </Label>

              {cvFile ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-green-900 text-sm sm:text-base truncate">{cvFile.preview}</p>
                      <p className="text-xs sm:text-sm text-green-700">
                        {(cvFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(files.indexOf(cvFile))}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700 flex-shrink-0 h-10 w-10 sm:h-auto sm:w-auto sm:px-3"
                  >
                    <X className="h-5 w-5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-1">Remove</span>
                  </Button>
                </div>
              ) : (
                <div
                  {...cvDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors min-h-[140px] sm:min-h-[180px] flex flex-col justify-center items-center
                    ${cvDropzone.isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input {...cvDropzone.getInputProps()} id="cv-upload" disabled={disabled} />
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
                  <div className="flex flex-col items-center">
                    <p className="text-sm sm:text-lg font-medium text-gray-900">
                      {cvDropzone.isDragActive ? 'Drop your CV here' : 'Drop your CV here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                      PDF files only, up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Project Report Upload */}
        <Card>
          <Card.Content className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <Label htmlFor="project-upload" className="text-sm sm:text-base font-semibold">
                Project Report *
                <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-2 block sm:inline">
                  (PDF format)
                </span>
              </Label>

              {projectFile ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-green-900 text-sm sm:text-base truncate">{projectFile.preview}</p>
                      <p className="text-xs sm:text-sm text-green-700">
                        {(projectFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(files.indexOf(projectFile))}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700 flex-shrink-0 h-10 w-10 sm:h-auto sm:w-auto sm:px-3"
                  >
                    <X className="h-5 w-5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-1">Remove</span>
                  </Button>
                </div>
              ) : (
                <div
                  {...projectDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors min-h-[140px] sm:min-h-[180px] flex flex-col justify-center items-center
                    ${projectDropzone.isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input {...projectDropzone.getInputProps()} id="project-upload" disabled={disabled} />
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
                  <div className="flex flex-col items-center">
                    <p className="text-sm sm:text-lg font-medium text-gray-900">
                      {projectDropzone.isDragActive ? 'Drop your project report here' : 'Drop your project report here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                      PDF files only, up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {files.length > 0 && (
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>
            {files.length} file(s) uploaded • Total size: {
              (files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)
            } MB
          </span>
        </div>
      )}
    </div>
  );
}