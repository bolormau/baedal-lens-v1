'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Trash2, ShoppingBag, Leaf, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUIStore } from '@/stores/useUIStore';
import { LensCharacter } from '@/features/shared/lens-character/LensCharacter';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCO2 } from '@/lib/formatters';
import { getScanById, deleteAllOrders } from '@/lib/actions/scan.actions';
import { cn } from '@/lib/utils';
import type { ScanResult } from '@/types/domain.types';

const materialColors: Record<string, string> = {
  PP: 'bg-blue-100 text-blue-700',
  PE: 'bg-green-100 text-green-700',
  LDPE: 'bg-emerald-100 text-emerald-700',
  PS: 'bg-orange-100 text-orange-700',
  PET: 'bg-cyan-100 text-cyan-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

// Demo mock data
const mockScan: ScanResult = {
  id: '00000000-0000-0000-0000-000000000001',
  scannedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  restaurant: '맛있는 치킨집',
  category: 'CHICKEN',
  items: [
    { name: '일회용 용기', quantity: 2, plasticG: 45 },
    { name: '비닐봉투', quantity: 1, plasticG: 15 },
  ],
  plasticG: 60,
  unrequested: [],
  weather: 'SUNNY',
  pm25: 'GOOD',
  usedMessage: false,
  lenses: [{ type: 'time', emoji: '🌱', text: '치킨 배달 시 다회용기를 사용하는 가게를 찾아보세요! 환경도 지키고 맛도 지킬 수 있어요.' }],
};

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isDemo, showToast } = useUIStore();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function fetchScan() {
      setLoading(true);
      try {
        if (isDemo) {
          setScan(mockScan);
        } else {
          const result = await getScanById(params.id as string);
          setScan((result.success ? result.data : null) as unknown as Scan | null);
        }
      } catch (error) {
        console.error('Failed to fetch scan:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchScan();
  }, [params.id, isDemo]);

  const handleDelete = async () => {
    if (!scan) return;

    if (isDemo) {
      showToast('삭제되었어요 (데모)', 'success');
      router.push('/history');
      return;
    }

    try {
      await deleteAllOrders();
      showToast('삭제되었어요', 'success');
      router.push('/history');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('삭제에 실패했어요', 'error');
    }
  };

  const handleShare = async () => {
    if (!scan) return;

    const shareText = `배달렌즈로 측정한 탄소 발자국: ${formatCO2(scan.plasticG)}
${scan.restaurant}에서 일회용품 ${scan.items.length}개 사용

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">스캔 기록을 찾을 수 없어요</p>
        <Button onClick={() => router.push('/history')}>목록으로</Button>
      </div>
    );
  }

  const co2Level = scan.plasticG < 50 ? 'good' : scan.plasticG < 100 ? 'medium' : 'high';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">상세 보기</h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Store Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">{scan.restaurant}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(scan.scannedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lens Comment */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <LensCharacter
                expression={co2Level === 'high' ? 'thinking' : co2Level === 'medium' ? 'thinking' : 'excited'}
                size="medium"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary mb-1">렌즈의 한마디</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {scan.lenses[0]?.text ?? ""}
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
                탄소 배출량
              </span>
            </div>
            <div className={cn(
              "text-4xl font-bold",
              co2Level === 'good' && "text-green-600",
              co2Level === 'medium' && "text-yellow-600",
              co2Level === 'high' && "text-red-600",
            )}>
              {formatCO2(scan.plasticG)}
            </div>
          </CardContent>
        </Card>

        {/* Plastic Items */}
        <div className="space-y-3">
          <h3 className="font-semibold px-1">감지된 일회용품</h3>
          <div className="space-y-2">
            {scan.items.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        materialColors.OTHER
                      )}>
                        {''}
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
                        +{formatCO2(item.plasticG)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="기록 삭제"
        description="이 스캔 기록을 삭제할까요? 삭제된 기록은 복구할 수 없어요."
        confirmText="삭제"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
