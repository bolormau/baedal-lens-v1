'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Leaf, Wind } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LensCharacter } from '@/features/shared/lens-character/LensCharacter';
import { useUIStore } from '@/stores/useUIStore';
import { formatCO2, formatWeekRange } from '@/lib/formatters';
import { getWeeklyOrders } from '@/lib/actions/report.actions';
import { cn } from '@/lib/utils';
import type { WeeklyReport, ScanResult, CategoryBreakdownItem, AnalyzerStatusItem } from '@/types/domain.types';

const WEEKLY_INSIGHT_SYSTEM = `You are an eco-analysis assistant for a Korean delivery app. Given a list of weekly delivery orders with plastic gram counts, respond with a JSON object:
{"insight": "<1-2 sentences in Korean about the week's plastic usage and a tip>", "source": "렌즈 AI 분석"}
Respond ONLY with the JSON object.`;

const MOCK_REPORT: WeeklyReport = {
  weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  weekEnd: new Date().toISOString(),
  totalG: 340,
  previousWeekG: 400,
  trend: -15,
  equivalent: 6,
  categories: [
    { category: 'CHICKEN', plasticG: 160, percentage: 47 },
    { category: 'CHINESE', plasticG: 110, percentage: 32 },
    { category: 'PIZZA', plasticG: 70, percentage: 21 },
  ],
  insight: '지난주보다 15% 줄였어요! 특히 수요일에 적게 시켜서 좋았어요. 이 페이스 유지하면 이번 달 목표 달성할 수 있어요!',
  insightSource: '렌즈 AI 분석 (데모)',
  analyzerStatus: [
    { done: true, text: '일주일 배달 패턴 분석 완료' },
    { done: true, text: '카테고리별 플라스틱 분류 완료' },
    { done: false, text: '다음 주 예측 준비 중' },
  ],
  mirrorStatus: { status: 'locked', weeksRemaining: 2 },
};

function buildReport(orders: ScanResult[], prevOrders: ScanResult[]): WeeklyReport {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const totalG = orders.reduce((s, o) => s + o.plasticG, 0);
  const previousWeekG = prevOrders.reduce((s, o) => s + o.plasticG, 0);
  const trend =
    previousWeekG === 0
      ? 0
      : Math.round(((totalG - previousWeekG) / previousWeekG) * 100);
  const equivalent = Math.floor(totalG / 52);

  const catMap = new Map<string, number>();
  for (const o of orders) {
    catMap.set(o.category, (catMap.get(o.category) ?? 0) + o.plasticG);
  }
  const categories: CategoryBreakdownItem[] = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, plasticG]) => ({
      category: category as CategoryBreakdownItem['category'],
      plasticG,
      percentage: totalG > 0 ? Math.round((plasticG / totalG) * 100) : 0,
    }));

  const analyzerStatus: AnalyzerStatusItem[] = [
    { done: orders.length >= 1, text: '배달 패턴 감지기' },
    { done: orders.length >= 3, text: '상관관계 엔진' },
    { done: trend < 0, text: '에스컬레이션 트래커' },
    { done: orders.some((o) => o.unrequested.length === 0), text: '절약 누적기' },
  ];

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: now.toISOString(),
    totalG,
    previousWeekG,
    trend,
    equivalent,
    categories,
    insight: '',
    insightSource: '',
    analyzerStatus,
    mirrorStatus: { status: 'locked', weeksRemaining: 2 },
  };
}

export default function ReportPage() {
  const router = useRouter();
  const { isDemo } = useUIStore();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (isDemo) {
          setReport(MOCK_REPORT);
          setLoading(false);
          return;
        }

        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const prevStart = new Date(weekStart);
        prevStart.setDate(prevStart.getDate() - 7);

        const [thisWeekRes, prevWeekRes] = await Promise.all([
          getWeeklyOrders(weekStart.toISOString(), now.toISOString()),
          getWeeklyOrders(prevStart.toISOString(), weekStart.toISOString()),
        ]);

        const thisOrders = thisWeekRes.success ? thisWeekRes.data ?? [] : [];
        const prevOrders = prevWeekRes.success ? prevWeekRes.data ?? [] : [];

        const base = buildReport(thisOrders, prevOrders);

        // Feature C: weekly insight AI
        if (thisOrders.length > 0) {
          try {
            const insightRes = await fetch('/api/claude', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system: WEEKLY_INSIGHT_SYSTEM,
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: JSON.stringify({
                          totalG: base.totalG,
                          previousWeekG: base.previousWeekG,
                          trend: base.trend,
                          orderCount: thisOrders.length,
                          categories: base.categories,
                        }),
                      },
                    ],
                  },
                ],
              }),
            });
            if (insightRes.ok) {
              const insightData = await insightRes.json();
              if (insightData.success) {
                let parsed: { insight?: string; source?: string } | null = null;
                try {
                  parsed = JSON.parse(insightData.data);
                } catch {
                  const match = insightData.data.match(/```(?:json)?\s*([\s\S]*?)```/);
                  if (match) parsed = JSON.parse(match[1]);
                }
                if (parsed?.insight) {
                  base.insight = parsed.insight;
                  base.insightSource = parsed.source ?? '렌즈 AI 분석';
                }
              }
            }
          } catch {
            // insight is optional — silently skip
          }
        }

        setReport(base);
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemo]);

  const trend = report?.trend ?? 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">주간 리포트</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !report ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">리포트를 불러올 수 없어요</p>
          </div>
        ) : (
          <>
            {/* Period */}
            <p className="text-sm text-muted-foreground text-center">
              {formatWeekRange(new Date(report.weekStart), new Date(report.weekEnd))}
            </p>

            {/* Lens Insight */}
            {report.insight && (
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <LensCharacter
                      expression={trend < 0 ? 'excited' : trend > 0 ? 'thinking' : 'curious'}
                      size="medium"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary mb-1">렌즈의 분석</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{report.insight}</p>
                      {report.insightSource && (
                        <p className="text-xs text-muted-foreground mt-1">{report.insightSource}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">총 플라스틱</p>
                  <p className="text-2xl font-bold">{formatCO2(report.totalG)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">페트병 환산</p>
                  <p className="text-2xl font-bold">{report.equivalent}개</p>
                </CardContent>
              </Card>
            </div>

            {/* Trend */}
            <Card
              className={cn(
                'border-2',
                trend < 0 && 'border-green-500/50 bg-green-50/50',
                trend > 0 && 'border-red-500/50 bg-red-50/50',
                trend === 0 && 'border-gray-300'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">지난 주 대비</p>
                    <p
                      className={cn(
                        'text-xl font-bold',
                        trend < 0 && 'text-green-600',
                        trend > 0 && 'text-red-600',
                        trend === 0 && 'text-muted-foreground'
                      )}
                    >
                      {trend > 0 ? '+' : ''}
                      {trend}%
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      trend < 0 && 'bg-green-100',
                      trend > 0 && 'bg-red-100',
                      trend === 0 && 'bg-gray-100'
                    )}
                  >
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

            {/* Category Breakdown */}
            {report.categories.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">카테고리별 플라스틱</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-16 text-sm font-medium">{cat.category}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm text-muted-foreground text-right">
                        {formatCO2(cat.plasticG)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Analyzer Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wind className="w-5 h-5 text-primary" />
                  렌즈 분석기 상태
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.analyzerStatus.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                        item.done ? 'bg-green-100' : 'bg-gray-100'
                      )}
                    >
                      {item.done ? (
                        <Leaf className="w-3 h-3 text-green-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full border border-gray-400" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        item.done ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
