import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { isValidFileType, getMaxFileSize, formatFileSize } from '../utils/api';

const FileUpload = ({ onFileSelect, disabled = false, selectedFile = null }) => {
  const [dragError, setDragError] = useState('');
  const maxFileSize = getMaxFileSize();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragError('');

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        setDragError(`File is too large. Maximum size is ${formatFileSize(maxFileSize)}.`);
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        setDragError('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
      } else {
        setDragError('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Additional validation
      if (!isValidFileType(file)) {
        setDragError('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
        return;
      }

      if (file.size > maxFileSize) {
        setDragError(`File is too large. Maximum size is ${formatFileSize(maxFileSize)}.`);
        return;
      }

      onFileSelect(file);
    }
  }, [onFileSelect, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled
  });

  const removeFile = () => {
    onFileSelect(null);
    setDragError('');
  };

  const getFileIcon = (file) => {
    if (!file) return <File className="h-8 w-8" />;
    
    const type = file.type.toLowerCase();
    if (type.includes('pdf')) {
      return <File className="h-8 w-8 text-red-500" />;
    } else if (type.includes('image')) {
      return <File className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8" />;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            dropzone
            ${isDragActive ? 'dropzone-active' : ''}
            ${isDragReject ? 'border-red-400 bg-red-50' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
            
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your certificate here' : 'Upload Certificate'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports PDF, JPG, JPEG, PNG • Max {formatFileSize(maxFileSize)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            </div>
            
            {!disabled && (
              <button
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {dragError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{dragError}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;