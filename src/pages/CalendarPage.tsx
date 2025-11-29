import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getTrainings } from '../trainingapi';

type TrainingEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

function CalendarPage() {
  const [events, setEvents] = useState<TrainingEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTrainings();
        const mapped: TrainingEvent[] = data.map((t: any) => {
          const start = new Date(t.date);
          const end = new Date(start.getTime() + (Number(t.duration) || 0) * 60000);
          const title = `${t.activity} — ${t.customer?.firstname ?? ''} ${t.customer?.lastname ?? ''}`.trim();
          return { title, start, end };
        });
        setEvents(mapped);
      } finally {
        // no-op
      }
    };
    fetchData();
  }, []);

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS },
  });

  return (
    <Box sx={{ height: 700 }}>
      <Typography variant="h5" gutterBottom>
        Training Calendar
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </Box>
  );
}

export default CalendarPage;
