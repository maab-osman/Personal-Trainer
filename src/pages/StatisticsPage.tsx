import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Card, CardContent, Tabs, Tab, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { getTrainings } from '../trainingapi';
// If recharts is not installed yet, show a helpful hint.
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

dayjs.extend(isoWeek);

type StatDatum = { activity: string; minutes: number };

const barColor = (idx: number) => {
  const palette = ['#1976d2', '#9c27b0', '#2e7d32', '#ff8f00', '#d32f2f', '#00838f', '#5d4037'];
  return palette[idx % palette.length];
};

function StatisticsPage() {
  const [data, setData] = useState<StatDatum[]>([]);
  // Weekly aggregation removed for now per request
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [tab, setTab] = useState<number>(0);
  const [daily, setDaily] = useState<{ date: string; minutes: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const trainings = await getTrainings();
      const inRange = trainings.filter((t: any) => {
        const d = dayjs(t.date);
        return (!startDate || d.isSame(startDate, 'day') || d.isAfter(startDate)) && (!endDate || d.isSame(endDate, 'day') || d.isBefore(endDate));
      });
      const agg: Record<string, number> = {};
      for (const t of inRange) {
        const key = (t.activity ?? 'Unknown').trim();
        const dur = Number(t.duration) || 0;
        agg[key] = (agg[key] ?? 0) + dur;
      }
      const rows = Object.entries(agg)
        .map(([activity, minutes]) => ({ activity, minutes }))
        .sort((a, b) => b.minutes - a.minutes);
      setData(rows);

      // Weekly aggregation removed per request
      // Daily minutes for trend
      const byDay: Record<string, number> = {};
      for (const t of inRange) {
        const dayKey = dayjs(t.date).format('YYYY-MM-DD');
        byDay[dayKey] = (byDay[dayKey] ?? 0) + (Number(t.duration) || 0);
      }
      const dailyRows = Object.entries(byDay)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([date, minutes]) => ({ date, minutes }));
      setDaily(dailyRows);
    };
    fetchData();
  }, [startDate, endDate]);

  const exportCsv = (rows: StatDatum[]) => {
    const header = 'Activity,Minutes\n';
    const body = rows.map((r) => `${escapeCsv(r.activity)},${r.minutes}`).join('\n');
    const csv = header + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_minutes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (s: string) => '"' + s.replaceAll('"', '""') + '"';

  return (
    <Box sx={{ height: 700 }}>
      <Typography variant="h5" gutterBottom>
        Training Statistics
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Activity Minutes (Bar)" />
        <Tab label="Activity Distribution (Pie)" />
        <Tab label="Minutes per Day (Line)" />
      </Tabs>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <DatePicker label="Start date" value={startDate} onChange={setStartDate} />
          </Box>
          <Box>
            <DatePicker label="End date" value={endDate} onChange={setEndDate} />
          </Box>
        </Box>
      </LocalizationProvider>

      {/* Top 3 activities summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        {data.slice(0, 3).map((d) => (
          <Card key={d.activity}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {d.activity}
              </Typography>
              <Typography variant="body2">Total minutes: {d.minutes}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* CSV export for current aggregation */}
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => exportCsv(data)}>
          Download CSV (Activity Minutes)
        </Button>
      </Box>

      {tab === 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Total Minutes per Activity
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activity" tick={{ fontSize: 12 }} interval={0} angle={-20} dy={10} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value} min`, 'Minutes']} />
              <Bar dataKey="minutes" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Activity Distribution (by minutes)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey="minutes" nameKey="activity" cx="50%" cy="50%" outerRadius={100} label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.activity}`} fill={barColor(index)} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} min`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Minutes per Day (Trend)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily} margin={{ top: 16, right: 24, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value} min`, 'Minutes']} />
              <Line type="monotone" dataKey="minutes" stroke="#1976d2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Weekly overview could be reintroduced later if needed */}
    </Box>
  );
}

export default StatisticsPage;
