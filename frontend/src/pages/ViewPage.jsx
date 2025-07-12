import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { certificateAPI, formatFileSize } from '../utils/api';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    loadCertificate();
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get certificate info
      const infoResponse = await certificateAPI.getCertificateInfo(id);
      setCertificateInfo(infoResponse.data);

      // Set certificate URL for viewing
      setCertificateUrl(certificateAPI.getCertificateUrl(id));

    } catch (error) {
      console.error('Error loading certificate:', error);
      
      if (error.response?.status === 404) {
        setError({
          title: 'Certificate Not Found',
          message: 'The certificate you\'re looking for doesn\'t exist or may have been removed.',
          code: 404
        });
      } else if (error.response?.status === 410) {
        setError({
          title: 'Certificate Expired',
          message: 'This certificate link has expired and is no longer available for viewing.',
          code: 410
        });
      } else {
        setError({
          title: 'Loading Error',
          message: 'Failed to load the certificate. Please try again later.',
          code: 500
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadQRCode = async () => {
    try {
      setQrCodeUrl(certificateAPI.getQRCodeUrl(id));
      setShowQR(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError({
      title: 'PDF Loading Error',
      message: 'Failed to load the PDF document. The file may be corrupted.',
      code: 500
    });
  };

  const downloadCertificate = () => {
    if (certificateUrl && certificateInfo) {
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = certificateInfo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  const shareCertificate = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificateInfo?.fileName}`,
          text: 'View this certificate',
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };



  const isImage = certificateInfo?.fileType && ['jpg', 'jpeg', 'png'].includes(certificateInfo.fileType.toLowerCase());
  const isPDF = certificateInfo?.fileType && certificateInfo.fileType.toLowerCase() === 'pdf';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error.title}
            </h1>
            
            <p className="text-gray-600 mb-8">
              {error.message}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/upload')}
                className="btn-primary w-full"
              >
                Upload New Certificate
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Upload</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-3">
                {isPDF ? (
                  <FileText className="w-6 h-6 text-red-500" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                )}
                <div>
                  <h1 className="font-semibold text-gray-900 truncate max-w-xs">
                    {certificateInfo?.fileName}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(certificateInfo?.fileSize)} • {certificateInfo?.fileType?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* PDF Controls */}
              {isPDF && (
                <>
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      className="p-1 hover:bg-white rounded transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium px-2">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                      className="p-1 hover:bg-white rounded transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setRotation((rotation + 90) % 360)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Rotate"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>

                  {numPages > 1 && (
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                      <button
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1}
                        className="text-sm font-medium disabled:opacity-50"
                      >
                        ←
                      </button>
                      <span className="text-sm">
                        {pageNumber} of {numPages}
                      </span>
                      <button
                        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                        disabled={pageNumber >= numPages}
                        className="text-sm font-medium disabled:opacity-50"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={loadQRCode}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Show QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>

              <button
                onClick={shareCertificate}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={downloadCertificate}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {isPDF ? (
              <div className="text-center">
                <Document
                  file={certificateUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="py-12">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    className="mx-auto"
                  />
                </Document>
              </div>
            ) : isImage ? (
              <div className="text-center">
                <img
                  src={certificateUrl}
                  alt={certificateInfo?.fileName}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  This file type cannot be previewed in the browser.
                </p>
                <button
                  onClick={downloadCertificate}
                  className="btn-primary mt-4"
                >
                  Download to View
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Certificate Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">File Name</p>
              <p className="font-medium text-gray-900">{certificateInfo?.fileName}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">File Size</p>
              <p className="font-medium text-gray-900">
                {formatFileSize(certificateInfo?.fileSize)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Upload Date</p>
              <p className="font-medium text-gray-900">
                {new Date(certificateInfo?.uploadDate).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Expires On</p>
              <p className="font-medium text-gray-900">
                {new Date(certificateInfo?.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                QR Code for Sharing
              </h3>
              
              {qrCodeUrl ? (
                <div className="mb-6">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-6">
                Scan this QR code to access the certificate on mobile devices
              </p>
              
              <button
                onClick={() => {
                  setShowQR(false);
                  if (qrCodeUrl) {
                    URL.revokeObjectURL(qrCodeUrl);
                    setQrCodeUrl(null);
                  }
                }}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPage;