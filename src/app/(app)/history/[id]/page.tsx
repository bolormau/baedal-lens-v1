import { HistoryDetailFeature } from "@/features/history/HistoryDetailFeature"

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <HistoryDetailFeature id={id} />
}
