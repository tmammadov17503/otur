'use client';

import { useState } from 'react';
import { CalendarDays, LogOut, MapPin, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { canCancelReservation, type AccountProfile, type Reservation } from '@/lib/account';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: AccountProfile;
  reservations: Reservation[];
  onCancel: (id: string) => void;
  onSignOut: () => void;
  labels: Record<string, string>;
};

export function ProfileDialog({ open, onOpenChange, profile, reservations, onCancel, onSignOut, labels }: Props) {
  const [confirming, setConfirming] = useState('');
  const mine = reservations.filter((item) => item.userId === profile.id);
  return (
    <Dialog open={open} onOpenChange={(next) => { setConfirming(''); onOpenChange(next); }}>
      <DialogContent className="profile-dialog">
        <DialogHeader>
          <span className="sheet-kicker">{labels.myOtur}</span>
          <DialogTitle>{profile.name}</DialogTitle>
          <DialogDescription>{profile.email} · {profile.phone}</DialogDescription>
        </DialogHeader>
        <section className="reservation-list" aria-labelledby="reservation-list-title">
          <div className="reservation-list-heading"><div><span>{labels.reservations}</span><h3 id="reservation-list-title">{labels.yourTables}</h3></div><strong>{mine.filter((item) => item.status === 'confirmed').length}</strong></div>
          {mine.length === 0 ? <div className="empty-reservations"><CalendarDays /><p>{labels.noReservations}</p></div> : mine.map((item) => {
            const cancellable = canCancelReservation(item);
            return <article className={`reservation-item status-${item.status}`} key={item.id}>
              <div className="reservation-status"><span>{item.status === 'confirmed' ? labels.confirmed : labels.cancelled}</span><strong>{item.restaurantName} · {item.tableId}</strong></div>
              <div className="reservation-meta"><span><CalendarDays />{item.date} · {item.time}</span><span><Users />{item.guests} {labels.seats}</span><span><MapPin />{item.address}</span></div>
              {item.status === 'confirmed' && (confirming === item.id ? <div className="cancel-confirm"><p>{labels.cancelQuestion}</p><Button type="button" variant="outline" onClick={() => setConfirming('')}>{labels.keepReservation}</Button><Button type="button" onClick={() => { onCancel(item.id); setConfirming(''); }}>{labels.yesCancel}</Button></div> : <Button type="button" variant="outline" disabled={!cancellable} onClick={() => setConfirming(item.id)}>{cancellable ? labels.cancelReservation : labels.contactToCancel}</Button>)}
            </article>;
          })}
        </section>
        <p className="cancellation-policy">{labels.cancellationPolicy}</p>
        <Button type="button" variant="outline" className="sign-out-button" onClick={() => { onSignOut(); onOpenChange(false); }}><LogOut />{labels.signOut}</Button>
      </DialogContent>
    </Dialog>
  );
}

