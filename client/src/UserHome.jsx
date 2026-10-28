import { useEffect, useMemo, useState } from 'react';
import api from './api.js';
import { useAuth } from './AuthContext.jsx';

const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85';
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const currency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

export default function UserHome() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [stay, setStay] = useState({ fromdate: today, todate: tomorrow, type: 'all' });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recommended');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', fromdate: today, todate: tomorrow });
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState(() => { try { return JSON.parse(localStorage.getItem(user ? 'hotelproAccountBookings' : 'hotelproBookings') || '[]'); } catch { return []; } });
  const [cancelling, setCancelling] = useState('');

  async function loadRooms() {
    setLoading(true);
    try { const { data } = await api.get('/api/rooms'); setRooms(data); setNotice(''); }
    catch { setNotice('We couldn’t reach the booking service. Please try again in a moment.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadRooms(); }, []);
  useEffect(() => {
    if (!user) { try { setBookings(JSON.parse(localStorage.getItem('hotelproBookings') || '[]')); } catch { setBookings([]); } return; }
    api.get('/api/bookings/mybookings').then(({ data }) => { setBookings(data); localStorage.setItem('hotelproAccountBookings', JSON.stringify(data)); }).catch(() => {});
  }, [user]);
  const visibleRooms = useMemo(() => {
    let result = rooms.filter(room => (stay.type === 'all' || room.type === stay.type) && `${room.roomNumber} ${room.type} ${room.description}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'price-low') result = [...result].sort((a, b) => a.rent - b.rent);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.rent - a.rent);
    return result;
  }, [rooms, stay.type, query, sort]);

  function updateBookings(next) { setBookings(next); localStorage.setItem(user ? 'hotelproAccountBookings' : 'hotelproBookings', JSON.stringify(next)); }
  async function book(event) {
    event.preventDefault(); setSubmitting(true); setNotice('');
    try {
      const { data } = await api.post('/api/bookings/bookroom', { room_id: selected._id, ...form });
      updateBookings([data, ...bookings]); setSelected(null); setNotice(`You’re all set, ${data.name}. Your booking is confirmed.`);
    } catch (error) { setNotice(error.response?.data?.message || 'We couldn’t complete your booking. Please try again.'); }
    finally { setSubmitting(false); }
  }
  async function cancelBooking(booking) {
    setCancelling(booking._id);
    try { await api.post('/api/bookings/cancelbooking', { bookingId: booking._id }); updateBookings(bookings.map(item => item._id === booking._id ? { ...item, status: 'cancelled' } : item)); }
    catch (error) { setNotice(error.response?.data?.message || 'We couldn’t cancel that booking. Please try again.'); }
    finally { setCancelling(''); }
  }
  function chooseRoom(room) { setSelected(room); setForm({ name: user?.name || '', fromdate: stay.fromdate, todate: stay.todate }); }

  return <>
    <main>
      <section className="stay-hero">
        <div className="stay-hero-image" />
        <div className="container hero-content">
          <span className="eyebrow hero-eyebrow"><span className="eyebrow-dot"/> THOUGHTFUL STAYS, BEAUTIFULLY SIMPLE</span>
          <h1>Make room for<br/><em>something special.</em></h1>
          <p>Considered comfort. Effortless booking. Your next great stay starts here.</p>
          <a href="#stays" className="hero-link">Explore our rooms <span>↘</span></a>
        </div>
        <div className="container search-shell"><form className="stay-search" onSubmit={event => { event.preventDefault(); document.querySelector('#stays')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <label className="search-field"><span>CHECK IN</span><input type="date" min={today} value={stay.fromdate} onChange={event => setStay({ ...stay, fromdate: event.target.value, todate: stay.todate <= event.target.value ? new Date(new Date(event.target.value).getTime() + 86400000).toISOString().slice(0, 10) : stay.todate })}/></label>
          <label className="search-field"><span>CHECK OUT</span><input type="date" min={stay.fromdate || today} value={stay.todate} onChange={event => setStay({ ...stay, todate: event.target.value })}/></label>
          <label className="search-field"><span>ROOM STYLE</span><select value={stay.type} onChange={event => setStay({ ...stay, type: event.target.value })}><option value="all">All room styles</option><option value="single">Single</option><option value="double">Double</option><option value="suite">Suite</option></select></label>
          <button className="button button-dark search-button">Find a stay <span>↗</span></button>
        </form></div>
      </section>

      <section className="section rooms-section" id="stays"><div className="container">
        <div className="section-heading"><div><span className="eyebrow">YOUR STAY, YOUR WAY</span><h2>Rooms with <em>room to breathe.</em></h2><p>Find a place to slow down, settle in, and feel at home.</p></div><span className="room-count">{rooms.length.toString().padStart(2, '0')} curated rooms</span></div>
        {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={loadRooms} aria-label="Retry loading">↻</button></div>}
        <div className="room-toolbar"><label className="room-search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search rooms" aria-label="Search rooms"/></label><label className="sort-control"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
        {loading ? <div className="room-grid">{[1, 2, 3].map(item => <div className="room-skeleton" key={item}><div/><span/><span/></div>)}</div> : visibleRooms.length ? <div className="room-grid">{visibleRooms.map((room, index) => <article className="room-card" key={room._id}>
          <div className="room-photo-wrap"><img className="room-photo" src={room.photos?.[0] || fallbackImage} alt={`${room.type} room ${room.roomNumber}`} loading="lazy" onError={event => { event.currentTarget.src = fallbackImage; }}/><span className="room-tag">{room.type}</span><span className="room-number">NO. {room.roomNumber}</span></div>
          <div className="room-card-body"><div className="room-card-title"><h3>{room.type === 'suite' ? 'The Suite' : room.type === 'double' ? 'The Double' : 'The Single'}</h3><span className="room-capacity">⌂ &nbsp;{room.type === 'single' ? '1–2' : '2–4'} guests</span></div><p>{room.description || 'A calm, considered space designed for a restorative stay.'}</p><div className="room-card-bottom"><div><strong>{currency(room.rent)}</strong><span> / night</span></div><button className="button button-outline" onClick={() => chooseRoom(room)}>View & book <span>↗</span></button></div></div>
        </article>)}</div> : <div className="empty-state"><span className="empty-mark">⌂</span><h3>{rooms.length ? 'No rooms match just yet.' : 'A little quiet before the welcome.'}</h3><p>{rooms.length ? 'Try a different room style or search.' : 'Our team is preparing the rooms. Check back soon, or visit management to add a room.'}</p>{rooms.length > 0 && <button className="button button-outline" onClick={() => { setStay({ ...stay, type: 'all' }); setQuery(''); }}>Clear filters</button>}</div>}
      </div></section>

      <section className="section booking-section" id="my-bookings"><div className="container booking-layout"><div className="booking-intro"><span className="eyebrow">A LITTLE SOMETHING TO LOOK FORWARD TO</span><h2>Your stays,<br/><em>all in one place.</em></h2><p>Bookings made on this device show up here. No account needed.</p></div><div className="booking-list">{bookings.length ? bookings.slice(0, 5).map(booking => <article className="booking-row" key={booking._id}><div className="booking-date"><span>{new Date(booking.fromdate).toLocaleDateString('en', { month: 'short' }).toUpperCase()}</span><b>{new Date(booking.fromdate).getDate()}</b></div><div className="booking-detail"><strong>{booking.name || 'Guest stay'}</strong><span>{new Date(booking.fromdate).toLocaleDateString()} — {new Date(booking.todate).toLocaleDateString()}</span></div><div className="booking-total"><strong>{currency(booking.totalAmount)}</strong><span className={`status-pill ${booking.status}`}>{booking.status}</span></div>{booking.status === 'active' && <button className="cancel-link" disabled={cancelling === booking._id} onClick={() => cancelBooking(booking)}>{cancelling === booking._id ? 'Cancelling…' : 'Cancel'}</button>}</article>) : <div className="booking-empty"><span>✳</span><p>Your next getaway will look good here.</p><a href="#stays">Find your stay ↗</a></div>}</div></div></section>
      <section className="closing-banner"><div className="container closing-inner"><span className="eyebrow">A BETTER WAY TO GET AWAY</span><h2>Good nights make<br/><em>great mornings.</em></h2><a href="#stays" className="button button-light">Find your room <span>↗</span></a></div></section>
    </main>

    {selected && <div className="modal-backdrop-custom" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><form className="booking-modal" onSubmit={book}><button type="button" className="modal-close" aria-label="Close" onClick={() => setSelected(null)}>×</button><span className="eyebrow">A FEW DETAILS, THEN IT’S YOURS</span><h2>Book <em>room {selected.roomNumber}.</em></h2><div className="modal-price">{currency(selected.rent)} <span>/ night · no account needed</span></div><label className="form-field">YOUR NAME<input autoFocus required maxLength="80" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="How should we welcome you?"/></label><div className="modal-dates"><label className="form-field">CHECK IN<input type="date" required min={today} value={form.fromdate} onChange={event => setForm({ ...form, fromdate: event.target.value, todate: form.todate <= event.target.value ? new Date(new Date(event.target.value).getTime() + 86400000).toISOString().slice(0, 10) : form.todate })}/></label><label className="form-field">CHECK OUT<input type="date" required min={form.fromdate || today} value={form.todate} onChange={event => setForm({ ...form, todate: event.target.value })}/></label></div>{form.fromdate && form.todate && form.todate > form.fromdate && <div className="price-estimate"><span>{Math.ceil((new Date(form.todate) - new Date(form.fromdate)) / 86400000)} nights · estimated total</span><b>{currency(Math.ceil((new Date(form.todate) - new Date(form.fromdate)) / 86400000) * selected.rent)}</b></div>}<button className="button button-dark modal-submit" disabled={submitting}>{submitting ? 'Securing your stay…' : 'Confirm your stay'} <span>↗</span></button><p className="modal-note">You’ll receive your booking details on this device.</p></form></div>}
  </>;
}
