'use client';

import { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAccount, toProfile, validateAccountInput, verifyAccount, type AccountProfile, type DemoAccount } from '@/lib/account';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: DemoAccount[];
  onAccountsChange: (accounts: DemoAccount[]) => void;
  onSignedIn: (profile: AccountProfile) => void;
  labels: Record<string, string>;
};

export function AccountDialog({ open, onOpenChange, accounts, onAccountsChange, onSignedIn, labels }: Props) {
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+994 ');
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
      if (mode === 'signin') {
        const account = accounts.find((item) => item.email === email.trim().toLowerCase());
        if (!account || !await verifyAccount(account, password)) {
          setError(labels.signInError);
          return;
        }
        finish(toProfile(account));
        return;
      }
      const checked = validateAccountInput({ name, email, phone, password });
      if (!checked.valid) {
        setError(labels.accountError);
        return;
      }
      if (accounts.some((item) => item.email === checked.value.email)) {
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
        <button className="demo-account-button" type="button" onClick={() => finish({ id: 'otur-demo-guest', name: labels.demoGuest, email: 'demo@otur.local', phone: '+994 50 000 00 00' })}>
          <span><ShieldCheck /><strong>{labels.useDemoAccount}</strong><small>{labels.demoAccountNote}</small></span><ArrowRight />
        </button>
        <div className="account-divider"><span>{labels.or}</span></div>
        <form className="account-form" onSubmit={submit} noValidate>
          {mode === 'create' && <div><Label htmlFor="account-name">{labels.name}</Label><div className="icon-field"><UserRound /><Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></div></div>}
          <div><Label htmlFor="account-email">{labels.email}</Label><div className="icon-field"><Mail /><Input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></div></div>
          {mode === 'create' && <div><Label htmlFor="account-phone">{labels.phone}</Label><Input id="account-phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" /></div>}
          <div><Label htmlFor="account-password">{labels.password}</Label><div className="icon-field"><LockKeyhole /><Input id="account-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></div>{mode === 'create' && <small>{labels.passwordHelp}</small>}</div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button className="confirm-button" type="submit" disabled={busy}>{busy ? labels.pleaseWait : mode === 'signin' ? labels.signIn : labels.createAccount}<ArrowRight /></Button>
        </form>
        <p className="prototype-note"><ShieldCheck />{labels.localAccountNote}</p>
      </DialogContent>
    </Dialog>
  );
}
