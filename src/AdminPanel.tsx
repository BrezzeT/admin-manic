import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, addDoc, getDocs, where, query as fsQuery } from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import emailjs from '@emailjs/browser';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format as formatDateFns } from 'date-fns';

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status?: string;
}

interface BookingData extends Omit<Booking, 'id'> {}

const services = [
  { value: 's_nar_bz', label: 'S (1-2) Нарощення без дизайну — 450 грн' },
  { value: 's_nar_dz', label: 'S (1-2) Нарощення з дизайном — 500 грн' },
  { value: 's_kor_bz', label: 'S (1-2) Корекція без дизайну — 350 грн' },
  { value: 's_kor_dz', label: 'S (1-2) Корекція з дизайном — 400 грн' },
  { value: 'm_nar_bz', label: 'M (3-4) Нарощення без дизайну — 550 грн' },
  { value: 'm_nar_dz', label: 'M (3-4) Нарощення з дизайном — 600 грн' },
  { value: 'm_kor_bz', label: 'M (3-4) Корекція без дизайну — 450 грн' },
  { value: 'm_kor_dz', label: 'M (3-4) Корекція з дизайном — 500 грн' },
  { value: 'l_nar_bz', label: 'L (5-6) Нарощення без дизайну — 650 грн' },
  { value: 'l_nar_dz', label: 'L (5-6) Нарощення з дизайном — 700 грн' },
  { value: 'l_kor_bz', label: 'L (5-6) Корекція без дизайну — 550 грн' },
  { value: 'l_kor_dz', label: 'L (5-6) Корекція з дизайном — 650 грн' },
  { value: 'xl_nar_bz', label: 'XL (7+) Нарощення без дизайну — 700 грн' },
  { value: 'xl_nar_dz', label: 'XL (7+) Нарощення з дизайном — 800 грн' },
  { value: 'xl_kor_bz', label: 'XL (7+) Корекція без дизайну — 600 грн' },
  { value: 'xl_kor_dz', label: 'XL (7+) Корекція з дизайном — 700 грн' },
];

const isValidDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

