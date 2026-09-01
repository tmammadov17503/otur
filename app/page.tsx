'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clampGuestCount, isTableSelectable } from '@/lib/booking';

type Table = {
  id: string;
  label: string;
  seats: number;
  left: number;
  top: number;
  shape: 'round' | 'long';
  available: boolean;
  note: string;
};

const tables: Table[] = [
  { id: 'T1', label: 'Terrace 01', seats: 2, left: 15, top: 21, shape: 'round', available: true, note: 'Quiet corner · city view' },
  { id: 'T2', label: 'Terrace 02', seats: 4, left: 39, top: 18, shape: 'round', available: false, note: 'Near the garden' },
  { id: 'T3', label: 'Terrace 03', seats: 4, left: 67, top: 22, shape: 'round', available: true, note: 'Open sky · garden side' },
  { id: 'T4', label: 'Terrace 04', seats: 2, left: 27, top: 55, shape: 'round', available: true, note: 'Best sunset view' },
  { id: 'T5', label: 'Terrace 05', seats: 6, left: 57, top: 56, shape: 'long', available: true, note: 'For a larger gathering' },
  { id: 'T6', label: 'Terrace 06', seats: 2, left: 83, top: 60, shape: 'round', available: false, note: 'Near the lounge' },
];

const restaurantTabs = ['Terrace', 'Main hall'];

function MasaLogo() {
  return (
    <a className="brand" href="#top" aria-label="Masa home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="brand-name">masa</span>
      <span className="brand-city">Bakı</span>
    </a>
  );
}

function SearchField({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <button className="search-field" type="button">
      <span className="search-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
      {children ?? <ChevronDown className="field-chevron" />}
    </button>
  );
}

