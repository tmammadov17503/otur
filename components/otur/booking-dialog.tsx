'use client';

import { useState } from 'react';
import { CalendarPlus, Check, ClipboardList, Eye, Mail, Phone, Share2 } from 'lucide-react';

import { TableGlyph } from '@/components/otur/table-glyph';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AccountProfile } from '@/lib/account';
import { createCalendar, createPlanUrl } from '@/lib/dining-plans';
import { localizeTag, type Language, type Restaurant, type RestaurantTable } from '@/lib/otur-data';

type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
  table: RestaurantTable;
  date: string;
  time: string;
  guests: number;
  profile: AccountProfile;
  onConfirm: (request: string) => void;
  onManageReservations: () => void;
  language: Language;
  labels: Record<string, string>;
};

export function BookingDialog({ open, onOpenChange, restaurant, table, date, time, guests, profile, onConfirm, onManageReservations, language, labels }: BookingDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [request, setRequest] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [status, setStatus] = useState('');
  const [shareLink, setShareLink] = useState('');
  const plan = { restaurantId: restaurant.id, tableId: table.id, date, time, guests };

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmed(false);
      setStatus('');
      setShareLink('');
      setRequest('');
      setPolicyAccepted(false);
    }
    onOpenChange(nextOpen);
  }

  function downloadCalendar() {
    const file = new Blob([createCalendar(plan, restaurant.name)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `otur-${restaurant.id}-${date}.ics`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(labels.calendarDownloaded);
  }

  async function sharePlan() {
    const url = createPlanUrl(window.location.href, plan);
    try {
      if (navigator.share) {
        await navigator.share({ title: `OTUR · ${restaurant.name}`, text: labels.shareReservation, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus(labels.sharedCopied);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareLink(url);
      setStatus(labels.shareFallback);
    }
  }

  function submit(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!policyAccepted) return;
    onConfirm(request.trim().slice(0, 500));
    setConfirmed(true);
  }

  function manageReservation() {
    changeOpen(false);
    onManageReservations();
  }

  if (confirmed) {
    return (
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="reservation-sheet confirmation-sheet">
          <div className="confirmation-mark"><Check /></div>
          <DialogHeader className="confirmation-header">
            <span className="sheet-kicker">{labels.planSaved} · {table.id}</span>
            <DialogTitle>{labels.planReady}</DialogTitle>
            <DialogDescription>{restaurant.name} · {table.id} · {date} · {time} · {guests} {labels.seats}</DialogDescription>
          </DialogHeader>
          <div className="confirmation-tags">
            {table.tags.slice(0, 3).map((tag) => <span key={tag}>{localizeTag(tag, language)}</span>)}
          </div>
          <div className={`confirmation-plan plan-${restaurant.planVariant}`}>
            <span className="mini-zone">{restaurant.name}</span>
            {restaurant.tables.map((item) => (
              <i key={item.id} className={item.id === table.id ? 'reserved' : ''} style={{ left: `${item.left}%`, top: `${item.top}%` }}>{item.id.replace(/^[A-Z]/, '')}</i>
            ))}
          </div>
          <div className="confirmation-actions">
            <Button type="button" variant="outline" onClick={downloadCalendar}><CalendarPlus />{labels.addCalendar}</Button>
            <Button type="button" variant="outline" onClick={() => changeOpen(false)}><Eye />{labels.backToTable}</Button>
            <Button type="button" variant="outline" onClick={sharePlan}><Share2 />{labels.share}</Button>
          </div>
          <output aria-live="polite">{status}</output>
          {shareLink && <input className="share-link" aria-label={labels.shareFallback} value={shareLink} readOnly onFocus={(event) => event.currentTarget.select()} />}
          <div className="manage-reservation-panel">
            <p className="manage-reservation-note">{labels.manageReservationNote}</p>
            <Button type="button" className="manage-reservation-button" onClick={manageReservation}><ClipboardList />{labels.manageReservation}</Button>
          </div>
          <Button type="button" variant="outline" className="done-button" onClick={() => changeOpen(false)}>{labels.done}</Button>
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
          <div className="booking-contact">{profile.email && <span><Mail />{profile.email}</span>}<span><Phone />{profile.phone}</span></div>
          <div><Label htmlFor="guest-request">{labels.request} <small>{labels.optional}</small></Label><Textarea id="guest-request" value={request} maxLength={500} onChange={(event) => setRequest(event.target.value)} placeholder={labels.requestPlaceholder} /></div>
          <label className="policy-check"><input type="checkbox" checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} /><span>{labels.acceptCancellationPolicy}</span></label>
          <Button type="submit" className="confirm-button" disabled={!policyAccepted}>{labels.confirm}<Check /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
