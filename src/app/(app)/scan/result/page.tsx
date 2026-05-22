'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Save, Leaf, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useScanStore } from '@/stores/useScanStore';
import { useUIStore } from '@/stores/useUIStore';
import { LensCharacter } from '@/features/shared/lens-character/LensCharacter';
import { formatCO2 } from '@/lib/formatters';
import { saveOrder } from '@/lib/actions/scan.actions';
import { cn } from '@/lib/utils';

const materialColors: Record<string, string> = {
  PP: 'bg-blue-100 text-blue-700',
  PE: 'bg-green-100 text-green-700',
  LDPE: 'bg-emerald-100 text-emerald-700',
  PS: 'bg-orange-100 text-orange-700',
  PET: 'bg-cyan-100 text-cyan-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export default function ScanResultPage() {
  const router = useRouter();
  const { currentScan, clearCurrentScan } = useScanStore();
  const { isDemo, showToast } = useUIStore();

  useEffect(() => {
    if (!currentScan) {
      router.replace('/scan');
    }
  }, [currentScan, router]);

  if (!currentScan) {
    return null;
  }

  const handleSave = async () => {
    if (isDemo) {
      showToast('데모 모드에서는 저장되지 않아요', 'info');
      router.push('/home');
      return;
    }

    try {
      await saveOrder(currentScan);
      showToast('스캔 결과가 저장되었어요!', 'success');
      clearCurrentScan();
      router.push('/home');
    } catch (error) {
      console.error('Save error:', error);
      showToast('저장에 실패했어요. 다시 시도해주세요.', 'error');
    }
  };

  const handleShare = async () => {
    const shareText = `배달렌즈로 측정한 오늘의 탄소 발자국: ${formatCO2(currentScan.totalCo2)}
${currentScan.storeName}에서 일회용품 ${currentScan.plasticItems.length}개 사용

#배달렌즈 #탄소발자국 #환경보호`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '배달렌즈 스캔 결과',
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast('클립보드에 복사되었어요!', 'success');
    }
  };

  const co2Level = currentScan.totalCo2 < 50 ? 'good' : currentScan.totalCo2 < 100 ? 'medium' : 'high';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              clearCurrentScan();
              router.back();
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">분석 결과</h1>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Lens Comment Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <LensCharacter 
                  mood={co2Level === 'high' ? 'worried' : co2Level === 'medium' ? 'thinking' : 'happy'} 
                  size="md" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary mb-1">렌즈의 한마디</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {currentScan.lensComment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">{currentScan.storeName}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentScan.orderDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CO2 Impact */}
        <Card className={cn(
          "border-2",
          co2Level === 'good' && "border-green-500/50 bg-green-50/50",
          co2Level === 'medium' && "border-yellow-500/50 bg-yellow-50/50",
          co2Level === 'high' && "border-red-500/50 bg-red-50/50",
        )}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {co2Level === 'high' ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <Leaf className={cn(
                  "w-5 h-5",
                  co2Level === 'good' ? "text-green-500" : "text-yellow-500"
                )} />
              )}
              <span className="text-sm font-medium text-muted-foreground">
                예상 탄소 배출량
              </span>
            </div>
            <div className={cn(
              "text-4xl font-bold mb-1",
              co2Level === 'good' && "text-green-600",
              co2Level === 'medium' && "text-yellow-600",
              co2Level === 'high' && "text-red-600",
            )}>
              {formatCO2(currentScan.totalCo2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {co2Level === 'good' && '훌륭해요! 적은 양이에요'}
              {co2Level === 'medium' && '조금 줄여볼 수 있어요'}
              {co2Level === 'high' && '줄이면 좋겠어요'}
            </p>
          </CardContent>
        </Card>

        {/* Plastic Items */}
        <div className="space-y-3">
          <h3 className="font-semibold px-1">감지된 일회용품</h3>
          <div className="space-y-2">
            {currentScan.plasticItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        materialColors[item.material] || materialColors.OTHER
                      )}>
                        {item.material}
                      </span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}개
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">
                        +{formatCO2(item.co2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              줄이기 팁
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 다회용기 사용 가게를 선택해보세요</li>
              <li>• 수저/포크 안받기 옵션을 선택하세요</li>
              <li>• 배달 대신 포장을 고려해보세요</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border pb-safe">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSave}
        >
          <Save className="w-5 h-5 mr-2" />
          저장하고 홈으로
        </Button>
      </div>
    </div>
  );
}
