'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            CHQ Space Management
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/calendar">
              <Button variant="ghost">Calendar</Button>
            </Link>

            {user ? (
              <>
                <Link href="/bookings/new">
                  <Button variant="ghost">New Booking</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost">My Bookings</Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost">Admin Panel</Button>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
