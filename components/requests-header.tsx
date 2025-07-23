import React, { useState } from "react";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";

function RequestsHeader() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const today = new Date();
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(today.getDate() - 6);
      return { from: sixDaysAgo, to: today };
    }
  );
  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={setDateRange}
      numberOfMonths={1}
      className="rounded-lg border shadow-sm"
    />
  );
}

export default RequestsHeader;
