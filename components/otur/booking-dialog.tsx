'use client';

import { useState } from 'react';
import { CalendarPlus, Check, LocateFixed, Mail, Share2 } from 'lucide-react';

import { TableGlyph } from '@/components/otur/table-glyph';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isAzerbaijanPhone } from '@/lib/booking';
import { localizeTag, type Language, type Restaurant, type RestaurantTable } from '@/lib/otur-data';

type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
  table: RestaurantTable;
  date: string;
  time: string;
  guests: number;
  language: Language;
  labels: Record<string, string>;
};

export function BookingDialog({ open, onOpenChange, restaurant, table, date, time, guests, language, labels }: BookingDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+994 ');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmed(false);
      setError('');
      setStatus('');
    }
    onOpenChange(nextOpen);
  }

  function submit(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!name.trim() || !isAzerbaijanPhone(phone)) {
      setError(labels.requiredError);
      return;
    }
    setError('');
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="reservation-sheet confirmation-sheet">
          <div className="confirmation-mark"><Check /></div>
          <DialogHeader className="confirmation-header">
            <span className="sheet-kicker">{labels.confirmation}</span>
            <DialogTitle>{table.id} {labels.yours}</DialogTitle>
            <DialogDescription>{restaurant.name} · {date} · {time} · {guests} {labels.seats}</DialogDescription>
          </DialogHeader>
          <div className="confirmation-tags">
            {table.tags.slice(0, 3).map((tag) => <span key={tag}>{localizeTag(tag, language)}</span>)}
          </div>
          <div className={`confirmation-plan plan-${restaurant.planVariant}`}>
            <span className="mini-zone">{restaurant.name}</span>
            {restaurant.tables.slice(0, 6).map((item) => (
              <i key={item.id} className={item.id === table.id ? 'reserved' : ''} style={{ left: `${item.left}%`, top: `${item.top}%` }}>{item.id.replace(/^[A-Z]/, '')}</i>
            ))}
          </div>
          <div className="confirmation-actions">
            <Button type="button" variant="outline" onClick={() => setStatus(labels.calendarAdded)}><CalendarPlus />{labels.addCalendar}</Button>
            <Button type="button" variant="outline" onClick={() => setStatus(labels.directionsReady)}><LocateFixed />{labels.directions}</Button>
            <Button type="button" variant="outline" onClick={() => setStatus(labels.shareReady)}><Share2 />{labels.share}</Button>
          </div>
          <output aria-live="polite">{status}</output>
          <Button type="button" className="done-button" onClick={() => changeOpen(false)}>{labels.done}</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="reservation-sheet">
        <DialogHeader>
          <span className="sheet-kicker">{labels.reservation}</span>
          <DialogTitle>{labels.reserveTitle}</DialogTitle>
          <DialogDescription>{labels.reserveDescription}</DialogDescription>
        </DialogHeader>
        <div className="sheet-summary">
          <TableGlyph table={table} small />
          <span><small>{restaurant.name} · {table.id}</small><strong>{date} · {time} · {guests} {labels.seats}</strong></span>
          <Check />
        </div>
        <form className="reservation-form" onSubmit={submit} noValidate>
          <div><Label htmlFor="guest-name">{labels.name}</Label><Input id="guest-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></div>
          <div><Label htmlFor="guest-phone">{labels.phone}</Label><Input id="guest-phone" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" /></div>
          <div><Label htmlFor="guest-email">{labels.email} <small>{labels.optional}</small></Label><div className="icon-field"><Mail /><Input id="guest-email" type="email" autoComplete="email" placeholder="you@example.com" /></div></div>
          <div><Label htmlFor="guest-request">{labels.request} <small>{labels.optional}</small></Label><Textarea id="guest-request" placeholder={labels.requestPlaceholder} /></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" className="confirm-button">{labels.confirm}<Check /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
