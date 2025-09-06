import { redirect } from 'next/navigation'

export default function VenuesPage() {
  // Redirect to search page
  redirect('/venues/search')
}
