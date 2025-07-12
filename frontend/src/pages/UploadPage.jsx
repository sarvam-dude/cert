import React, { useState } from 'react';
import { Upload, FileText, Image, CheckCircle, AlertCircle, Copy, QrCode, Mail } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { certificateAPI, formatFileSize, isValidFileType, getMaxFileSize } from '../utils/api';

const UploadPage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [email, setEmail] = useState('');

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      if (email.trim()) {
        formData.append('email', email.trim());
      }

      const result = await certificateAPI.uploadCertificate(formData, (progress) => {
        setUploadProgress(progress);
      });

      setUploadResult(result.data);
      toast.success('Certificate uploaded successfully!');
      
      if (email.trim()) {
        toast.success('Email notification sent!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: getMaxFileSize(),
    disabled: uploading
  });

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Certificate Upload Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your certificates and get a secure, shareable link instantly. 
            Supports PDF, JPEG, and PNG formats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Upload Certificate
            </h2>

            {/* Email Input */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Notification (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to receive the certificate link"
                  className="input-field pl-10"
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${
                isDragReject ? 'border-red-400 bg-red-50' : ''
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center">
                <Upload className={`w-12 h-12 mb-4 ${
                  isDragActive ? 'text-blue-600' : 'text-gray-400'
                }`} />
                
                {isDragActive ? (
                  <p className="text-lg font-medium text-blue-600">
                    Drop the certificate here...
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop your certificate here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>PDF</span>
                      <span>•</span>
                      <span>JPEG</span>
                      <span>•</span>
                      <span>PNG</span>
                      <span>•</span>
                      <span>Max 10MB</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Uploading...
                  </span>
                  <span className="text-sm text-gray-500">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Upload Result
            </h2>

            {!uploadResult ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Upload a certificate to see the result here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">
                      Certificate uploaded successfully!
                    </p>
                    <p className="text-sm text-green-600">
                      Your certificate is now available for viewing
                    </p>
                  </div>
                </div>

                {/* File Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    {getFileIcon(uploadResult.fileType)}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {uploadResult.fileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadResult.fileSize)} • {uploadResult.fileType.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Upload Date:</span>
                      <p className="font-medium">
                        {new Date(uploadResult.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Expires:</span>
                      <p className="font-medium">
                        {new Date(uploadResult.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shareable Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shareable Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={uploadResult.viewUrl}
                      readOnly
                      className="input-field flex-1 bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(uploadResult.viewUrl)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                {uploadResult.qrCode && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      QR Code for Easy Sharing
                    </p>
                    <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                      <img
                        src={uploadResult.qrCode}
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <a
                    href={uploadResult.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 text-center"
                  >
                    View Certificate
                  </a>
                  <button
                    onClick={() => {
                      setUploadResult(null);
                      setEmail('');
                    }}
                    className="btn-secondary"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Easy Upload
            </h3>
            <p className="text-gray-600">
              Drag and drop or click to upload your certificates in seconds
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure Links
            </h3>
            <p className="text-gray-600">
              Get unique, secure links that expire automatically for safety
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              QR Codes
            </h3>
            <p className="text-gray-600">
              Generate QR codes for easy sharing and mobile access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;