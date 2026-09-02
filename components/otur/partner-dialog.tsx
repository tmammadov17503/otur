'use client';

import { useState } from 'react';
import { Check, FileUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isAzerbaijanPhone } from '@/lib/booking';

type PartnerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: Record<string, string>;
};

export function PartnerDialog({ open, onOpenChange, labels }: PartnerDialogProps) {
  const [restaurantName, setRestaurantName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('+994 ');
  const [seating, setSeating] = useState<string[]>([]);
  const [management, setManagement] = useState('WhatsApp');
  const [uploaded, setUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const seatingOptions = [labels.indoor, labels.terraceZone, labels.privateRooms, labels.outdoor];
  const managementOptions = [labels.phone, 'WhatsApp', 'Instagram', labels.paper, 'Excel', labels.system, labels.other];

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setSubmitted(false);
      setError('');
      setUploaded(false);
    }
    onOpenChange(nextOpen);
  }

  function toggleSeating(option: string) {
    setSeating((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  function submit(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!restaurantName.trim() || !contact.trim() || !isAzerbaijanPhone(phone)) {
      setError(labels.partnerError);
      return;
    }
    setError('');
    setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="partner-dialog">
        {submitted ? (
          <div className="partner-success">
            <div className="confirmation-mark"><Check /></div>
            <DialogHeader>
              <DialogTitle>{labels.thankYou}</DialogTitle>
              <DialogDescription>{labels.thankYouCopy}</DialogDescription>
            </DialogHeader>
            <Button type="button" onClick={() => changeOpen(false)}>{labels.done}</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <span className="sheet-kicker">OTUR · BAKU</span>
              <DialogTitle>{labels.partnerTitle}</DialogTitle>
              <DialogDescription>{labels.partnerDescription}</DialogDescription>
            </DialogHeader>
            <form className="partner-form" onSubmit={submit} noValidate>
              <div className="form-grid">
                <div><Label htmlFor="partner-restaurant">{labels.restaurantName}</Label><Input id="partner-restaurant" value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} /></div>
                <div><Label htmlFor="partner-contact">{labels.contactPerson}</Label><Input id="partner-contact" value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="name" /></div>
                <div><Label htmlFor="partner-phone">{labels.phone}</Label><Input id="partner-phone" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" /></div>
                <div><Label htmlFor="partner-email">{labels.email}</Label><Input id="partner-email" type="email" autoComplete="email" /></div>
                <div><Label htmlFor="partner-district">{labels.district}</Label><Input id="partner-district" /></div>
                <div><Label htmlFor="partner-tables">{labels.tableCount}</Label><Input id="partner-tables" type="number" min="1" inputMode="numeric" /></div>
              </div>
              <fieldset><legend>{labels.has}</legend><div className="choice-grid">{seatingOptions.map((option) => <button key={option} type="button" className={seating.includes(option) ? 'active' : ''} onClick={() => toggleSeating(option)}>{seating.includes(option) && <Check />}{option}</button>)}</div></fieldset>
              <fieldset><legend>{labels.acceptReservations}</legend><div className="choice-row"><label><input type="radio" name="accepts" defaultChecked />{labels.yes}</label><label><input type="radio" name="accepts" />{labels.no}</label></div></fieldset>
              <fieldset><legend>{labels.manage}</legend><div className="choice-grid compact">{managementOptions.map((option) => <button key={option} type="button" className={management === option ? 'active' : ''} onClick={() => setManagement(option)}>{option}</button>)}</div></fieldset>
              <div className="upload-control">
                <Label htmlFor="floor-upload"><FileUp />{uploaded ? labels.uploaded : labels.upload}<small>{labels.uploadOptional}</small></Label>
                <Input id="floor-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setUploaded(Boolean(event.target.files?.length))} />
              </div>
              <div><Label htmlFor="partner-message">{labels.additional} <small>{labels.optional}</small></Label><Textarea id="partner-message" /></div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <Button type="submit" className="confirm-button">{labels.join}<Check /></Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