const AdminPanel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [newBookingSnackbar, setNewBookingSnackbar] = useState<{open: boolean, name: string, date: string} | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: null as Date | null,
    time: null as Date | null,
    notes: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as BookingData)
      }));
      if (bookingsData.length > 0 && bookingsData[0].id !== lastBookingId) {
        if (lastBookingId !== null) {
          setNewBookingSnackbar({
            open: true,
            name: bookingsData[0].name,
            date: bookingsData[0].date + ' ' + bookingsData[0].time
          });
        }
        setLastBookingId(bookingsData[0].id);
      }
      setBookings(bookingsData);
    });

    return () => unsubscribe();
  }, [lastBookingId]);

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };

  const handleDelete = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedBooking) return;
    
    try {
      const bookingData: BookingData = {
        name: selectedBooking.name,
        phone: selectedBooking.phone,
        email: selectedBooking.email,
        service: selectedBooking.service,
        date: selectedBooking.date,
        time: selectedBooking.time,
        notes: selectedBooking.notes
      };

      await updateDoc(doc(db, 'bookings', selectedBooking.id), bookingData);

      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Запис успішно оновлено',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Помилка при оновленні запису',
        severity: 'error'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return;

    try {
      await deleteDoc(doc(db, 'bookings', selectedBooking.id));
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Запис успішно видалено',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Помилка при видаленні запису',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAccept = async (booking: Booking) => {
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { status: 'accepted' });
      // Відправка листа клієнту
      await emailjs.send(
        'service_l9m9d0p',
        'template_n9yk5mr',
        {
          to_name: booking.name,
          date: `${booking.date} ${booking.time}`,
          email: booking.email
        },
        'jd4RPKpFLrZS4ihaj'
      );
      setSnackbar({
        open: true,
        message: 'Запис прийнято та повідомлення надіслано клієнту',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Помилка при підтвердженні запису',
        severity: 'error'
      });
    }
  };

  const handleAddBooking = async () => {
    if (!newBooking.name || !newBooking.phone || !newBooking.service || !newBooking.date || !newBooking.time) {
      setSnackbar({ open: true, message: 'Заповніть всі обовʼязкові поля', severity: 'error' });
      return;
    }
    try {
      const dateStr = formatDateFns(newBooking.date, 'yyyy-MM-dd');
      const timeStr = formatDateFns(newBooking.time, 'HH:mm');
      // Перевірка зайнятості часу
      const bookingsRef = collection(db, 'bookings');
      const q = fsQuery(
        bookingsRef,
        where('date', '==', dateStr),
        where('time', '==', timeStr)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setSnackbar({ open: true, message: 'Цей час вже зайнятий', severity: 'error' });
        return;
      }
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        date: dateStr,
        time: timeStr,
        status: 'accepted',
      });
      setAddDialogOpen(false);
      setNewBooking({ name: '', phone: '', email: '', service: '', date: null, time: null, notes: '' });
      setSnackbar({ open: true, message: 'Запис додано', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Помилка при додаванні запису', severity: 'error' });
    }
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {bookings.map((booking) => (
        <Box 
          key={booking.id}
          sx={{ 
            width: '100%', 
            gridColumn: 'span 12',
            mb: 2
          }}
        >
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1.5px solid #e0e0e0',
              transition: 'transform 0.2s',
              background: booking.status === 'accepted' ? '#e6f9ec' : '#fff',
              mb: 2,
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {booking.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Телефон: {booking.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Email: {booking.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Послуга: {services.find(s => s.value === booking.service)?.label || booking.service}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Дата: {isValidDate(booking.date) ? format(new Date(booking.date), 'dd MMMM yyyy', { locale: uk }) : booking.date}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Час: {booking.time}
              </Typography>
              {booking.notes && (
                <Typography variant="body2" color="text.secondary">
                  Примітки: {booking.notes}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Статус: {booking.status === 'accepted' ? 'Підтверджено' : 'Очікує підтвердження'}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              {booking.status !== 'accepted' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(booking)}
                  sx={{ mr: 1, borderRadius: '8px' }}
                >
                  Прийняти
                </Button>
              )}
              <IconButton
                onClick={() => handleEdit(booking)}
                sx={{ color: '#FF6B6B' }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(booking)}
                sx={{ color: '#FF6B6B' }}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Box>
      ))}
    </Grid>
  );

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setAddDialogOpen(true)}>
          Додати запис
        </Button>
      </Box>
      {/* Render the mobile view */}
      {renderMobileView()}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Видалити запис?</DialogTitle>
        <DialogContent>
          <Typography>Ви впевнені, що хочете видалити цей запис?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Скасувати
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Додати запис</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <TextField
            label="Ім'я"
            value={newBooking.name}
            onChange={e => setNewBooking({ ...newBooking, name: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Телефон"
            value={newBooking.phone}
            onChange={e => setNewBooking({ ...newBooking, phone: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            value={newBooking.email}
            onChange={e => setNewBooking({ ...newBooking, email: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Послуга"
            value={newBooking.service}
            onChange={e => setNewBooking({ ...newBooking, service: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
            <DatePicker
              label="Дата"
              value={newBooking.date}
              onChange={date => setNewBooking({ ...newBooking, date })}
              minDate={new Date()}
              slotProps={{ textField: { fullWidth: true, required: true, sx: { mb: 2 } } }}
            />
            <TimePicker
              label="Час"
              value={newBooking.time}
              onChange={time => setNewBooking({ ...newBooking, time })}
              slotProps={{ textField: { fullWidth: true, required: true, sx: { mb: 2 } } }}
            />
          </LocalizationProvider>
          <TextField
            label="Примітки"
            value={newBooking.notes}
            onChange={e => setNewBooking({ ...newBooking, notes: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Скасувати</Button>
          <Button onClick={handleAddBooking} variant="contained" color="primary">Додати</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!newBookingSnackbar?.open}
        autoHideDuration={5000}
        onClose={() => setNewBookingSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          Новий запис: {newBookingSnackbar?.name} ({newBookingSnackbar?.date})
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminPanel; 