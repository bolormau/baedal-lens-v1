'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScanStore } from '@/stores/useScanStore';
import { useUIStore } from '@/stores/useUIStore';
import { parseClaudeJSON } from '@/lib/claude';
import { cn } from '@/lib/utils';
import type { ScanResult } from '@/types/domain.types';

const RECEIPT_SYSTEM_PROMPT = `You are a delivery receipt analyzer. Extract all disposable plastic items from the receipt image and return a JSON object matching this exact shape:

{
  "id": "<uuid v4>",
  "scannedAt": "<ISO 8601 datetime>",
  "restaurant": "<restaurant name in Korean>",
  "category": "<one of: CHICKEN|CHINESE|PIZZA|SNACK|BURGER|KOREAN|OTHER>",
  "items": [
    { "name": "<item name in Korean>", "quantity": <number>, "plasticG": <grams of plastic> }
  ],
  "plasticG": <total grams>,
  "unrequested": ["<list of items that were not explicitly requested, e.g. disposable utensils>"],
  "weather": "SUNNY",
  "pm25": "MODERATE",
  "usedMessage": false,
  "lenses": [
    { "type": "time", "emoji": "🌱", "text": "<Korean insight about the environmental impact, 1-2 sentences>" }
  ]
}

Respond ONLY with the JSON object, no explanation. Use realistic plasticG values: container 30-60g, bag 10-20g, utensils 5-15g.`;

const DEMO_SCAN: ScanResult = {
  id: '00000000-0000-0000-0000-000000000099',
  scannedAt: new Date().toISOString(),
  restaurant: '맛있는 치킨집',
  category: 'CHICKEN',
  items: [
    { name: '일회용 용기', quantity: 2, plasticG: 45 },
    { name: '비닐봉투', quantity: 1, plasticG: 15 },
    { name: '플라스틱 수저 세트', quantity: 2, plasticG: 10 },
  ],
  plasticG: 70,
  unrequested: ['플라스틱 수저 세트'],
  weather: 'SUNNY',
  pm25: 'MODERATE',
  usedMessage: false,
  lenses: [
    {
      type: 'time',
      emoji: '🌱',
      text: '치킨 배달에서 일회용 용기 2개와 비닐봉투가 사용되었네요. 다음에는 다회용기 가게를 이용해보는 건 어떨까요?',
    },
  ],
};

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { setCurrentScan } = useScanStore();
  const { isDemo } = useUIStore();

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('카메라 접근이 거부되었습니다. 설정에서 카메라 권한을 허용해주세요.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const MAX = 1024;
      const scale = Math.min(1, MAX / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const analyzeReceipt = useCallback(async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);

    try {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCurrentScan(DEMO_SCAN);
        router.push('/scan/result');
        return;
      }

      // Strip data URL prefix
      const base64 = capturedImage.replace(/^data:image\/\w+;base64,/, '');

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: RECEIPT_SYSTEM_PROMPT,
          imageBase64: base64,
          mediaType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error('분석에 실패했습니다');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '분석에 실패했습니다');
      }

      const scan = parseClaudeJSON<ScanResult>(result.data);
      if (!scan) {
        throw new Error('응답을 파싱할 수 없어요');
      }

      setCurrentScan(scan);
      router.push('/scan/result');
    } catch (error) {
      console.error('Analysis error:', error);
      alert('영수증 분석에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [capturedImage, isDemo, router, setCurrentScan]);

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => {
            stopCamera();
            router.back();
          }}
        >
          <X className="w-6 h-6" />
        </Button>
        <span className="text-white font-medium">영수증 스캔</span>
        <div className="w-10" />
      </div>

      {/* Camera View */}
      {!capturedImage && (
        <>
          {cameraError ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Camera className="w-16 h-16 text-gray-500 mb-4" />
              <p className="text-white mb-4">{cameraError}</p>
              <Button onClick={startCamera} variant="outline">
                다시 시도
              </Button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="w-full h-full">
          <img
            src={capturedImage}
            alt="Captured receipt"
            className="w-full h-full object-contain bg-black"
          />
        </div>
      )}

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan Guide Overlay */}
      {!capturedImage && !cameraError && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-8 top-1/4 bottom-1/3 border-2 border-white/60 rounded-lg">
            <div className="absolute -top-8 left-0 right-0 text-center text-white text-sm">
              영수증을 프레임 안에 맞춰주세요
            </div>
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-safe">
        <div className="flex items-center justify-center gap-8 p-8 bg-gradient-to-t from-black/80 to-transparent">
          {!capturedImage ? (
            <button
              onClick={captureImage}
              disabled={!!cameraError}
              className={cn(
                'w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95',
                cameraError && 'opacity-50'
              )}
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
          ) : (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={retakePhoto}
                disabled={isAnalyzing}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                다시 찍기
              </Button>
              <Button
                size="lg"
                onClick={analyzeReceipt}
                disabled={isAnalyzing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-32"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    분석중...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    분석하기
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-4 flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-white text-lg font-medium mb-2">영수증 분석중</p>
          <p className="text-white/60 text-sm">렌즈가 열심히 읽고 있어요...</p>
        </div>
      )}
    </div>
  );
}
