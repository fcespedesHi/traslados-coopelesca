"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

interface Calendar05Props {
  onDateChange?: (dateRange: DateRange | undefined) => void;
  defaultRange?: DateRange;
}

export default function Calendar05({ onDateChange, defaultRange }: Calendar05Props) {
  // Calcular el rango por defecto: 6 días antes de hoy hasta hoy
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(today.getDate() - 6);
    
    return {
      from: sixDaysAgo,
      to: today,
    };
  };

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    defaultRange || getDefaultDateRange()
  );

  const handleDateSelect = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    if (onDateChange) {
      onDateChange(newRange);
    }
  };

  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={handleDateSelect}
      numberOfMonths={1}
      className="rounded-lg border shadow-sm"
      disabled={(date) =>
        date > new Date() || date < new Date("1900-01-01")
      }
    />
  )
}