export default function Home() {
  const [activeTableId, setActiveTableId] = useState('T4');
  const [activeRoom, setActiveRoom] = useState('Terrace');
  const [guests, setGuests] = useState(2);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [language, setLanguage] = useState<'AZ' | 'EN'>('EN');

  const activeTable = useMemo(
    () => tables.find((table) => table.id === activeTableId) ?? tables[3],
    [activeTableId],
  );

  function openReservation() {
    setIsConfirmed(false);
    setIsReserveOpen(true);
  }

  function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsConfirmed(true);
  }

  return (
    <main id="top" className="site-shell">
      <header className="site-header">
        <MasaLogo />
        <nav className="main-nav" aria-label="Main navigation">
          <a className="active" href="#restaurants">{language === 'EN' ? 'Restaurants' : 'Restoranlar'}</a>
          <a href="#how-it-works">{language === 'EN' ? 'How it works' : 'Necə işləyir'}</a>
          <a href="#partners">{language === 'EN' ? 'For restaurants' : 'Restoranlar üçün'}</a>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="language-toggle"
            onClick={() => setLanguage(language === 'EN' ? 'AZ' : 'EN')}
          >
            {language}
          </button>
          <Button className="partner-button" variant="outline">
            {language === 'EN' ? 'List your restaurant' : 'Restoranı əlavə et'}
          </Button>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div>
          <Badge className="eyebrow" variant="outline">
            <Sparkles /> {language === 'EN' ? 'A calmer way to book in Baku' : 'Bakıda rezervasiyanın sakit yolu'}
          </Badge>
          {language === 'EN' ? (
            <h1 id="page-title">Not just a restaurant.<br />Choose your <em>moment.</em></h1>
          ) : (
            <h1 id="page-title">Sadəcə restoran deyil.<br /><em>Anını</em> seç.</h1>
          )}
        </div>
        <p>
          {language === 'EN'
            ? 'See the room, choose the exact table you want, and reserve it in a few quiet taps.'
            : 'Məkanı gör, istədiyin masanı seç və bir neçə toxunuşla rezerv et.'}
        </p>
      </section>

      <section className="search-bar" aria-label="Find a table">
        <SearchField icon={<MapPin />} label="Location" value="Baku, Azerbaijan" />
        <SearchField icon={<CalendarDays />} label="Date" value="Fri, 4 September" />
        <SearchField icon={<Clock3 />} label="Time" value="19:30" />
        <SearchField icon={<Users />} label="Guests" value={`${guests} guests`}>
          <span className="guest-stepper">
            <span
              role="button"
              tabIndex={0}
              aria-label="Remove guest"
              onClick={(event) => {
                event.stopPropagation();
                setGuests(clampGuestCount(guests, -1));
              }}
            >
              <Minus />
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label="Add guest"
              onClick={(event) => {
                event.stopPropagation();
                setGuests(clampGuestCount(guests, 1));
              }}
            >
              <Plus />
            </span>
          </span>
        </SearchField>
        <Button className="find-button" size="lg">{language === 'EN' ? 'Find a table' : 'Masa tap'}</Button>
      </section>

      <section id="restaurants" className="booking-card" aria-label="Choose your table at Sahil">
        <aside className="venue-panel">
          <button className="back-link" type="button"><ArrowLeft /> All restaurants</button>
          <div className="venue-kicker">Featured tonight</div>
          <h2>Sahil</h2>
          <div className="venue-meta">
            <span><MapPin /> Neftçilər Avenue · 1.2 km</span>
            <span><Star className="star-icon" /> <strong>4.8</strong> (312)</span>
          </div>
          <p className="venue-description">Modern Azerbaijani cooking with Mediterranean lightness, tucked beside the boulevard.</p>

          <div className="room-tabs" role="tablist" aria-label="Restaurant area">
            {restaurantTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeRoom === tab}
                className={activeRoom === tab ? 'active' : ''}
                onClick={() => setActiveRoom(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="table-legend">
            <span><i className="available-dot" /> Available</span>
            <span><i className="taken-dot" /> Reserved</span>
          </div>

          <div className="floor-plan" aria-label={`${activeRoom} floor plan`}>
            <div className="plan-label north">Boulevard view</div>
            <div className="plan-label garden">Olive garden</div>
            <div className="plan-service">service</div>
            {activeRoom === 'Terrace' ? (
              tables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  aria-label={`${table.label}, ${table.seats} seats${table.available ? '' : ', reserved'}`}
                  disabled={!isTableSelectable(table)}
                  className={`table-node ${table.shape} ${table.available ? 'available' : 'taken'} ${activeTableId === table.id ? 'selected' : ''}`}
                  style={{ left: `${table.left}%`, top: `${table.top}%` }}
                  onClick={() => setActiveTableId(table.id)}
                >
                  <span>{table.id.slice(1)}</span>
                  <small>{table.seats}</small>
                </button>
              ))
            ) : (
              <div className="room-notice">
                <span>Indoor plan</span>
                <p>The main hall opens for bookings at 20:30.</p>
              </div>
            )}
          </div>
          <p className="plan-hint"><LocateFixed /> Tap an available table to preview its view.</p>
        </aside>

        <article className="preview-panel">
          <div className="preview-toolbar">
            <span>Table view</span>
            <Badge className="live-badge">Live preview</Badge>
          </div>

          <div className="scene-placeholder">
            <img
              className="scene-photo"
              src="/og.png"
              alt="Golden-hour terrace view from the selected table at Sahil"
            />
            <Button className="table-reserve-pin" size="sm" onClick={openReservation}>
              Reserve {activeTable.id}
            </Button>
            <div className="view-angle" aria-hidden="true">01 / 03</div>
          </div>

          <div className="selection-card">
            <div className="selection-heading">
              <div>
                <span className="selection-overline">Your selection</span>
                <h3>{activeTable.label}</h3>
                <p>{activeTable.note}</p>
              </div>
              <span className="seat-chip"><Users /> {activeTable.seats}</span>
            </div>
            <div className="booking-summary">
              <span><small>Date</small><strong>Fri, 4 Sep</strong></span>
              <span><small>Time</small><strong>19:30</strong></span>
              <span><small>Guests</small><strong>{guests} people</strong></span>
            </div>
            <Button className="reserve-button" size="lg" onClick={openReservation}>
              {language === 'EN' ? 'Reserve this table' : 'Bu masanı rezerv et'} <span>→</span>
            </Button>
            <p className="reserve-note">Free cancellation until 17:30 · No card required</p>
          </div>
        </article>
      </section>

      <section id="how-it-works" className="how-section" aria-labelledby="how-title">
        <div className="section-intro">
          <span>01 — 03</span>
          <h2 id="how-title">From looking<br />to <em>seated.</em></h2>
          <p>No calls, no “somewhere by the window” requests. You know exactly where the evening begins.</p>
        </div>
        <div className="steps-grid">
          <article>
            <span className="step-number">01</span>
            <MapPin />
            <h3>Find the mood</h3>
            <p>Explore a calm, curated collection of Baku restaurants by district, cuisine, and occasion.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <LocateFixed />
            <h3>Pick your table</h3>
            <p>See the floor plan, availability, view, and real atmosphere before you decide.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <Check />
            <h3>Arrive relaxed</h3>
            <p>Reserve without an account or card, then receive your table details instantly.</p>
          </article>
        </div>
      </section>

      <section id="partners" className="partner-cta">
        <div>
          <span>For Baku restaurants</span>
          <h2>Turn your floor plan<br />into your best host.</h2>
        </div>
        <div>
          <p>Give guests confidence before they arrive and make every table easier to discover.</p>
          <Button variant="secondary">Join the early partner list <span>→</span></Button>
        </div>
      </section>

      <footer className="mini-footer">
        <span>Curated in Baku</span>
        <span>Good tables. Beautiful moments.</span>
      </footer>

      <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
        <DialogContent className="reservation-dialog">
          {isConfirmed ? (
            <div className="confirmation-state">
              <span className="confirmation-icon"><Check /></span>
              <DialogHeader>
                <DialogTitle>Table held for you</DialogTitle>
                <DialogDescription>
                  {activeTable.label} at Sahil · Friday, 4 September at 19:30
                </DialogDescription>
              </DialogHeader>
              <p>We sent the reservation details to your phone. See you by the boulevard.</p>
              <Button onClick={() => setIsReserveOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <span className="dialog-kicker">One last step</span>
                <DialogTitle>Reserve {activeTable.label}</DialogTitle>
                <DialogDescription>Sahil · Fri, 4 Sep · 19:30 · {guests} guests</DialogDescription>
              </DialogHeader>
              <form className="reservation-form" onSubmit={submitReservation}>
                <div>
                  <Label htmlFor="guest-name">Full name</Label>
                  <Input id="guest-name" name="name" placeholder="Your name" required />
                </div>
                <div>
                  <Label htmlFor="guest-phone">Phone number</Label>
                  <Input id="guest-phone" name="phone" type="tel" placeholder="+994 50 000 00 00" required />
                </div>
                <div>
                  <Label htmlFor="guest-note">A note for the restaurant</Label>
                  <Input id="guest-note" name="note" placeholder="Birthday, accessibility, allergies…" />
                </div>
                <Button type="submit" className="reserve-button" size="lg">Confirm reservation</Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
