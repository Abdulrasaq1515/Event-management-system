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
            Create amazing events and connect with your community. 
            From workshops to conferences, make every gathering memorable.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/events">
              <Button variant="primary" className="text-lg px-8 py-3">
                Discover Events
              </Button>
            </Link>
            <Link href="/events/new">
              <Button variant="ghost" className="text-lg px-8 py-3">
                Create Your Event
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                Easy Event Creation
              </h3>
              <p className="text-slate-400">
                Create professional events in minutes. Add details, set dates, 
                choose locations, and publish to your audience instantly.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                Find Perfect Events
              </h3>
              <p className="text-slate-400">
                Discover events that match your interests. Search by category, 
                date, location, or keywords to find exactly what you're looking for.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                Smart Organization
              </h3>
              <p className="text-slate-400">
                Manage all your events in one place. Track attendance, 
                update details, and keep your community informed effortlessly.
              </p>
            </Card>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-slate-100 mb-3">✨ Perfect For</h4>
              <ul className="text-slate-400 space-y-2 text-left">
                <li>• Business conferences and seminars</li>
                <li>• Community meetups and workshops</li>
                <li>• Online webinars and virtual events</li>
                <li>• Networking events and social gatherings</li>
                <li>• Educational courses and training sessions</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-slate-100 mb-3">🚀 Why Choose EventHub</h4>
              <ul className="text-slate-400 space-y-2 text-left">
                <li>• Simple and intuitive interface</li>
                <li>• Support for both virtual and physical events</li>
                <li>• Real-time updates and notifications</li>
                <li>• Mobile-friendly responsive design</li>
                <li>• Free to use with premium features</li>
              </ul>
            </Card>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-slate-800">
            <h3 className="text-2xl font-bold text-slate-100 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of event organizers who trust EventHub to bring their communities together. 
              Create your first event today and see the difference.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/events/new">
                <Button variant="primary" className="text-lg px-8 py-3">
                  Create Event Now
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="ghost" className="text-lg px-8 py-3">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-slate-300 font-medium mb-1">
              🟢 Platform Status: Online & Ready
            </p>
            <p className="text-sm text-slate-400">
              All systems operational. Create and discover events with confidence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
