/** Petits composants d'interface réutilisables. */
import type { ReactNode } from 'react';
import { CONTENT } from '@/data';
import type { StatModifiers } from '@/types';

export function StatModList({ mods }: { mods: StatModifiers }) {
  const entries = Object.entries(mods).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <span className="mods">
      {entries.map(([k, v]) => (
        <span key={k} className={(v ?? 0) > 0 ? 'mod pos' : 'mod neg'}>
          {CONTENT.stats[k]?.short} {(v ?? 0) > 0 ? '+' : ''}
          {v}
        </span>
      ))}
    </span>
  );
}

export function Bar({ value, max, tone = 'hp', label }: { value: number; max: number; tone?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={`bar ${tone}`} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className="bar-fill" style={{ width: `${pct}%` }} />
      <span className="bar-label">
        {label ? `${label} ` : ''}
        {Math.round(value)}/{max}
      </span>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="btn icon" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export const RARITY_LABEL: Record<string, string> = {
  mediocre: 'Médiocre',
  commun: 'Commun',
  peu_commun: 'Peu commun',
  rare: 'Rare',
  epique: 'Épique',
  legendaire: 'Légendaire',
};

export function ItemLabel({ itemId, qty, stolen }: { itemId: string; qty?: number; stolen?: boolean }) {
  const def = CONTENT.items[itemId];
  return (
    <span className={`item-label rarity-${def?.rarity ?? 'commun'}`}>
      {qty !== undefined && <span className="qty">{qty}×</span>} {def?.name ?? itemId}
      {stolen && <span className="tag stolen">volé</span>}
      {def?.illegal && <span className="tag illegal">illégal</span>}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="kv" title={hint}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
