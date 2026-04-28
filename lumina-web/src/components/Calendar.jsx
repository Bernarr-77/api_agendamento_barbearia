import { useState } from 'react';
import './Calendar.css';

export default function Calendar({ selectedDate, onDateSelect, minDate, maxDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startDay = startOfMonth.getDay(); // 0-6 (Sun-Sat)

  const daysInCurrentMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const daysInPrevMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth() - 1);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, daysInPrevMonth - i),
      });
    }
    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      });
    }
    // Next month padding (to fill grid up to 42 cells = 6 weeks)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i),
      });
    }
    return days;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="calendar-container animate-fade-in">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h3 className="calendar-title">
          {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <button className="calendar-nav" onClick={nextMonth}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="calendar-grid-header">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {renderDays().map((d, index) => {
          const isoDate = formatIsoDate(d.date);
          const isSelected = selectedDate === isoDate;
          const isOutOfRange = (minDate && isoDate < minDate) || (maxDate && isoDate > maxDate);
          
          let className = "calendar-day";
          if (!d.isCurrentMonth) className += " text-muted";
          if (isSelected) className += " selected";
          if (d.date.getTime() === today.getTime()) className += " today";
          if (isOutOfRange) className += " disabled"; 

          return (
            <button
              key={index}
              className={className}
              disabled={isOutOfRange}
              onClick={() => onDateSelect(isoDate)}
            >
              <div className="calendar-day-inner">{d.day}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
