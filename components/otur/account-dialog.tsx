'use client';

import { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PHONE_COUNTRIES, createAccount, normalizeInternationalPhone, toProfile, validateAccountInput, verifyAccount, type AccountProfile, type LocalAccount } from '@/lib/account';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: LocalAccount[];
  onAccountsChange: (accounts: LocalAccount[]) => void;
  onSignedIn: (profile: AccountProfile) => void;
  labels: Record<string, string>;
};

export function AccountDialog({ open, onOpenChange, accounts, onAccountsChange, onSignedIn, labels }: Props) {
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryIso, setCountryIso] = useState('AZ');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function reset() {
    setError('');
    setPassword('');
    setBusy(false);
  }

  function changeMode(next: 'signin' | 'create') {
    reset();
    setMode(next);
  }

  function changeOpen(next: boolean) {
    if (!next) {
      reset();
      setMode('signin');
    }
    onOpenChange(next);
  }

  function finish(profile: AccountProfile) {
    reset();
    onSignedIn(profile);
    changeOpen(false);
  }

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const country = PHONE_COUNTRIES.find((item) => item.iso === countryIso) ?? PHONE_COUNTRIES[0];
      const internationalPhone = normalizeInternationalPhone(country.dialCode, phone);
      if (!internationalPhone) {
        setError(labels.accountError);
        return;
      }
      if (mode === 'signin') {
        const account = accounts.find((item) => item.phone === internationalPhone);
        if (!account || !await verifyAccount(account, password)) {
          setError(labels.signInError);
          return;
        }
        finish(toProfile(account));
        return;
      }
      const checked = validateAccountInput({ name, email, phone: internationalPhone, password });
      if (!checked.valid) {
        setError(labels.accountError);
        return;
      }
      if (accounts.some((item) => item.phone === checked.value.phone || (checked.value.email && item.email === checked.value.email))) {
        setError(labels.accountExists);
        return;
      }
      const account = await createAccount(checked.value);
      if (!account) {
        setError(labels.accountError);
        return;
      }
      onAccountsChange([...accounts, account]);
      finish(toProfile(account));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="account-dialog">
        <DialogHeader>
          <span className="sheet-kicker">OTUR · {labels.account}</span>
          <DialogTitle>{mode === 'signin' ? labels.signInTitle : labels.createAccountTitle}</DialogTitle>
          <DialogDescription>{labels.accountDescription}</DialogDescription>
        </DialogHeader>
        <div className="account-tabs" role="tablist" aria-label={labels.account}>
          <button type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => changeMode('signin')}>{labels.signIn}</button>
          <button type="button" role="tab" aria-selected={mode === 'create'} onClick={() => changeMode('create')}>{labels.createAccount}</button>
        </div>
        <form className="account-form" onSubmit={submit} noValidate>
          {mode === 'create' && <div><Label htmlFor="account-name">{labels.name}</Label><div className="icon-field"><UserRound /><Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></div></div>}
          {mode === 'create' && <div><Label htmlFor="account-email">{labels.email} <small>{labels.optional}</small></Label><div className="icon-field"><Mail /><Input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></div></div>}
          <div>
            <Label htmlFor="account-phone">{labels.phone}</Label>
            <div className="phone-field">
              <div className="country-select"><Phone /><select id="account-country" value={countryIso} onChange={(event) => setCountryIso(event.target.value)} aria-label={labels.countryCode}>{PHONE_COUNTRIES.map((item) => <option key={item.iso} value={item.iso}>{item.flag} {item.name} ({item.dialCode})</option>)}</select></div>
              <Input id="account-phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel-national" inputMode="tel" placeholder={(PHONE_COUNTRIES.find((item) => item.iso === countryIso) ?? PHONE_COUNTRIES[0]).example} />
            </div>
          </div>
          <div><Label htmlFor="account-password">{labels.password}</Label><div className="icon-field"><LockKeyhole /><Input id="account-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></div>{mode === 'create' && <small>{labels.passwordHelp}</small>}</div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button className="confirm-button" type="submit" disabled={busy}>{busy ? labels.pleaseWait : mode === 'signin' ? labels.signIn : labels.createAccount}<ArrowRight /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
