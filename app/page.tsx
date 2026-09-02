'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Compass,
  DoorOpen,
  Eye,
  Grip,
  LocateFixed,
  Mail,
  MapPin,
  Menu,
  Minus,
  Move,
  Plus,
  Share2,
  Star,
  Users,
  X,
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
import { clampGuestCount, isTableAvailableForSlot } from '@/lib/booking';

type Language = 'EN' | 'AZ';
type ExperienceView = 'plan' | 'preview';

type RestaurantTable = {
  id: string;
  capacity: number;
  left: number;
  top: number;
  shape: 'round' | 'square' | 'long';
  zone: 'Window' | 'Terrace' | 'Quiet' | 'Bar' | 'Private';
  detail: string;
  baseAvailable: boolean;
};

const tables: RestaurantTable[] = [
  { id: 'T02', capacity: 2, left: 15, top: 19, shape: 'round', zone: 'Window', detail: 'Caspian light · intimate', baseAvailable: true },
  { id: 'T03', capacity: 4, left: 34, top: 19, shape: 'round', zone: 'Window', detail: 'Wide window · social', baseAvailable: true },
  { id: 'T06', capacity: 4, left: 63, top: 19, shape: 'square', zone: 'Terrace', detail: 'Open air · sunset side', baseAvailable: true },
  { id: 'T08', capacity: 2, left: 85, top: 23, shape: 'round', zone: 'Terrace', detail: 'Garden edge · soft light', baseAvailable: false },
  { id: 'T11', capacity: 4, left: 19, top: 58, shape: 'square', zone: 'Quiet', detail: 'Screened corner · low traffic', baseAvailable: true },
  { id: 'T14', capacity: 2, left: 42, top: 57, shape: 'round', zone: 'Window', detail: 'Window · quiet · best view', baseAvailable: true },
  { id: 'T16', capacity: 6, left: 68, top: 57, shape: 'long', zone: 'Bar', detail: 'Near the bar · lively', baseAvailable: true },
  { id: 'T17', capacity: 2, left: 87, top: 60, shape: 'round', zone: 'Private', detail: 'Stone screen · secluded', baseAvailable: true },
];

const times = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

const partnerTools = [
  { label: 'Move tables', icon: Move },
  { label: 'Add table', icon: Plus },
  { label: 'Set capacity', icon: Users },
  { label: 'Combine', icon: Grip },
  { label: 'Unavailable', icon: X },
  { label: 'Reservations', icon: CalendarDays },
];

const copy = {
  EN: {
    explore: 'Explore',
    partners: 'For restaurants',
    headline: 'Your table. Your view.',
    subhead: 'Discover restaurants in Baku and choose exactly where you want to sit.',
    promise: 'Know where you’ll sit before you arrive.',
    where: 'Where?',
    when: 'When?',
    guests: 'Guests?',
    find: 'Find a table',
    curated: 'Curated for tonight',
    choose: 'Choose your exact table',
    planHelp: 'Available tables change with your date, time, and party size.',
    see: 'See this table',
    reserve: 'Reserve this table',
    back: 'Back to floor plan',
    selected: 'Selected place',
    available: 'Available',
    unavailable: 'Unavailable',
    confirm: 'Confirm reservation',
  },
  AZ: {
    explore: 'Kəşf et',
    partners: 'Restoranlar üçün',
    headline: 'Sənin masan. Sənin mənzərən.',
    subhead: 'Bakıda restoranları kəşf et və harada oturmaq istədiyini dəqiq seç.',
    promise: 'Gəlməzdən əvvəl harada oturacağını bil.',
    where: 'Harada?',
    when: 'Nə vaxt?',
    guests: 'Qonaqlar?',
    find: 'Masa tap',
    curated: 'Bu axşam üçün seçim',
    choose: 'Masanı dəqiq seç',
    planHelp: 'Mövcud masalar tarix, saat və qonaq sayına görə dəyişir.',
    see: 'Bu masaya bax',
    reserve: 'Bu masanı rezerv et',
    back: 'Plana qayıt',
    selected: 'Seçilmiş yer',
    available: 'Mövcuddur',
    unavailable: 'Tutulub',
    confirm: 'Rezervasiyanı təsdiqlə',
  },
} as const;

