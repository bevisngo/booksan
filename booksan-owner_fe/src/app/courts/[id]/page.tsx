'use client';

import { useParams } from 'next/navigation';
import { CourtDetailPage } from '@/components/courts/court-detail-page';

export default function CourtDetailPageRoute() {
  const params = useParams();
  const courtId = params.id as string;

  return <CourtDetailPage courtId={courtId} />;
}
