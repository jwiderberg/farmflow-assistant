import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Language } from '../types';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  language: Language;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, language }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      setIsVideoReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsVideoReady(true))
              .catch(error => {
                console.error('Failed to play video:', error);
                setError(language === 'en' 
                  ? 'Failed to start video stream' 
                  : 'فشل في بدء تدفق الفيديو');
              });
          }
        };
      }
    } catch (error) {
      let errorMessage = language === 'en' 
        ? 'Failed to access camera' 
        : 'فشل في الوصول إلى الكاميرا';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = language === 'en'
            ? 'Camera access denied. Please grant permission to use the camera.'
            : 'تم رفض الوصول إلى الكاميرا. يرجى منح إذن لاستخدام الكاميرا.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = language === 'en'
            ? 'No camera found. Please ensure your device has a camera.'
            : 'لم يتم العثور على كاميرا. يرجى التأكد من أن جهازك يحتوي على كاميرا.';
        }
      }

      setError(errorMessage);
      console.error('Camera error:', error);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsVideoReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !streamRef.current || !isVideoReady) {
      setError(language === 'en' 
        ? 'Camera is not ready for capture' 
        : 'الكاميرا غير جاهزة للالتقاط');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Use the actual video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to JPEG with 0.8 quality
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(imageData);
      stopCamera();
    } catch (error) {
      console.error('Capture error:', error);
      setError(language === 'en'
        ? 'Failed to capture photo'
        : 'فشل في التقاط الصورة');
    }
  };

  const handleCameraClick = async () => {
    setShowCamera(true);
    await startCamera();
  };

  return (
    <div className="relative">
      {!showCamera ? (
        <button
          onClick={handleCameraClick}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label={language === 'en' ? 'Open camera' : 'فتح الكاميرا'}
        >
          <Camera className="h-6 w-6 text-gray-600" />
        </button>
      ) : (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg">
              {error}
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-h-[80vh] max-w-full"
          />
          <div className="fixed bottom-0 w-full p-4 flex justify-center gap-4 bg-black/50">
            <button
              onClick={capturePhoto}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isVideoReady 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-400 cursor-not-allowed text-gray-200'
              }`}
              disabled={!isVideoReady}
            >
              {language === 'en' ? 'Take Photo' : 'التقاط صورة'}
            </button>
            <button
              onClick={stopCamera}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;