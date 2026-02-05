import React, { createContext, useContext, useState, useCallback } from 'react';

export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

export type Business = {
  id: string;
  name: string;
  category: string;
  address: string;
  services: Service[];
};

export type Appointment = {
  id: string;
  businessId: string;
  businessName: string;
  serviceName: string;
  startTime: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'delayed';
};

type BookingState = {
  selectedBusiness: Business | null;
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
};

type BookingContextType = BookingState & {
  selectBusiness: (b: Business | null) => void;
  selectService: (s: Service | null) => void;
  selectDate: (d: Date | null) => void;
  selectTime: (t: string | null) => void;
  confirmBooking: () => Appointment | null;
  appointments: Appointment[];
  resetBooking: () => void;
};

const initialBookingState: BookingState = {
  selectedBusiness: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
};

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(initialBookingState);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const selectBusiness = useCallback((b: Business | null) => {
    setState((s) => ({ ...s, selectedBusiness: b, selectedService: null }));
  }, []);

  const selectService = useCallback((s: Service | null) => {
    setState((prev) => ({ ...prev, selectedService: s }));
  }, []);

  const selectDate = useCallback((d: Date | null) => {
    setState((prev) => ({ ...prev, selectedDate: d }));
  }, []);

  const selectTime = useCallback((t: string | null) => {
    setState((prev) => ({ ...prev, selectedTime: t }));
  }, []);

  const confirmBooking = useCallback(() => {
    const { selectedBusiness, selectedService, selectedDate, selectedTime } = state;
    if (!selectedBusiness || !selectedService || !selectedDate || !selectedTime) return null;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);

    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      businessId: selectedBusiness.id,
      businessName: selectedBusiness.name,
      serviceName: selectedService.name,
      startTime,
      duration: selectedService.duration,
      status: 'scheduled',
    };

    setAppointments((prev) => [appointment, ...prev]);
    setState(initialBookingState);
    return appointment;
  }, [state]);

  const resetBooking = useCallback(() => {
    setState(initialBookingState);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        selectBusiness,
        selectService,
        selectDate,
        selectTime,
        confirmBooking,
        appointments,
        resetBooking,
      }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
