'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, CircleDot, Clock3, Compass,
  Eye, FileUp, Grip, Heart, Layers3, MapPin, Menu, Minus, Move, Plus, Search, Sparkles,
  Star, Tags, Users, X,
} from 'lucide-react';

import { BookingDialog } from '@/components/otur/booking-dialog';
import { DepthSurface } from '@/components/otur/depth-surface';
import { DiningAccent } from '@/components/otur/dining-accent';
import { DiningScatter } from '@/components/otur/dining-scatter';
import { FloorPlan } from '@/components/otur/floor-plan';
import { PartnerDialog } from '@/components/otur/partner-dialog';
import { TableGlyph } from '@/components/otur/table-glyph';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clampGuestCount, filterRestaurants, getFirstAvailableTableId, isTableAvailableForSlot } from '@/lib/booking';
import { assetUrl } from '@/lib/assets';
import { diningCopy } from '@/lib/dining-copy';
import { FAVORITES_KEY, getBakuDate, parseFavorites, parseSharedPlan, recommendTable, toggleFavorite } from '@/lib/dining-plans';
import { copy, localize, localizeTag, quickFilters, restaurants, times, type Language } from '@/lib/otur-data';

type ExperienceView = 'plan' | 'preview';

const filterTagMap: Record<string, string | null> = {
  Tonight: null, Terrace: 'terrace', 'Sea view': 'sea', 'Date night': 'date',
  Quiet: 'quiet', Traditional: 'traditional', New: 'new',
};

const partnerToolKeys = [
  { key: 'moveTables', icon: Move }, { key: 'addTable', icon: Plus },
  { key: 'resizeTables', icon: Grip }, { key: 'setCapacity', icon: Users },
  { key: 'unavailable', icon: X }, { key: 'combine', icon: Layers3 },
  { key: 'assignTags', icon: Tags }, { key: 'defineZones', icon: Sparkles },
  { key: 'reservations', icon: CalendarDays },
];

function OturLogo() {
  return <a className="brand" href="#top" aria-label="OTUR home"><span className="brand-word" aria-hidden="true"><span className="logo-o"><i /><i /><i /><i /></span><span>TUR</span></span></a>;
}

