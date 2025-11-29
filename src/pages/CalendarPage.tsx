import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getTrainings } from '../trainingapi';
import dayjs from 'dayjs';

type TrainingEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

//localizer 
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

function CalendarPage() {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<any>(Views.MONTH);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTrainings();
        const mapped: (TrainingEvent | null)[] = data.map((t: any) => {
          const startD = dayjs(t?.date);
          if (!startD.isValid()) return null;
          // Limit to recent 12 months 
          const cutoff = dayjs().subtract(12, 'month');
          if (startD.isBefore(cutoff)) return null;
          const start = startD.toDate();
          const rawDur = Number(t?.duration);
          const minutes = Number.isFinite(rawDur) && rawDur > 0 ? rawDur : 30;
          const end = dayjs(start).add(minutes, 'minute').toDate();
          if (isNaN(end.getTime())) return null;
          const title = `${t?.activity ?? ''} — ${t?.customer?.firstname ?? ''} ${t?.customer?.lastname ?? ''}`.trim();
          return { title: title || 'Training', start, end };
        });
        setEvents(mapped.filter(Boolean) as TrainingEvent[]);
        // Helpful log for debugging
       
        console.log('Calendar events loaded:', mapped.filter(Boolean).length);
      } finally {
        // no-op
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ height: 700 }}>
      <Typography variant="h5" gutterBottom>
        Training Calendar
      </Typography>
      <Calendar
        localizer={localizer}
        culture="en-US"
        events={events}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={currentView}
        onNavigate={(date) => setCurrentDate(date)}
        onView={(view) => setCurrentView(view)}
        style={{ height: '100%' }}
      />
    </Box>
  );
}

export default CalendarPage;
