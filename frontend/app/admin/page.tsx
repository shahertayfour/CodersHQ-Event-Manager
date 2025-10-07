'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
  EDIT_REQUESTED: 'bg-blue-100 text-blue-800',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | ''>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    loadBookings();
  }, [user, isAdmin, router, filter]);

  const loadBookings = async () => {
    try {
      const data = await adminApi.getAllBookings(
        filter ? { status: filter } : undefined
      );
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    action: 'approve' | 'deny' | 'requestEdit',
    bookingId: string
  ) => {
    if (action === 'requestEdit' && !adminComment.trim()) {
      alert('Please provide a comment when requesting edits');
      return;
    }

    setActionLoading(true);
    try {
      const dto = { adminComment: adminComment || undefined };

      if (action === 'approve') {
        await adminApi.approveBooking(bookingId, dto);
      } else if (action === 'deny') {
        await adminApi.denyBooking(bookingId, dto);
      } else {
        await adminApi.requestEdit(bookingId, dto);
      }

      setSelectedBooking(null);
      setAdminComment('');
      loadBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all booking requests
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filter === '' ? 'default' : 'outline'}
                onClick={() => setFilter('')}
              >
                All
              </Button>
              <Button
                variant={filter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'APPROVED' ? 'default' : 'outline'}
                onClick={() => setFilter('APPROVED')}
              >
                Approved
              </Button>
              <Button
                variant={filter === 'DENIED' ? 'default' : 'outline'}
                onClick={() => setFilter('DENIED')}
              >
                Denied
              </Button>
              <Button
                variant={filter === 'EDIT_REQUESTED' ? 'default' : 'outline'}
                onClick={() => setFilter('EDIT_REQUESTED')}
              >
                Edit Requested
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.eventName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {booking.firstName} {booking.lastName} • {booking.entity}
                      </p>
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
                  <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Space</p>
                      <p className="font-medium">{booking.space?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start</p>
                      <p className="font-medium">
                        {formatDateTime(booking.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End</p>
                      <p className="font-medium">
                        {formatDateTime(booking.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Attendees</p>
                      <p className="font-medium">{booking.attendees}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seating</p>
                      <p className="font-medium">{booking.seating}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact</p>
                      <p className="font-medium">{booking.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Agenda:</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.agenda}
                    </p>
                  </div>

                  {selectedBooking?.id === booking.id ? (
                    <div className="space-y-4 p-4 border rounded-md">
                      <Textarea
                        placeholder="Add a comment (optional for approve/deny, required for edit request)"
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            handleAction('approve', booking.id)
                          }
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleAction('deny', booking.id)}
                          disabled={actionLoading}
                          variant="destructive"
                        >
                          Deny
                        </Button>
                        <Button
                          onClick={() =>
                            handleAction('requestEdit', booking.id)
                          }
                          disabled={actionLoading}
                          variant="outline"
                        >
                          Request Edit
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedBooking(null);
                            setAdminComment('');
                          }}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    booking.status === 'PENDING' && (
                      <Button
                        onClick={() => setSelectedBooking(booking)}
                        variant="outline"
                      >
                        Review
                      </Button>
                    )
                  )}

                  {booking.adminComment && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">
                        Previous Admin Comment:
                      </p>
                      <p className="text-sm">{booking.adminComment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
