import { redirect } from 'next/navigation';

export default function HomePage() {
  // This will be handled by middleware to redirect to /facilities
  redirect('/facilities');
}