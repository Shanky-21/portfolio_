declare module 'react-calendar-heatmap' {
  import React from 'react';

  export interface CalendarHeatmapValue {
    date: string;
    count?: number;
    topics?: Record<string, number>;
    [key: string]: string | number | Record<string, number> | undefined;
  }

  export interface CalendarHeatmapProps {
    values: CalendarHeatmapValue[];
    startDate: Date;
    endDate: Date;
    classForValue?: (value: CalendarHeatmapValue | null) => string;
    tooltipDataAttrs?: 
      | { [key: string]: string }
      | ((value: CalendarHeatmapValue | null) => { [key: string]: string });
    gutterSize?: number;
    horizontal?: boolean;
    monthLabels?: string[];
    numDays?: number;
    onClick?: (value: CalendarHeatmapValue) => void;
    onMouseLeave?: (event: React.MouseEvent, value: CalendarHeatmapValue) => void;
    onMouseOver?: (event: React.MouseEvent, value: CalendarHeatmapValue) => void;
    showMonthLabels?: boolean;
    showOutOfRangeDays?: boolean;
    showWeekdayLabels?: boolean;
    titleForValue?: (value: CalendarHeatmapValue) => string;
    transformDayElement?: (element: React.ReactElement, value: CalendarHeatmapValue, index: number) => React.ReactElement;
    weekdayLabels?: string[];
  }

  const CalendarHeatmap: React.FC<CalendarHeatmapProps>;
  export default CalendarHeatmap;
} 