'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bookingsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';
import Link from 'next/link';

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
  EDIT_REQUESTED: 'bg-blue-100 text-blue-800',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadBookings();
  }, [user, router]);

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your booking requests
            </p>
          </div>
          <Link href="/bookings/new">
            <Button>New Booking</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't made any booking requests yet.
                </p>
                <Link href="/bookings/new">
                  <Button>Create Your First Booking</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.eventName}</CardTitle>
                      <CardDescription>
                        {booking.space?.name} • {booking.attendees} attendees
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[booking.status]
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start</p>
                      <p className="font-medium">{formatDateTime(booking.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End</p>
                      <p className="font-medium">{formatDateTime(booking.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Organization</p>
                      <p className="font-medium">{booking.entity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seating</p>
                      <p className="font-medium">{booking.seating}</p>
                    </div>
                  </div>

                  {booking.adminComment && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">Admin Comment:</p>
                      <p className="text-sm">{booking.adminComment}</p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-muted-foreground">
                    Submitted on {formatDateTime(booking.createdAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
