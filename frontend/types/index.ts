export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EDIT_REQUESTED = 'EDIT_REQUESTED',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  INTERNAL = 'INTERNAL',
}

export enum Seating {
  THEATRE = 'THEATRE',
  WORKSHOP = 'WORKSHOP',
  CLASSROOM = 'CLASSROOM',
  USHAPE = 'USHAPE',
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
}

export interface Space {
  id: string;
  name: string;
  capacity: number;
  description?: string;
}

export interface Booking {
  id: string;
  requesterId: string;
  requester?: User;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  entity: string;
  jobTitle: string;
  spaceId: string;
  space?: Space;
  eventName: string;
  startDate: string;
  endDate: string;
  attendees: number;
  seating: Seating;
  agenda: string;
  valet: boolean;
  catering: boolean;
  photography: boolean;
  itSupport: boolean;
  screensDisplay: boolean;
  comments?: string;
  status: BookingStatus;
  visibility: Visibility;
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  spaceId: string;
  spaceName: string;
  entity?: string;
  attendees?: number;
  visibility: Visibility;
}

export interface CreateBookingDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  entity: string;
  jobTitle: string;
  spaceId: string;
  eventName: string;
  startDate: string;
  endDate: string;
  attendees: number;
  seating: Seating;
  agenda: string;
  valet?: boolean;
  catering?: boolean;
  photography?: boolean;
  itSupport?: boolean;
  screensDisplay?: boolean;
  comments?: string;
  visibility?: Visibility;
}

export interface UpdateBookingStatusDto {
  adminComment?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  entity?: string;
  jobTitle?: string;
}
