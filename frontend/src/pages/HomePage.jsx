import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Eye, Shield, Clock, QrCode, Mail } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-primary-600" />,
      title: 'Easy Upload',
      description: 'Drag and drop or click to upload PDF, JPG, JPEG, or PNG certificates up to 10MB.'
    },
    {
      icon: <Eye className="h-8 w-8 text-primary-600" />,
      title: 'Instant Viewing',
      description: 'Get a unique, shareable link immediately after upload for instant certificate viewing.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Secure Storage',
      description: 'Your certificates are stored securely with unique IDs and proper access controls.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: 'Auto Expiry',
      description: 'Links automatically expire after 7 days to ensure security and privacy.'
    },
    {
      icon: <QrCode className="h-8 w-8 text-primary-600" />,
      title: 'QR Codes',
      description: 'Generate QR codes for easy sharing and mobile access to your certificates.'
    },
    {
      icon: <Mail className="h-8 w-8 text-primary-600" />,
      title: 'Email Sharing',
      description: 'Optionally send certificate links directly to email addresses during upload.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Certificate Management Made Simple
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Upload your certificates securely and get instant shareable links. 
          Perfect for sharing academic credentials, professional certifications, 
          and important documents with anyone, anywhere.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/upload"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Certificate</span>
          </Link>
          <a
            href="#features"
            className="btn-secondary text-lg px-8 py-3 inline-flex items-center space-x-2"
          >
            <span>Learn More</span>
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="card text-center">
            <div className="flex justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* How It Works Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-lg">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload</h3>
            <p className="text-gray-600">
              Select and upload your certificate file (PDF, JPG, JPEG, or PNG)
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-lg">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Link</h3>
            <p className="text-gray-600">
              Receive a unique, secure link that you can share with anyone
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-lg">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Share</h3>
            <p className="text-gray-600">
              Share the link via email, QR code, or copy-paste for instant viewing
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-50 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">10MB</div>
            <div className="text-gray-600">Maximum file size</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">7 Days</div>
            <div className="text-gray-600">Link expiry period</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">4 Types</div>
            <div className="text-gray-600">Supported file formats</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gray-900 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Share Your Certificates?
        </h2>
        <p className="text-gray-300 mb-6">
          Join thousands of users who trust our platform for secure certificate sharing.
        </p>
        <Link
          to="/upload"
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
        >
          <Upload className="h-5 w-5" />
          <span>Get Started Now</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;