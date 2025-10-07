import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to CHQ Space Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book and manage spaces at Coders HQ. Choose from our co-working space,
            lecture room, or meeting room for your next event.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/bookings/new">
              <Button size="lg">Book a Space</Button>
            </Link>
            <Link href="/calendar">
              <Button size="lg" variant="outline">
                View Calendar
              </Button>
            </Link>
          </div>
        </section>

        {/* Spaces Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Spaces</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Co-working Space</CardTitle>
                <CardDescription>Capacity: 20 people</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  2 tables with 10 seats each - Perfect for collaborative work
                  and team meetings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lecture Room</CardTitle>
                <CardDescription>Capacity: 40 people</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ideal for talks, training sessions, workshops, and larger
                  gatherings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meeting Room</CardTitle>
                <CardDescription>Capacity: 10 people</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Perfect for small group meetings, mentoring sessions, and
                  focused discussions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Submit Request</h3>
              <p className="text-sm text-muted-foreground">
                Fill out the booking form with your event details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Admin Review</h3>
              <p className="text-sm text-muted-foreground">
                Our team reviews your request and responds within 24-48 hours
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Get Confirmed</h3>
              <p className="text-sm text-muted-foreground">
                Receive confirmation and access details for your event
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Coders HQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
