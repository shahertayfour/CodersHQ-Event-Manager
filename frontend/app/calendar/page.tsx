'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calendarApi, spacesApi } from '@/lib/api';
import type { CalendarEvent, Space } from '@/types';
import dynamic from 'next/dynamic';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
const dayGridPlugin = dynamic(() => import('@fullcalendar/daygrid'));
const timeGridPlugin = dynamic(() => import('@fullcalendar/timegrid'));
const interactionPlugin = dynamic(() => import('@fullcalendar/interaction'));

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');

  useEffect(() => {
    spacesApi.getAll().then(setSpaces).catch(console.error);
    loadEvents();
  }, [selectedSpace]);

  const loadEvents = async () => {
    try {
      const data = await calendarApi.getEvents(selectedSpace || undefined);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor:
      event.visibility === 'PRIVATE'
        ? '#94a3b8'
        : event.visibility === 'INTERNAL'
        ? '#f59e0b'
        : '#3b82f6',
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Event Calendar</CardTitle>
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Spaces</option>
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={calendarEvents}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
