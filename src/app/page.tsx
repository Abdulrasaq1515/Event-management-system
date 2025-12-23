import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-100 mb-6">
            EventHub
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            A production-ready platform for creating, managing, and discovering
            events. Built with Next.js 14, TypeScript, and modern web
            technologies.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/events">
              <Button variant="primary" className="text-lg px-8 py-3">
                View Events
              </Button>
            </Link>
            <Link href="/events/new">
              <Button variant="ghost" className="text-lg px-8 py-3">
                Create Event
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                Event Management
              </h3>
              <p className="text-slate-400">
                Create, update, and manage events with a comprehensive CRUD
                interface and real-time updates.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                Advanced Search
              </h3>
              <p className="text-slate-400">
                Find events with powerful filtering by category, date, location,
                status, and full-text search.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                Web3 Integration
              </h3>
              <p className="text-slate-400">
                Optional NFT-based ticketing with Solana blockchain integration
                and wallet connectivity.
              </p>
            </Card>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-slate-100 mb-3">🚀 Features</h4>
              <ul className="text-slate-400 space-y-2 text-left">
                <li>• Full-stack TypeScript implementation</li>
                <li>• Real-time data with TanStack Query</li>
                <li>• Comprehensive validation with Zod</li>
                <li>• Property-based testing</li>
                <li>• Responsive dark theme UI</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-slate-100 mb-3">⚡ Tech Stack</h4>
              <ul className="text-slate-400 space-y-2 text-left">
                <li>• Next.js 14 with App Router</li>
                <li>• Drizzle ORM with PlanetScale</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Vitest for testing</li>
                <li>• Solana Web3 integration</li>
              </ul>
            </Card>
          </div>

          <div className="mt-16 p-6 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-slate-300 font-medium mb-2">
              ✅ System Status: Fully Operational
            </p>
            <p className="text-sm text-slate-400">
              Backend API, database, authentication, and frontend are complete and ready for production use.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
