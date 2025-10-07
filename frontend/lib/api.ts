import axios from 'axios';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  Space,
  Booking,
  CreateBookingDto,
  CalendarEvent,
  UpdateBookingStatusDto,
  BookingStatus,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export const spacesApi = {
  getAll: async (): Promise<Space[]> => {
    const response = await api.get<Space[]>('/spaces');
    return response.data;
  },

  getOne: async (id: string): Promise<Space> => {
    const response = await api.get<Space>(`/spaces/${id}`);
    return response.data;
  },
};

export const bookingsApi = {
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings/me');
    return response.data;
  },

  getOne: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },
};

export const calendarApi = {
  getEvents: async (
    spaceId?: string,
    from?: string,
    to?: string
  ): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams();
    if (spaceId) params.append('spaceId', spaceId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await api.get<CalendarEvent[]>(
      `/calendar?${params.toString()}`
    );
    return response.data;
  },
};

export const adminApi = {
  getAllBookings: async (filters?: {
    status?: BookingStatus;
    spaceId?: string;
    from?: string;
    to?: string;
    requesterName?: string;
  }): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.spaceId) params.append('spaceId', filters.spaceId);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.requesterName)
      params.append('requesterName', filters.requesterName);

    const response = await api.get<Booking[]>(
      `/admin/bookings?${params.toString()}`
    );
    return response.data;
  },

  getBooking: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/admin/bookings/${id}`);
    return response.data;
  },

  approveBooking: async (
    id: string,
    data: UpdateBookingStatusDto
  ): Promise<Booking> => {
    const response = await api.patch<Booking>(
      `/admin/bookings/${id}/approve`,
      data
    );
    return response.data;
  },

  denyBooking: async (
    id: string,
    data: UpdateBookingStatusDto
  ): Promise<Booking> => {
    const response = await api.patch<Booking>(
      `/admin/bookings/${id}/deny`,
      data
    );
    return response.data;
  },

  requestEdit: async (
    id: string,
    data: UpdateBookingStatusDto
  ): Promise<Booking> => {
    const response = await api.patch<Booking>(
      `/admin/bookings/${id}/request-edit`,
      data
    );
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default api;