const restaurants = [
  { name: 'Səki', area: 'İçərişəhər', cuisine: 'Modern Azerbaijani', price: '₼₼₼', tags: ['Quiet', 'Sea view', 'Date night'] },
  { name: 'Həyət', area: 'White City', cuisine: 'Seasonal grill', price: '₼₼', tags: ['Garden', 'Terrace', 'Groups'] },
  { name: 'Xəzri', area: 'Bayil', cuisine: 'Coastal kitchen', price: '₼₼₼', tags: ['Sea view', 'Private room', 'Sunset'] },
];

function OturLogo() {
  return (
    <a className="brand" href="#top" aria-label="OTUR home">
      <span className="brand-word" aria-hidden="true">
        <span className="logo-o"><i /><i /><i /><i /></span>
        <span>TUR</span>
      </span>
    </a>
  );
}

function TableGlyph({ table, small = false }: { table: RestaurantTable; small?: boolean }) {
  return (
    <span className={`table-glyph ${table.shape} ${small ? 'small' : ''}`} aria-hidden="true">
      {Array.from({ length: Math.min(table.capacity, 6) }).map((_, index) => (
        <i key={index} style={{ '--chair': index } as CSSProperties} />
      ))}
    </span>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('EN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [date, setDate] = useState('2026-09-04');
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState('T14');
  const [experienceView, setExperienceView] = useState<ExperienceView>('plan');
  const [planScale, setPlanScale] = useState(1);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [partnerMode, setPartnerMode] = useState('Move tables');

  const t = copy[language];
  const availability = useMemo(
    () => tables.map((table) => ({
      ...table,
      available: isTableAvailableForSlot(table, { date, time, guests }),
    })),
    [date, time, guests],
  );
  const selectedTable = availability.find((table) => table.id === selectedTableId) ?? availability[5];
  const availableCount = availability.filter((table) => table.available).length;

  function updateSlot(next: { date?: string; time?: string; guests?: number }) {
    if (next.date) setDate(next.date);
    if (next.time) setTime(next.time);
    if (next.guests) setGuests(next.guests);
    setExperienceView('plan');
  }

  function findTables() {
    document.getElementById('restaurant')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmed(true);
  }

  function openReservation() {
    setActionMessage('');
    setConfirmed(false);
    setReservationOpen(true);
  }

  return (
    <main id="top" className="site-shell">
      <header className="site-header">
        <OturLogo />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#discover">{t.explore}</a>
          <a href="#partners">{t.partners}</a>
        </nav>
        <div className="header-actions">
          <button className="language-switch" type="button" onClick={() => setLanguage(language === 'EN' ? 'AZ' : 'EN')} aria-label="Switch language">
            <span className={language === 'AZ' ? 'active' : ''}>AZ</span>
            <i />
            <span className={language === 'EN' ? 'active' : ''}>EN</span>
          </button>
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-label="Open navigation">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#discover" onClick={() => setMobileMenuOpen(false)}>{t.explore}</a>
            <a href="#restaurant" onClick={() => setMobileMenuOpen(false)}>{t.choose}</a>
            <a href="#partners" onClick={() => setMobileMenuOpen(false)}>{t.partners}</a>
          </nav>
        )}
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="overline">Bakı · masa seçiminin yeni yolu</span>
          <h1 id="hero-title">{t.headline}</h1>
          <p>{t.subhead}</p>
        </div>
        <p className="brand-promise"><CircleDot /> {t.promise}</p>
      </section>

      <section className="search-rail" aria-label="Search for a restaurant table">
        <label>
          <span><MapPin /> {t.where}</span>
          <strong>Baku, Azerbaijan</strong>
        </label>
        <label>
          <span><CalendarDays /> {t.when}</span>
          <Input type="date" value={date} min="2026-09-02" onChange={(event) => updateSlot({ date: event.target.value })} aria-label="Reservation date" />
        </label>
        <label>
          <span><Clock3 /> Time</span>
          <select value={time} onChange={(event) => updateSlot({ time: event.target.value })} aria-label="Reservation time">
            {times.map((slot) => <option key={slot}>{slot}</option>)}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
        <div className="guest-control">
          <span><Users /> {t.guests}</span>
          <div>
            <button type="button" onClick={() => updateSlot({ guests: clampGuestCount(guests, -1) })} aria-label="Remove a guest"><Minus /></button>
            <strong>{guests}</strong>
            <button type="button" onClick={() => updateSlot({ guests: clampGuestCount(guests, 1) })} aria-label="Add a guest"><Plus /></button>
          </div>
        </div>
        <Button className="primary-action" size="lg" onClick={findTables}>{t.find} <ArrowRight /></Button>
      </section>

      <section id="discover" className="discovery" aria-labelledby="discover-title">
        <div className="section-heading">
          <div>
            <span className="overline">03 places · handpicked</span>
            <h2 id="discover-title">{t.curated}</h2>
          </div>
          <button type="button" onClick={findTables}>View map <Compass /></button>
        </div>
        <div className="restaurant-list">
          {restaurants.map((restaurant, index) => (
            <button key={restaurant.name} type="button" className={`restaurant-row row-${index + 1}`} onClick={findTables}>
              <span className="restaurant-index">0{index + 1}</span>
              <span className="restaurant-image-wrap">
                {index === 0 ? <img src="/og.png" alt="Warm table setting at Səki" /> : <span className="material-swatch" />}
              </span>
              <span className="restaurant-main">
                <strong>{restaurant.name}</strong>
                <small>{restaurant.area} · {restaurant.cuisine} · {restaurant.price}</small>
              </span>
              <span className="restaurant-tags">
                {restaurant.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </span>
              <span className="restaurant-rating"><Star /> 4.{8 - index}</span>
              <ArrowRight className="row-arrow" />
            </button>
          ))}
        </div>
      </section>

      <section id="restaurant" className="restaurant-experience" aria-labelledby="restaurant-title">
        <header className="restaurant-header">
          <div>
            <span className="overline">Prototype restaurant · İçərişəhər</span>
            <h2 id="restaurant-title">Səki</h2>
            <p>Old-city stone, walnut, and a quietly contemporary Azerbaijani kitchen shaped around Caspian light.</p>
          </div>
          <dl className="restaurant-facts">
            <div><dt>Cuisine</dt><dd>Modern Azerbaijani</dd></div>
            <div><dt>Price</dt><dd>₼₼₼</dd></div>
            <div><dt>Hours</dt><dd>18:00 — 00:00</dd></div>
            <div><dt>Rating</dt><dd><Star /> 4.8</dd></div>
          </dl>
        </header>

        <div className={`experience-stage ${experienceView === 'preview' ? 'show-preview' : ''}`}>
          <section className="plan-side" aria-label="Interactive restaurant floor plan">
            <div className="plan-titlebar">
              <div>
                <span>Dining room · evening</span>
                <h3>{t.choose}</h3>
              </div>
              <div className="availability-key">
                <span><i className="key-available" /> {t.available}</span>
                <span><i className="key-unavailable" /> {t.unavailable}</span>
                <strong>{availableCount} tables</strong>
              </div>
            </div>

            <div className="plan-viewport">
              <div className="zoom-controls" aria-label="Floor plan zoom controls">
                <button type="button" onClick={() => setPlanScale(Math.max(.9, planScale - .1))} aria-label="Zoom out"><Minus /></button>
                <span>{Math.round(planScale * 100)}%</span>
                <button type="button" onClick={() => setPlanScale(Math.min(1.2, planScale + .1))} aria-label="Zoom in"><Plus /></button>
              </div>
              <div className="floorplan-canvas" style={{ transform: `scale(${planScale})` }}>
                <div className="wall wall-left" /><div className="wall wall-bottom" /><div className="window-line"><span>WINDOW · CASPIAN LIGHT</span></div>
                <div className="terrace-zone"><span>TERRACE</span></div>
                <div className="bar-zone"><span>BAR</span><i /><i /><i /></div>
                <div className="quiet-wall"><span>QUIET</span></div>
                <div className="entrance"><DoorOpen /><span>ENTRANCE</span></div>
                <div className="plant plant-one">✦</div><div className="plant plant-two">✦</div><div className="plant plant-three">✦</div>
                {availability.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    className={`floor-table ${table.available ? 'available' : 'unavailable'} ${selectedTableId === table.id ? 'selected' : ''}`}
                    style={{ left: `${table.left}%`, top: `${table.top}%` }}
                    disabled={!table.available}
                    onClick={() => {
                      setSelectedTableId(table.id);
                      setExperienceView('plan');
                    }}
                    aria-label={`${table.id.replace('T', 'Table ')}, ${table.capacity} seats, ${table.zone}, ${table.available ? 'available' : 'unavailable'}`}
                  >
                    <TableGlyph table={table} />
                    <span>{table.id.replace('T', '')}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="plan-help"><LocateFixed /> {t.planHelp}</p>
          </section>

          <aside className="table-context" aria-live="polite">
            <span className="context-kicker">{t.selected}</span>
            <div className="context-title">
              <h3>{selectedTable.id.replace('T', 'Table ')}</h3>
              <Badge className={selectedTable.available ? 'status-available' : 'status-unavailable'}>{selectedTable.available ? t.available : t.unavailable}</Badge>
            </div>
            <div className="context-glyph"><TableGlyph table={selectedTable} /><span>{selectedTable.capacity} seats</span></div>
            <ul>
              <li><Eye /> {selectedTable.zone}</li>
              <li><CircleDot /> {selectedTable.detail}</li>
              <li><Clock3 /> {time}</li>
              <li><Users /> {guests} guests</li>
            </ul>
            <Button className="see-table-button" disabled={!selectedTable.available} onClick={() => setExperienceView('preview')}>
              {t.see} <ArrowRight />
            </Button>
            <p>No card required · Free cancellation for 2 hours</p>
          </aside>

          <section className="spatial-preview" aria-label="View from the selected table">
            <img src="/og.png" alt={`Atmospheric view from ${selectedTable.id.replace('T', 'Table ')} at Səki`} />
            <div className="preview-wash" />
            <button className="preview-back" type="button" onClick={() => setExperienceView('plan')}><ArrowLeft /> {t.back}</button>
            <div className="preview-place-label">
              <span>{selectedTable.id.replace('T', 'Table ')}</span>
              <strong>{selectedTable.zone} · {selectedTable.detail}</strong>
            </div>
            <Button className="reserve-on-table" onClick={openReservation}>
              <small>Səki · {time}</small>
              <span>{t.reserve}</span>
            </Button>
            <div className="preview-orientation"><Compass /><span>Window</span></div>
          </section>
        </div>
      </section>

      <section id="partners" className="partner-section" aria-labelledby="partner-title">
        <div className="partner-copy">
          <span className="overline">OTUR for restaurants</span>
          <h2 id="partner-title">Your dining room,<br /><em>digitally.</em></h2>
          <p>Let guests understand your space before they arrive—and give your team one calm view of every table.</p>
          <Button>Bring OTUR to your restaurant <ArrowRight /></Button>
        </div>
        <div className="partner-product" aria-label="Restaurant floor plan management preview">
          <div className="partner-toolbar">
            <span>Səki · Floor plan</span>
            <Badge variant="outline">Tonight · 28 covers</Badge>
          </div>
          <div className="partner-workspace">
            <aside>
              {partnerTools.map(({ label, icon: Icon }) => (
                <button key={label} className={partnerMode === label ? 'active' : ''} type="button" onClick={() => setPartnerMode(label)}>
                  <Icon /> <span>{label}</span>
                </button>
              ))}
            </aside>
            <div className={`partner-plan mode-${partnerMode.toLowerCase().replace(' ', '-')}`}>
              <div className="partner-zone zone-a">INDOOR</div><div className="partner-zone zone-b">TERRACE</div>
              {[18, 38, 61, 78].map((left, index) => <button key={left} type="button" style={{ left: `${left}%`, top: `${index % 2 ? 58 : 31}%` }} aria-label={`Managed table ${index + 1}`}><span>{index + 1}</span></button>)}
              <output>{partnerMode}: ready</output>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <OturLogo />
        <p>Most apps help you choose a restaurant.<br />OTUR helps you choose your place inside it.</p>
        <span>Made thoughtfully in Bakı · 2026</span>
      </footer>

      <Dialog open={reservationOpen} onOpenChange={setReservationOpen}>
        <DialogContent className="reservation-sheet">
          {confirmed ? (
            <div className="confirmation">
              <span className="confirmation-mark"><Check /></span>
              <DialogHeader>
                <DialogTitle>{selectedTable.id.replace('T', 'Table ')} is yours.</DialogTitle>
                <DialogDescription>Friday · {time} · {guests} guests</DialogDescription>
              </DialogHeader>
              <div className="confirmation-plan" aria-label="Reserved table location thumbnail">
                <span className="mini-window">WINDOW</span>
                {availability.slice(0, 6).map((table) => (
                  <i key={table.id} className={table.id === selectedTable.id ? 'reserved' : ''} style={{ left: `${table.left}%`, top: `${table.top}%` }}>{table.id.replace('T', '')}</i>
                ))}
              </div>
              <p>We’ll send confirmation to your phone.</p>
              <div className="confirmation-actions">
                <Button variant="outline" onClick={() => setActionMessage('Calendar event prepared')}><CalendarPlus /> Add to calendar</Button>
                <Button variant="outline" onClick={() => setActionMessage('Directions opened')}><MapPin /> Directions</Button>
                <Button variant="outline" onClick={() => setActionMessage('Share link copied')}><Share2 /> Share</Button>
              </div>
              <output aria-live="polite">{actionMessage}</output>
              <Button className="done-button" onClick={() => setReservationOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <span className="sheet-kicker">No login · a few seconds</span>
                <DialogTitle>Reserve {selectedTable.id.replace('T', 'Table ')}</DialogTitle>
                <DialogDescription>Səki · {date} · {time} · {guests} guests · {selectedTable.zone}</DialogDescription>
              </DialogHeader>
              <div className="sheet-summary">
                <TableGlyph table={selectedTable} small />
                <span><small>Already selected</small><strong>{selectedTable.detail}</strong></span>
                <Check />
              </div>
              <form className="reservation-form" onSubmit={submitReservation}>
                <div><Label htmlFor="name">Name</Label><Input id="name" name="name" autoComplete="name" placeholder="Your full name" required /></div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="phone-field"><span>+994</span><Input id="phone" name="phone" inputMode="tel" autoComplete="tel" placeholder="50 000 00 00" required /></div>
                </div>
                <div><Label htmlFor="email">Email <small>optional</small></Label><div className="icon-field"><Mail /><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" /></div></div>
                <div><Label htmlFor="request">Special request <small>optional</small></Label><Input id="request" name="request" placeholder="Allergies, accessibility, celebration…" /></div>
                <Button className="confirm-button" size="lg" type="submit">{t.confirm} <ArrowRight /></Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
