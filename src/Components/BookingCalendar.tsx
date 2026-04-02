import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingCalendarProps {
  bookings: Array<{
    id: string;
    bookingDate: Date;
    customerName: string;
    status: string;
    address: string;
  }>;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Filter to show only approved bookings
  const approvedBookings = bookings.filter((b) => b.status === "approved");

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getBookingsForDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    return approvedBookings.filter((b) => getDateKey(b.bookingDate) === dateKey);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 text-lg">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateBookings = getBookingsForDate(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const hasBookings = dateBookings.length > 0;
          const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
          const isHovered = hoveredDate === dateKey;

          return (
            <div
              key={day}
              className="relative"
              onMouseEnter={() => hasBookings && setHoveredDate(dateKey)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <div
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold cursor-default transition-all ${
                  hasBookings
                    ? "bg-[#0072D1] text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {day}
              </div>

              {/* Hover popup */}
              {isHovered && hasBookings && (
                <div className="absolute z-10 top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[280px]">
                  <div className="space-y-2">
                    {dateBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="text-xs border-l-2 border-[#0072D1] pl-2"
                      >
                        <p className="font-semibold text-gray-900">
                          {booking.customerName}
                        </p>
                        <p className="text-gray-600">
                          {booking.address}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded text-[10px] font-bold ${
                            booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "declined"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar;
