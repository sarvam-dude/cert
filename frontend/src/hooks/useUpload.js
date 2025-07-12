import { useState } from 'react';
import { certificateAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const uploadCertificate = async (file, email = '') => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      
      if (email.trim()) {
        formData.append('email', email.trim());
      }

      const result = await certificateAPI.uploadCertificate(
        formData,
        (progress) => setUploadProgress(progress)
      );

      setUploadResult(result.data);
      toast.success('Certificate uploaded successfully!');
      
      return result.data;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload certificate');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
  };

  return {
    isUploading,
    uploadProgress,
    uploadResult,
    uploadCertificate,
    resetUpload,
  };
};