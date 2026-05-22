'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/useUIStore';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCO2, formatRelativeDate } from '@/lib/formatters';
import { getOrderHistory, deleteAllOrders } from '@/lib/actions/scan.actions';
import { cn } from '@/lib/utils';
import type { Scan } from '@/types';

// Demo mock data
const mockScans: Scan[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    imageUrl: '',
    storeName: '맛있는 치킨집',
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    plasticItems: [
      { name: '일회용 용기', quantity: 2, material: 'PP', co2: 45 },
      { name: '비닐봉투', quantity: 1, material: 'LDPE', co2: 15 },
    ],
    totalCo2: 60,
    lensComment: '치킨 배달 시 일회용품을 줄여보세요!',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    imageUrl: '',
    storeName: '행복한 피자',
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    plasticItems: [
      { name: '피자 박스', quantity: 1, material: 'OTHER', co2: 20 },
      { name: '플라스틱 받침대', quantity: 1, material: 'PS', co2: 5 },
    ],
    totalCo2: 25,
    lensComment: '피자 박스는 재활용 가능해요!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    imageUrl: '',
    storeName: '건강한 샐러드',
    orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    plasticItems: [
      { name: '샐러드 용기', quantity: 1, material: 'PET', co2: 35 },
      { name: '드레싱 용기', quantity: 2, material: 'PP', co2: 10 },
    ],
    totalCo2: 45,
    lensComment: '다회용기 가게를 찾아보세요!',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    userId: 'demo-user',
    imageUrl: '',
    storeName: '맛나 분식',
    orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    plasticItems: [
      { name: '일회용 용기', quantity: 3, material: 'PP', co2: 55 },
      { name: '비닐봉투', quantity: 2, material: 'LDPE', co2: 20 },
      { name: '수저 세트', quantity: 2, material: 'PS', co2: 8 },
    ],
    totalCo2: 83,
    lensComment: '분식집에서는 수저 안받기 옵션을 선택해보세요!',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const { isDemo, showToast } = useUIStore();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScans() {
      setLoading(true);
      try {
        if (isDemo) {
          setScans(mockScans);
        } else {
          const result = await getOrderHistory();
          setScans((result.success ? result.data : []) as unknown as Scan[]);
        }
      } catch (error) {
        console.error('Failed to fetch scans:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, [isDemo]);

  const filteredScans = scans.filter(scan =>
    scan.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    if (isDemo) {
      setScans(prev => prev.filter(s => s.id !== deleteTarget));
      showToast('삭제되었어요 (데모)', 'success');
    } else {
      try {
        await deleteAllOrders();
        setScans(prev => prev.filter(s => s.id !== deleteTarget));
        showToast('삭제되었어요', 'success');
      } catch (error) {
        console.error('Delete error:', error);
        showToast('삭제에 실패했어요', 'error');
      }
    }
    setDeleteTarget(null);
  };

  const groupedScans = filteredScans.reduce((groups, scan) => {
    const date = new Date(scan.orderDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(scan);
    return groups;
  }, {} as Record<string, Scan[]>);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">스캔 기록</h1>
          <div className="w-10" />
        </div>
        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="가게명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredScans.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={searchQuery ? '검색 결과가 없어요' : '아직 스캔 기록이 없어요'}
            description={searchQuery ? '다른 검색어로 시도해보세요' : '영수증을 스캔하면 여기에 기록돼요'}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedScans).map(([date, dateScans]) => (
              <div key={date}>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date}
                </h2>
                <div className="space-y-3">
                  {dateScans.map((scan) => (
                    <Card 
                      key={scan.id} 
                      className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/history/${scan.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium truncate">{scan.storeName}</h3>
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{scan.plasticItems.length}개 품목</span>
                              <span className={cn(
                                "font-medium",
                                scan.totalCo2 < 50 ? "text-green-600" : 
                                scan.totalCo2 < 100 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {formatCO2(scan.totalCo2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(scan.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="기록 삭제"
        description="이 스캔 기록을 삭제할까요? 삭제된 기록은 복구할 수 없어요."
        confirmText="삭제"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
