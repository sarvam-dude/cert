import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, QrCode } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { certificateAPI } from '../utils/api';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const CertificateViewer = ({ certificateId, certificateInfo }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const certificateUrl = certificateAPI.getCertificateUrl(certificateId);
  const qrCodeUrl = certificateAPI.getQRCodeUrl(certificateId);
  const isImage = certificateInfo?.fileType && ['jpg', 'jpeg', 'png'].includes(certificateInfo.fileType.toLowerCase());
  const isPDF = certificateInfo?.fileType && certificateInfo.fileType.toLowerCase() === 'pdf';

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    console.error('Certificate URL:', certificateUrl);
    console.error('Certificate Info:', certificateInfo);
    
    let errorMessage = 'Failed to load the PDF document. The file may be corrupted.';
    
    if (error.name === 'InvalidPDFException') {
      errorMessage = 'The file is not a valid PDF document.';
    } else if (error.name === 'MissingPDFException') {
      errorMessage = 'PDF file not found or could not be loaded.';
    } else if (error.name === 'UnexpectedResponseException') {
      errorMessage = 'Failed to download the PDF file. Please try again.';
    }
    
    setError(errorMessage);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages || 1, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const downloadCertificate = () => {
    const link = document.createElement('a');
    link.href = certificateUrl;
    link.download = certificateInfo?.fileName || 'certificate';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `certificate-${certificateId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-primary-600 mb-4" />
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Loading Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-y-2">
          <button
            onClick={() => window.open(certificateUrl, '_blank')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in New Tab
          </button>
          <button
            onClick={downloadCertificate}
            className="inline-flex items-center px-4 py-2 ml-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2">
          {isPDF && (
            <>
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="text-sm text-gray-600 px-2">
                Page {pageNumber} of {numPages}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              <div className="h-6 w-px bg-gray-300 mx-2" />
            </>
          )}
          
          <button
            onClick={zoomOut}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          
          <span className="text-sm text-gray-600 px-2">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadQRCode}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Download QR Code"
          >
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </button>
          
          <button
            onClick={downloadCertificate}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            title="Download certificate"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Certificate Display */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-center">
          {isPDF ? (
            <Document
              file={{
                url: certificateUrl,
                httpHeaders: {
                  'Accept': 'application/pdf',
                },
                withCredentials: false
              }}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" className="text-primary-600" />
                </div>
              }
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjs.version + '/cmaps/',
                cMapPacked: true,
              }}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" className="text-primary-600" />
                  </div>
                }
              />
            </Document>
          ) : isImage ? (
            <div className="max-w-full overflow-auto">
              <img
                src={certificateUrl}
                alt={certificateInfo?.fileName || 'Certificate'}
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                className="max-w-none"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setError('Failed to load image');
                  setLoading(false);
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Unsupported file type</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;