import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
  addDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export type BookingStatus = "pending" | "approved" | "declined" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  customerName: string;
  customerContact: string;
  address: string;
  homeLocation: string;
  bookingDate: Date;
  status: BookingStatus;
  createdByRole: "seeker" | "service_provider" | "admin";
  createdAt: Date;
  updatedAt: Date;
  // New fields for cancellation/decline tracking
  cancellationReason?: string;
  cancelledBy?: "customer" | "provider" | "admin";
  declinedReason?: string;
}

const bookingsCol = collection(db, "bookings");

function toDate(value: any): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value?.toDate === "function") return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function docToBooking(snap: any): Booking {
  const data = snap.data();
  return {
    id: snap.id,
    customerId: data.customerId || "",
    providerId: data.providerId || "",
    customerName: data.customerName || "",
    customerContact: data.customerContact || "",
    address: data.address || "",
    homeLocation: data.homeLocation || "",
    bookingDate: toDate(data.bookingDate),
    status: data.status || "pending",
    createdByRole: data.createdByRole || "seeker",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    cancellationReason: data.cancellationReason || "",
    cancelledBy: data.cancelledBy || undefined,
    declinedReason: data.declinedReason || "",
  };
}

function sortByNewer(bookings: Booking[]): Booking[] {
  return bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const bookingService = {
  async createBooking(payload: Omit<Booking, "id" | "createdAt" | "updatedAt" | "status">): Promise<string> {
    const docRef = await addDoc(bookingsCol, {
      ...payload,
      id: "", // placeholder, will be set by Firestore docId
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getBooking(bookingId: string): Promise<Booking | null> {
    const snap = await getDoc(doc(bookingsCol, bookingId));
    return snap.exists() ? docToBooking(snap) : null;
  },

  async getBookingsForCustomer(customerId: string): Promise<Booking[]> {
    const snap = await getDocs(query(bookingsCol, where("customerId", "==", customerId)));
    return sortByNewer(snap.docs.map(docToBooking));
  },

  async getBookingsForProvider(providerId: string): Promise<Booking[]> {
    const snap = await getDocs(query(bookingsCol, where("providerId", "==", providerId)));
    return sortByNewer(snap.docs.map(docToBooking));
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await updateDoc(doc(bookingsCol, bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Cancel a booking with a reason.
   * Used when customer or admin cancels an approved booking.
   */
  async cancelBookingWithReason(
    bookingId: string,
    reason: string,
    cancelledBy: "customer" | "provider" | "admin"
  ): Promise<void> {
    await updateDoc(doc(bookingsCol, bookingId), {
      status: "cancelled",
      cancellationReason: reason,
      cancelledBy,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Decline a booking with a reason.
   * Used when provider declines a pending or approved booking.
   */
  async declineBookingWithReason(
    bookingId: string,
    reason: string
  ): Promise<void> {
    await updateDoc(doc(bookingsCol, bookingId), {
      status: "declined",
      declinedReason: reason,
      updatedAt: serverTimestamp(),
    });
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await this.updateBookingStatus(bookingId, "cancelled");
  },

  async completeBooking(bookingId: string): Promise<void> {
    await this.updateBookingStatus(bookingId, "completed");
  },

  subscribeToCustomerBookings(customerId: string, callback: (bookings: Booking[]) => void): Unsubscribe {
    const q = query(bookingsCol, where("customerId", "==", customerId));
    return onSnapshot(q, (snap) => {
      callback(sortByNewer(snap.docs.map(docToBooking)));
    });
  },

  subscribeToProviderBookings(providerId: string, callback: (bookings: Booking[]) => void): Unsubscribe {
    const q = query(bookingsCol, where("providerId", "==", providerId));
    return onSnapshot(q, (snap) => {
      callback(sortByNewer(snap.docs.map(docToBooking)));
    });
  },
};