function SceneImage({ src, scene = 0, className = '', label }: { src: string; scene?: number; className?: string; label: string }) {
  return <div className={`scene-image scene-${scene} ${className}`} style={{ backgroundImage: `url(${assetUrl(src, import.meta.env.BASE_URL)})` }}><span className="sr-only">{label}</span></div>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('EN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [date, setDate] = useState(() => getBakuDate());
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState(2);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tonight');
  const [restaurantId, setRestaurantId] = useState<'seki' | 'hayat' | 'xazri'>('seki');
  const [selectedTableId, setSelectedTableId] = useState('S03');
  const [experienceView, setExperienceView] = useState<ExperienceView>('plan');
  const [transitioning, setTransitioning] = useState(false);
  const [planScale, setPlanScale] = useState(1);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerMode, setPartnerMode] = useState('moveTables');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [seatPreference, setSeatPreference] = useState('any');
  const [suggestionStatus, setSuggestionStatus] = useState<'matched' | 'empty' | null>(null);
  const [suggestionKey, setSuggestionKey] = useState('');
  const currentSuggestionKey = `${restaurantId}|${date}|${time}|${guests}|${seatPreference}`;

  const t = { ...copy[language], ...diningCopy[language] };
  const labels = t as unknown as Record<string, string>;
  const restaurant = restaurants.find((item) => item.id === restaurantId) ?? restaurants[0];
  const slot = useMemo(() => ({ restaurantId, date, time, guests }), [restaurantId, date, time, guests]);
  const availability = useMemo(() => restaurant.tables.map((table) => ({
    ...table, available: isTableAvailableForSlot(table, slot),
  })), [restaurant, slot]);
  const selectedTable = availability.find((table) => table.id === selectedTableId && table.available) ?? availability.find((table) => table.available) ?? availability[0];
  const availableCount = availability.filter((table) => table.available).length;

  const localizedSearchRecords = useMemo(() => restaurants.map((item) => ({
    ...item,
    area: localize(item.area, language), cuisine: localize(item.cuisine, language),
    description: localize(item.description, language), tags: item.tags.map((tag) => localizeTag(tag, language)),
  })), [language]);
  const activeFilterValue = filterTagMap[activeFilter];
  const activeFilterLabel = activeFilterValue ? localizeTag(activeFilterValue, language) : '';
  const filteredIds = new Set<string>(filterRestaurants(localizedSearchRecords, query, activeFilterLabel).map((item: { id: string }) => item.id));
  const visibleRestaurants = restaurants.filter((item) => filteredIds.has(item.id) && (!savedOnly || favorites.includes(item.id)));

  useEffect(() => { document.documentElement.lang = language.toLowerCase(); }, [language]);
  useEffect(() => {
    // Restore browser-only state after hydration; cancel if the page unmounts first.
    const frame = window.requestAnimationFrame(() => {
      try { setFavorites(parseFavorites(localStorage.getItem(FAVORITES_KEY))); }
      catch { setStorageUnavailable(true); }
      const shared = parseSharedPlan(window.location.search, restaurants, times, getBakuDate());
      if (shared) {
        setRestaurantId(shared.restaurantId as typeof restaurantId);
        setSelectedTableId(shared.tableId);
        setDate(shared.date);
        setTime(shared.time);
        setGuests(shared.guests);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function saveRestaurant(id: string) {
    const next = toggleFavorite(favorites, id);
    setFavorites(next);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); }
    catch { setStorageUnavailable(true); }
  }

  function suggestSeat() {
    const match = recommendTable(availability, guests, seatPreference);
    setSuggestionKey(currentSuggestionKey);
    setSuggestionStatus(match ? 'matched' : 'empty');
    if (!match) return;
    setSelectedTableId(match.id);
    setExperienceView('plan');
    const viewport = document.querySelector<HTMLElement>('.plan-viewport');
    const canvas = document.querySelector<HTMLElement>('.floorplan-canvas');
    if (viewport && canvas) viewport.scrollTo({ left: canvas.offsetWidth * match.left / 100 - viewport.clientWidth / 2, behavior: 'instant' });
  }
  function availableTimesFor(targetId: string) {
    const target = restaurants.find((item) => item.id === targetId) ?? restaurants[0];
    return times.filter((candidate) => target.tables.some((table) => isTableAvailableForSlot(table, {
      restaurantId: target.id, date, time: candidate, guests,
    }))).slice(1, 4);
  }

  function findTables() {
    setSearchPerformed(true);
    window.setTimeout(() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  }

  function selectRestaurant(nextId: 'seki' | 'hayat' | 'xazri') {
    const next = restaurants.find((item) => item.id === nextId) ?? restaurants[0];
    const nextSlot = { restaurantId: next.id, date, time, guests };
    setRestaurantId(nextId);
    setSelectedTableId(getFirstAvailableTableId(next.tables, nextSlot) ?? next.tables[0].id);
    setExperienceView('plan');
    setPlanScale(1);
    window.setTimeout(() => document.getElementById('restaurant')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  }

  function seeSelectedTable() {
    if (!selectedTable.available) return;
    setTransitioning(true);
    window.setTimeout(() => { setExperienceView('preview'); setTransitioning(false); }, 460);
  }

  function filterLabel(filter: string) {
    if (filter === 'Tonight') return t.tonight;
    const tag = filterTagMap[filter];
    return tag ? localizeTag(tag, language) : filter;
  }

  return (
    <main id="top" className="site-shell">
      <header className="site-header">
        <OturLogo />
        <nav className="desktop-nav" aria-label={t.explore}><a href="#discover">{t.explore}</a><a href="#partners">{t.partners}</a></nav>
        <div className="header-actions">
          <div className="language-switch" aria-label="AZ · EN · RU">{(['AZ', 'EN', 'RU'] as Language[]).map((item) => <button key={item} type="button" className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}>{item}</button>)}</div>
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen} aria-label={t.explore}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileMenuOpen && <nav className="mobile-nav" aria-label={t.explore}><a href="#discover" onClick={() => setMobileMenuOpen(false)}>{t.explore}</a><a href="#restaurant" onClick={() => setMobileMenuOpen(false)}>{t.choose}</a><a href="#partners" onClick={() => setMobileMenuOpen(false)}>{t.partners}</a></nav>}
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="dining-accent" aria-hidden="true"><Image src={assetUrl('/dining-cutlery.png', import.meta.env.BASE_URL)} alt="" width={1254} height={1254} sizes="(max-width: 760px) 220px, 400px" /></div>
        <div className="hero-copy"><span className="overline">{t.overline}</span><h1 id="hero-title">{t.headline}</h1><p>{t.subhead}</p><p className="brand-promise"><CircleDot />{t.promise}</p></div>
        <DepthSurface><div className="hero-model" aria-label={t.promise}><Image src={assetUrl('/og.webp', import.meta.env.BASE_URL)} alt={t.promise} fill priority sizes="(max-width: 760px) 100vw, 55vw" /><div className="hero-model-wash" /><div className="hero-sequence"><span className="active">01 · {t.heroStep1}</span><span>02 · {t.heroStep2}</span><span>03 · {t.heroStep3}</span></div><div className="hero-table-marker"><i /><strong>08</strong><small>{t.selected}</small></div></div></DepthSurface>
      </section>

      <section className="search-rail" aria-label={t.find}>
        <label><span><MapPin />{t.where}</span><strong>Baku, Azerbaijan</strong></label>
        <label><span><CalendarDays />{t.when}</span><Input type="date" value={date} min={getBakuDate()} onChange={(event) => { if (event.target.value >= getBakuDate()) setDate(event.target.value); }} aria-label={t.when} /></label>
        <label><span><Clock3 />{t.time}</span><select value={time} onChange={(event) => setTime(event.target.value)} aria-label={t.time}>{times.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown aria-hidden="true" /></label>
        <div className="guest-control"><span><Users />{t.guests}</span><div><button type="button" onClick={() => setGuests(clampGuestCount(guests, -1))} aria-label={`${t.guests} −`}><Minus /></button><strong>{guests}</strong><button type="button" onClick={() => setGuests(clampGuestCount(guests, 1))} aria-label={`${t.guests} +`}><Plus /></button></div></div>
        <Button className="primary-action" size="lg" onClick={findTables}>{t.find}<ArrowRight /></Button>
      </section>

      <section id="discover" className={`discovery ${searchPerformed ? 'search-active' : ''}`} aria-labelledby="discover-title">
        <DiningScatter variant="discovery" />
        <DiningAccent kind="plates" />
        <DiningAccent kind="cutlery" />
        <div className="section-heading"><div><span className="overline">03 · BAKU</span><h2 id="discover-title">{t.discoveryTitle}</h2><p>{t.discoveryIntro}</p></div><span className="result-context"><CalendarDays />{date} · {time} · {guests}</span></div>
        <div className="restaurant-search"><div className="search-input"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} /></div><div className="quick-filters">{quickFilters.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filterLabel(filter)}</button>)}</div></div>
        <div className="shortlist-bar"><button className="saved-filter" type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}><Heart />{t.savedOnly}<span>{favorites.length}</span></button><output>{storageUnavailable ? t.storageFallback : t.savedHere}</output></div>
        {visibleRestaurants.length ? <div className="restaurant-grid">{visibleRestaurants.map((item, index) => (
          <article className="restaurant-card" key={item.id}>
            <button className="save-restaurant" type="button" aria-pressed={favorites.includes(item.id)} aria-label={`${favorites.includes(item.id) ? t.removeSaved : t.saveRestaurant} · ${item.name}`} onClick={() => saveRestaurant(item.id)}><Heart /></button>
            <button type="button" className="restaurant-photo" onClick={() => selectRestaurant(item.id)}><SceneImage src={item.image} scene={0} label={`${item.name} · ${localize(item.atmosphere, language)}`} /><span className="card-index">0{index + 1}</span><span className="card-rating"><Star />{item.rating}</span></button>
            <div className="restaurant-card-body"><div><span className="card-area"><MapPin />{localize(item.area, language)}</span><h3>{item.name}</h3><p>{localize(item.description, language)}</p></div><div className="card-meta"><span>{localize(item.cuisine, language)}</span><span>{item.price}</span></div><div className="card-tags">{item.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="outline">{localizeTag(tag, language)}</Badge>)}</div><div className="availability-preview"><small>{t.availableAt}</small><div>{availableTimesFor(item.id).map((candidate) => <button key={candidate} type="button" onClick={() => { setTime(candidate); selectRestaurant(item.id); }}>{candidate}</button>)}</div></div><Button type="button" variant="outline" className="view-restaurant" onClick={() => selectRestaurant(item.id)}>{t.viewRestaurant}<ArrowRight /></Button></div>
          </article>
        ))}</div> : <div className="empty-results"><Compass /><p>{t.noResults}</p><Button type="button" variant="outline" onClick={() => { setQuery(''); setActiveFilter('Tonight'); setSavedOnly(false); }}>{t.clearSearch}</Button></div>}
      </section>

      <section id="restaurant" className="restaurant-experience" aria-labelledby="restaurant-title">
        <DiningScatter variant="experience" />
        <header className="restaurant-header"><div><button type="button" className="change-restaurant" onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}><ArrowLeft />{t.changeRestaurant}</button><span className="overline">{localize(restaurant.atmosphere, language)}</span><h2 id="restaurant-title">{restaurant.name}</h2><p>{localize(restaurant.description, language)}</p></div><dl className="restaurant-facts"><div><dt>{t.cuisine}</dt><dd>{localize(restaurant.cuisine, language)}</dd></div><div><dt>{t.price}</dt><dd>{restaurant.price}</dd></div><div><dt>{t.hours}</dt><dd>{restaurant.hours}</dd></div><div><dt>{t.rating}</dt><dd><Star />{restaurant.rating}</dd></div></dl></header>
        <div className={`experience-stage ${experienceView === 'preview' ? 'show-preview' : ''} ${transitioning ? 'zooming' : ''}`}>
          <section className="plan-side" aria-label={t.choose}>
            <div className="plan-titlebar"><div><span>{restaurant.name} · {t.floorEvening}</span><h3>{t.choose}</h3></div><div className="availability-key"><span><i className="key-available" />{t.available}</span><span><i className="key-reserved" />{t.reserved}</span><span><i className="key-selected" />{t.selected}</span><strong>{availableCount} {t.tables}</strong></div></div>
            <div className="seat-finder"><label htmlFor="seat-preference"><Sparkles />{t.seatPreference}</label><select id="seat-preference" value={seatPreference} onChange={(event) => setSeatPreference(event.target.value)}><option value="any">{t.anySeat}</option>{['window', 'quiet', 'terrace', 'sea', 'private'].map((tag) => <option key={tag} value={tag}>{localizeTag(tag, language)}</option>)}</select><Button variant="outline" type="button" onClick={suggestSeat}>{t.suggestSeat}<ArrowRight /></Button></div>
            {suggestionStatus && suggestionKey === currentSuggestionKey && <output className="seat-feedback">{suggestionStatus === 'matched' ? `${selectedTable.id} · ${t.matchNote}` : t.noMatch}</output>}
            <FloorPlan restaurant={restaurant} tables={availability} selectedId={selectedTable.available ? selectedTable.id : ''} language={language} labels={labels} scale={planScale} onScale={setPlanScale} onSelect={(id) => { setSelectedTableId(id); setSuggestionStatus(null); setExperienceView('plan'); }} /><p className="plan-help"><CircleDot />{t.planHelp}</p>
          </section>
          <aside className="table-context"><span className="context-kicker">{t.whyThis}</span><div className="context-title"><h3>{selectedTable.available ? selectedTable.id : '—'}</h3>{selectedTable.available && <Badge className="status-available"><Check />{t.available}</Badge>}</div><div className="context-glyph"><TableGlyph table={selectedTable} /><span>{selectedTable.capacity} {t.seats} · {time}</span></div><p className="table-detail">{selectedTable.available ? localize(selectedTable.detail, language) : t.noAvailable}</p><div className="context-tags">{selectedTable.available && selectedTable.tags.slice(0, 3).map((tag) => <span key={tag}>{localizeTag(tag, language)}</span>)}</div><Button className="see-table-button" disabled={!selectedTable.available} onClick={seeSelectedTable}>{t.see}<Eye /></Button></aside>
          <section className="spatial-preview" aria-label={t.previewHint}><SceneImage src={restaurant.image} scene={selectedTable.scene} className="preview-scene" label={`${restaurant.name} ${selectedTable.id}`} /><div className="preview-wash" /><button className="preview-back" type="button" onClick={() => setExperienceView('plan')}><ArrowLeft />{t.back}</button><div className="preview-place-label"><span>{restaurant.name} · {selectedTable.id}</span><strong>{selectedTable.available ? selectedTable.tags.map((tag) => localizeTag(tag, language)).join(' · ') : t.noAvailable}</strong></div><Button className="reserve-on-table" disabled={!selectedTable.available} onClick={() => setReservationOpen(true)}><small>{selectedTable.id} · {time} · {guests} {t.seats}</small><span>{t.reserve}</span></Button><span className="preview-orientation"><Eye />{t.previewHint}</span></section>
        </div>
        <div className="restaurant-gallery"><div className="gallery-copy"><span className="overline">{restaurant.name} · 04</span><h3>{t.gallery}</h3><p>{t.galleryIntro}</p></div>{[0, 1, 2, 3].map((scene) => <SceneImage key={scene} src={restaurant.image} scene={scene} label={`${restaurant.name} · ${t.gallery}`} />)}</div>
      </section>

      <section id="partners" className="partner-section">
        <DiningScatter variant="partners" />
        <DiningAccent kind="room" />
        <div className="partner-copy"><span className="overline">{t.partnerOverline}</span><h2>{t.partnerHeadlineA}<br /><em>{t.partnerHeadlineB}</em></h2><p>{t.partnerCopy}</p><Button onClick={() => setPartnerOpen(true)}>{t.bringOtur}<ArrowRight /></Button><div className="no-plan-card"><FileUp /><div><strong>{t.noPlan}</strong><p>{t.noPlanCopy}</p><button type="button" onClick={() => setPartnerOpen(true)}>{t.sendPlan}</button></div></div></div>
        <div className="partner-product"><div className="partner-toolbar"><strong>{t.partnerTools}</strong><Badge variant="outline">OTUR · LIVE PLAN</Badge></div><div className="partner-workspace"><aside>{partnerToolKeys.map(({ key, icon: Icon }) => <button key={key} type="button" className={partnerMode === key ? 'active' : ''} onClick={() => setPartnerMode(key)}><Icon /><span>{labels[key]}</span></button>)}</aside><div className={`partner-plan mode-${partnerMode}`}><span className="partner-zone zone-a">{t.indoorZone}</span><span className="partner-zone zone-b">{t.terraceZone}</span>{[[22, 26], [49, 23], [75, 29], [30, 63], [61, 62], [84, 69]].map(([left, top], index) => <button key={index} type="button" style={{ left: `${left}%`, top: `${top}%` }}><span>{index + 1}</span></button>)}<output>{labels[partnerMode]}</output></div></div></div>
      </section>

      <footer className="site-footer"><OturLogo /><p>{t.promise}<br />Baku, Azerbaijan</p><span>{t.prototype}</span></footer>
      <BookingDialog open={reservationOpen} onOpenChange={setReservationOpen} restaurant={restaurant} table={selectedTable} date={date} time={time} guests={guests} language={language} labels={labels} />
      <PartnerDialog open={partnerOpen} onOpenChange={setPartnerOpen} labels={labels} />
    </main>
  );
}
