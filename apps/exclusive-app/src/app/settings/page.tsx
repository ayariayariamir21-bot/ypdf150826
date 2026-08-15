'use client';

import * as React from 'react';
import {
  IconCheck,
  IconCopy,
  IconKey,
  IconPlus,
  IconTrash,
  IconUsers,
} from '@/components/icons';
import { ORG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const INITIAL_KEYS: readonly ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production',
    key: 'pk_live_7f3c9a…e2b1',
    created: 'Jan 12, 2026',
    lastUsed: '2 minutes ago',
  },
  {
    id: 'key-2',
    name: 'Staging',
    key: 'pk_test_4d81bb…c90a',
    created: 'Mar 3, 2026',
    lastUsed: '3 hours ago',
  },
];

const PLAN_FEATURES = [
  'Unlimited document processing',
  'Priority model inference',
  '99.99% uptime SLA',
  'Dedicated support engineer',
];

export default function SettingsPage(): React.ReactElement {
  const [orgName, setOrgName] = React.useState<string>(ORG.name);
  const [saved, setSaved] = React.useState(false);
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [keys, setKeys] = React.useState<readonly ApiKey[]>(INITIAL_KEYS);
  const [newKeyName, setNewKeyName] = React.useState('');

  function handleSave(): void {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  function createKey(): void {
    const trimmed = newKeyName.trim();
    if (!trimmed) {
      return;
    }
    const createdKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: trimmed,
      key: `pk_live_${Math.random().toString(36).slice(2, 8)}…${Math.random().toString(36).slice(2, 6)}`,
      created: 'Just now',
      lastUsed: 'Never',
    };
    setKeys((current) => [...current, createdKey]);
    setNewKeyName('');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-50">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Organization, security and API access</p>
      </div>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-slate-100">Organization profile</h2>
        <p className="mt-0.5 text-xs text-slate-500">How your workspace appears to members</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">Organization name</span>
            <input
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              className="input w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">Billing plan</span>
            <select className="input w-full" defaultValue={ORG.tier}>
              <option value="Exclusive">Exclusive</option>
              <option value="Pro">Pro</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={handleSave} className="btn-primary h-8">
            {saved ? <IconCheck size={13} /> : null}
            {saved ? 'Saved' : 'Save changes'}
          </button>
          {saved ? <span className="text-xs text-success-500">Profile updated</span> : null}
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Security</h2>
            <p className="mt-0.5 text-xs text-slate-500">Two-factor authentication is enforced for Enterprise members</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={twoFactor}
            onClick={() => setTwoFactor((value) => !value)}
            className={twoFactor ? 'bg-brand-600' : 'bg-dark-border-hover'}
            style={{ width: 36, height: 20, borderRadius: 9999 }}
          >
            <span
              className="block h-4 w-4 rounded-full bg-white transition-transform"
              style={{ transform: twoFactor ? 'translateX(16px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-md border border-dark-border bg-dark-bg px-3 py-2.5 text-sm text-slate-300">
          <IconUsers size={15} className="shrink-0 text-slate-500" />
          {ORG.members} members · 3 admins · 1 billing admin
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-slate-100">API keys</h2>
        <p className="mt-0.5 text-xs text-slate-500">Keys used to authenticate pipeline integrations</p>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={newKeyName}
            onChange={(event) => setNewKeyName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                createKey();
              }
            }}
            placeholder="Key name (e.g. Production)"
            className="input h-8 w-64"
            aria-label="New API key name"
          />
          <button type="button" onClick={createKey} className="btn-primary h-8">
            <IconPlus size={13} />
            Create key
          </button>
        </div>

        <ul className="mt-4 divide-y divide-dark-border rounded-md border border-dark-border">
          {keys.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-600/15 text-brand-400">
                <IconKey size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{item.name}</p>
                <p className="font-mono text-xs text-slate-500">
                  {item.key} · created {item.created} · used {item.lastUsed}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost h-7 w-7 p-0"
                aria-label={`Copy ${item.name} key`}
                onClick={() => void navigator.clipboard?.writeText(item.key)}
              >
                <IconCopy size={13} />
              </button>
              <button
                type="button"
                className="btn-ghost h-7 w-7 p-0 text-danger-500 hover:bg-danger-500/10"
                aria-label={`Revoke ${item.name} key`}
                onClick={() => setKeys((current) => current.filter((key) => key.id !== item.id))}
              >
                <IconTrash size={13} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Exclusive plan</h2>
          <ul className="mt-2 space-y-1">
            {PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-xs text-slate-400">
                <IconCheck size={12} className="text-success-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className={cn('btn-secondary h-8')}>
          Manage billing
        </button>
      </section>
    </div>
  );
}
