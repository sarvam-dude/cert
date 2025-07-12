#!/usr/bin/env python3
"""
Comprehensive test script for TS Techy Certificate Management System
Tests all backend API endpoints and functionality
"""

import requests
import json
import time
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_test_certificate(filename):
    """Create a test PDF certificate"""
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Add content to the PDF
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, height - 100, "TEST CERTIFICATE")
    
    c.setFont("Helvetica", 16)
    c.drawString(100, height - 150, "This is a test certificate for the")
    c.drawString(100, height - 180, "TS Techy Certificate Management System")
    
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 220, f"Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawString(100, height - 240, "Certificate ID: TEST-CERT-001")
    
    c.save()
    print(f"✅ Created test certificate: {filename}")

def test_backend_health():
    """Test backend health endpoint"""
    try:
        response = requests.get("http://localhost:12001/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend health check: PASSED")
            return True
        else:
            print(f"❌ Backend health check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Backend health check: FAILED ({e})")
        return False

def test_certificate_upload(filename):
    """Test certificate upload functionality"""
    try:
        with open(filename, 'rb') as f:
            files = {'certificate': (os.path.basename(filename), f, 'application/pdf')}
            response = requests.post("http://localhost:12001/api/upload", files=files, timeout=30)
        
        print(f"Upload response status: {response.status_code}")
        print(f"Upload response text: {response.text[:200]}...")
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get('success'):
                    cert_id = data['data']['id']
                    print(f"✅ Certificate upload: PASSED (ID: {cert_id})")
                    return cert_id
                else:
                    print(f"❌ Certificate upload: FAILED (Response: {data})")
                    return None
            except json.JSONDecodeError:
                print(f"❌ Certificate upload: FAILED (Invalid JSON response)")
                return None
        else:
            print(f"❌ Certificate upload: FAILED (Status: {response.status_code})")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Certificate upload: FAILED ({e})")
        return None

def test_certificate_info(cert_id):
    """Test certificate info retrieval"""
    try:
        response = requests.get(f"http://localhost:12001/api/certificate/{cert_id}/info", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                cert_info = data['data']
                print(f"✅ Certificate info: PASSED")
                print(f"   - File: {cert_info.get('fileName')}")
                print(f"   - Size: {cert_info.get('fileSize')} bytes")
                print(f"   - Type: {cert_info.get('fileType')}")
                print(f"   - Upload Date: {cert_info.get('uploadDate')}")
                print(f"   - Expiry Date: {cert_info.get('expiryDate')}")
                return True
            else:
                print(f"❌ Certificate info: FAILED (Response: {data})")
                return False
        else:
            print(f"❌ Certificate info: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Certificate info: FAILED ({e})")
        return False

def test_certificate_download(cert_id):
    """Test certificate file download"""
    try:
        response = requests.get(f"http://localhost:12001/api/certificate/{cert_id}", timeout=10)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            print(f"✅ Certificate download: PASSED")
            print(f"   - Content-Type: {content_type}")
            print(f"   - Content-Length: {content_length} bytes")
            return True
        else:
            print(f"❌ Certificate download: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Certificate download: FAILED ({e})")
        return False

def test_qr_code_generation(cert_id):
    """Test QR code generation"""
    try:
        response = requests.get(f"http://localhost:12001/api/certificate/{cert_id}/qr", timeout=10)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            
            if content_type == 'image/png' and content_length > 0:
                print(f"✅ QR code generation: PASSED")
                print(f"   - Content-Type: {content_type}")
                print(f"   - Content-Length: {content_length} bytes")
                return True
            else:
                print(f"❌ QR code generation: FAILED (Invalid content type or empty)")
                return False
        else:
            print(f"❌ QR code generation: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ QR code generation: FAILED ({e})")
        return False

def test_frontend_accessibility():
    """Test frontend accessibility"""
    try:
        response = requests.get("http://localhost:12000", timeout=10)
        
        if response.status_code == 200:
            content = response.text
            if "TS Techy Certificate Manager" in content and "<!doctype html>" in content:
                print("✅ Frontend accessibility: PASSED")
                print(f"   - Content length: {len(content)} characters")
                return True
            else:
                print("❌ Frontend accessibility: FAILED (Invalid content)")
                return False
        else:
            print(f"❌ Frontend accessibility: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Frontend accessibility: FAILED ({e})")
        return False

def test_cors_headers():
    """Test CORS headers"""
    try:
        response = requests.options("http://localhost:12001/api/upload", 
                                  headers={'Origin': 'http://localhost:12000'}, 
                                  timeout=5)
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        if any(cors_headers.values()):
            print("✅ CORS configuration: PASSED")
            for header, value in cors_headers.items():
                if value:
                    print(f"   - {header}: {value}")
            return True
        else:
            print("❌ CORS configuration: FAILED (No CORS headers)")
            return False
    except Exception as e:
        print(f"❌ CORS configuration: FAILED ({e})")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting TS Techy Certificate Management System Tests")
    print("=" * 60)
    
    # Create test certificate
    test_cert_path = "/tmp/test_certificate_final.pdf"
    create_test_certificate(test_cert_path)
    
    # Test results
    results = []
    
    # Test backend health
    results.append(("Backend Health", test_backend_health()))
    
    # Test CORS
    results.append(("CORS Configuration", test_cors_headers()))
    
    # Test certificate upload
    cert_id = test_certificate_upload(test_cert_path)
    results.append(("Certificate Upload", cert_id is not None))
    
    if cert_id:
        # Test certificate info
        results.append(("Certificate Info", test_certificate_info(cert_id)))
        
        # Test certificate download
        results.append(("Certificate Download", test_certificate_download(cert_id)))
        
        # Test QR code generation
        results.append(("QR Code Generation", test_qr_code_generation(cert_id)))
    
    # Test frontend
    results.append(("Frontend Accessibility", test_frontend_accessibility()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<25} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! The application is working correctly.")
    else:
        print(f"\n⚠️  {total-passed} test(s) failed. Please check the issues above.")
    
    # Cleanup
    if os.path.exists(test_cert_path):
        os.remove(test_cert_path)
        print(f"\n🧹 Cleaned up test file: {test_cert_path}")

if __name__ == "__main__":
    main()