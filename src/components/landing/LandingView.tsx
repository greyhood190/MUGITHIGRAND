import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { RoomsSection } from './RoomsSection';
import { DiningSection } from './DiningSection';
import { ConferencesSection } from './ConferencesSection';
import { LocationSection } from './LocationSection';
import { BookingModal } from './BookingModal';
import { LandingFooter } from './LandingFooter';

interface LandingViewProps {
  onOpenStaffPortal: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenStaffPortal }) => {
  const { categories } = useHotel();

  // Booking search state
  const [arrivalDate, setArrivalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [guestsCount, setGuestsCount] = useState<number>(2);

  // Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalInitialCategory, setModalInitialCategory] = useState<string | undefined>(undefined);

  const handleOpenBookingWithCategory = (catId: string) => {
    setModalInitialCategory(catId);
    setIsBookingModalOpen(true);
  };

  const handleSearchAvailability = () => {
    setModalInitialCategory(selectedCategory !== 'all' ? selectedCategory : undefined);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      {/* 3-Zone Compliant Top Navigation Bar */}
      <LandingNavbar
        onOpenBooking={() => {
          setModalInitialCategory(undefined);
          setIsBookingModalOpen(true);
        }}
        onOpenStaffPortal={onOpenStaffPortal}
      />

      {/* Hero with Cinematic Photography & Floating Booking Search Bar */}
      <HeroSection
        categories={categories}
        arrivalDate={arrivalDate}
        departureDate={departureDate}
        selectedCategory={selectedCategory}
        guestsCount={guestsCount}
        onArrivalChange={setArrivalDate}
        onDepartureChange={setDepartureDate}
        onCategoryChange={setSelectedCategory}
        onGuestsChange={setGuestsCount}
        onSearchAvailability={handleSearchAvailability}
      />

      {/* Accommodations Showcase with Real KES Pricing & Deluxe Suite Highlight */}
      <RoomsSection
        categories={categories}
        onSelectCategoryForBooking={handleOpenBookingWithCategory}
      />

      {/* Mugithi Restaurant & Terrace Lounge Section */}
      <DiningSection />

      {/* Corporate Conferences & Boardrooms Section */}
      <ConferencesSection
        onInquireEvent={() => {
          setModalInitialCategory(undefined);
          setIsBookingModalOpen(true);
        }}
      />

      {/* Kalimoni, Juja & Kiambu Neighborhood Experience */}
      <LocationSection />

      {/* Quiet Footer */}
      <LandingFooter onOpenStaffPortal={onOpenStaffPortal} />

      {/* Direct Booking & Stay Inquiry Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        categories={categories}
        initialCategory={modalInitialCategory}
        initialArrival={arrivalDate}
        initialDeparture={departureDate}
        initialGuests={guestsCount}
      />
    </div>
  );
};
