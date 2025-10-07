'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { spacesApi, bookingsApi } from '@/lib/api';
import type { Space, Seating } from '@/types';

export default function NewBookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '',
    entity: '',
    jobTitle: '',
    spaceId: '',
    eventName: '',
    startDate: '',
    endDate: '',
    attendees: '',
    seating: 'THEATRE' as Seating,
    agenda: '',
    valet: false,
    catering: false,
    photography: false,
    itSupport: false,
    screensDisplay: false,
    comments: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    spacesApi.getAll().then(setSpaces).catch(console.error);
  }, [user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bookingData = {
        ...formData,
        attendees: parseInt(formData.attendees),
      };

      await bookingsApi.create(bookingData);
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold mb-2">Booking Submitted!</h2>
                <p className="text-muted-foreground">
                  Your booking request has been submitted successfully. You'll be
                  redirected to your dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>New Booking Request</CardTitle>
            <CardDescription>
              Fill out the form below to request a space booking at CHQ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entity">Entity / Organization *</Label>
                    <Input
                      id="entity"
                      name="entity"
                      value={formData.entity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spaceId">Space *</Label>
                  <select
                    id="spaceId"
                    name="spaceId"
                    value={formData.spaceId}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a space</option>
                    {spaces.map((space) => (
                      <option key={space.id} value={space.id}>
                        {space.name} (Capacity: {space.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendees">Number of Attendees *</Label>
                    <Input
                      id="attendees"
                      name="attendees"
                      type="number"
                      min="1"
                      value={formData.attendees}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seating">Seating Arrangement *</Label>
                    <select
                      id="seating"
                      name="seating"
                      value={formData.seating}
                      onChange={handleChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="THEATRE">Theatre</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="CLASSROOM">Classroom</option>
                      <option value="USHAPE">U-Shape</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenda">Event Brief & Agenda *</Label>
                  <Textarea
                    id="agenda"
                    name="agenda"
                    value={formData.agenda}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe your event, its purpose, and planned activities"
                  />
                </div>
              </div>

              {/* Required Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Required Services</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="valet"
                      name="valet"
                      checked={formData.valet}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="valet" className="cursor-pointer">
                      Valet
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="catering"
                      name="catering"
                      checked={formData.catering}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="catering" className="cursor-pointer">
                      Catering
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="photography"
                      name="photography"
                      checked={formData.photography}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="photography" className="cursor-pointer">
                      Photography/Videography Permit
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="itSupport"
                      name="itSupport"
                      checked={formData.itSupport}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="itSupport" className="cursor-pointer">
                      IT Support
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="screensDisplay"
                      name="screensDisplay"
                      checked={formData.screensDisplay}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="screensDisplay" className="cursor-pointer">
                      Screens Display
                    </Label>
                  </div>
                </div>
              </div>

              {/* Additional Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special requests or additional information"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
