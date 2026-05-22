'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingDown, TrendingUp, Minus, Leaf, Droplets, Wind } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LensCharacter } from '@/features/shared/lens-character/LensCharacter';
import { useUIStore } from '@/stores/useUIStore';
import { formatCO2 } from '@/lib/formatters';
import { getWeeklyOrders } from '@/lib/actions/report.actions';
import { cn } from '@/lib/utils';
import type { WeeklyReport, MonthlyReport } from '@/types';

// Mock data for demo mode
const mockWeeklyReport: WeeklyReport = {
  period: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() },
  totalScans: 12,
  totalCo2: 340,
  avgCo2PerOrder: 28.3,
  trend: -15,
  topMaterials: [
    { material: 'PP', count: 18, percentage: 45 },
    { material: 'LDPE', count: 12, percentage: 30 },
    { material: 'PS', count: 10, percentage: 25 },
  ],
  dailyData: [
    { date: '월', co2: 45 },
    { date: '화', co2: 52 },
    { date: '수', co2: 38 },
    { date: '목', co2: 61 },
    { date: '금', co2: 48 },
    { date: '토', co2: 55 },
    { date: '일', co2: 41 },
  ],
  lensInsight: '지난주보다 15% 줄였어요! 특히 수요일에 적게 시켜서 좋았어요. 이 페이스 유지하면 이번 달 목표 달성할 수 있어요!',
};

const mockMonthlyReport: MonthlyReport = {
  period: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() },
  totalScans: 45,
  totalCo2: 1250,
  avgCo2PerOrder: 27.8,
  trend: -8,
  weeklyData: [
    { week: '1주차', co2: 320 },
    { week: '2주차', co2: 310 },
    { week: '3주차', co2: 290 },
    { week: '4주차', co2: 330 },
  ],
  achievements: [
    { title: '일주일 연속 스캔', achieved: true },
    { title: '월간 목표 80% 달성', achieved: true },
    { title: '다회용기 3회 사용', achieved: false },
  ],
  lensInsight: '한 달 동안 총 1.25kg의 탄소를 배출했어요. 이건 자동차로 5km 운전한 것과 같아요. 다음 달에는 1kg 이하로 줄여볼까요?',
};

export default function ReportPage() {
  const router = useRouter();
  const { isDemo } = useUIStore();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        if (isDemo) {
          setWeeklyReport(mockWeeklyReport);
          setMonthlyReport(mockMonthlyReport);
        } else {
          const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const weekEnd = new Date().toISOString();
          const weekly = await getWeeklyOrders(weekStart, weekEnd);
          setWeeklyReport((weekly.success ? weekly.data : null) as unknown as WeeklyReport | null);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [isDemo]);

  const currentReport = period === 'weekly' ? weeklyReport : monthlyReport;
  const trend = currentReport?.trend ?? 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">리포트</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Period Tabs */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">주간</TabsTrigger>
            <TabsTrigger value="monthly">월간</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse-ring w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {/* Lens Insight */}
              <Card className="mt-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <LensCharacter 
                      mood={trend < 0 ? 'happy' : trend > 0 ? 'worried' : 'thinking'} 
                      size="md" 
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary mb-1">렌즈의 분석</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {currentReport?.lensInsight}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">총 탄소 배출</p>
                    <p className="text-2xl font-bold">{formatCO2(currentReport?.totalCo2 ?? 0)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">주문당 평균</p>
                    <p className="text-2xl font-bold">{formatCO2(currentReport?.avgCo2PerOrder ?? 0)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Trend Indicator */}
              <Card className={cn(
                "border-2",
                trend < 0 && "border-green-500/50 bg-green-50/50",
                trend > 0 && "border-red-500/50 bg-red-50/50",
                trend === 0 && "border-gray-300"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">지난 {period === 'weekly' ? '주' : '달'} 대비</p>
                      <p className={cn(
                        "text-xl font-bold",
                        trend < 0 && "text-green-600",
                        trend > 0 && "text-red-600",
                        trend === 0 && "text-muted-foreground"
                      )}>
                        {trend > 0 ? '+' : ''}{trend}%
                      </p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      trend < 0 && "bg-green-100",
                      trend > 0 && "bg-red-100",
                      trend === 0 && "bg-gray-100"
                    )}>
                      {trend < 0 ? (
                        <TrendingDown className="w-6 h-6 text-green-600" />
                      ) : trend > 0 ? (
                        <TrendingUp className="w-6 h-6 text-red-600" />
                      ) : (
                        <Minus className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <TabsContent value="weekly" className="mt-0 space-y-4">
                {/* Daily Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">일별 탄소 배출</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-32 gap-2">
                      {weeklyReport?.dailyData.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-primary/80 rounded-t transition-all"
                            style={{ height: `${(day.co2 / 70) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{day.date}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Materials */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">많이 사용한 재질</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weeklyReport?.topMaterials.map((mat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-12 text-sm font-medium">{mat.material}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${mat.percentage}%` }}
                          />
                        </div>
                        <span className="w-10 text-sm text-muted-foreground text-right">
                          {mat.count}개
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="mt-0 space-y-4">
                {/* Weekly Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">주별 탄소 배출</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-32 gap-4">
                      {monthlyReport?.weeklyData.map((week, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-primary/80 rounded-t transition-all"
                            style={{ height: `${(week.co2 / 350) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{week.week}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">이번 달 도전과제</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {monthlyReport?.achievements.map((ach, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          ach.achieved ? "bg-green-100" : "bg-gray-100"
                        )}>
                          {ach.achieved ? (
                            <Leaf className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm",
                          ach.achieved ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {ach.title}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Environment Impact */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wind className="w-5 h-5 text-primary" />
                    환경 영향 환산
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-background rounded-lg">
                      <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-lg font-bold">
                        {((currentReport?.totalCo2 ?? 0) * 0.5).toFixed(0)}L
                      </p>
                      <p className="text-xs text-muted-foreground">물 사용량</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-lg font-bold">
                        {((currentReport?.totalCo2 ?? 0) * 0.02).toFixed(1)}km
                      </p>
                      <p className="text-xs text-muted-foreground">자동차 주행</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
