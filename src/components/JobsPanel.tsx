import { useState } from 'react';
import { CONTENT } from '@/data';
import { xpToNextJobLevel } from '@/game/systems/jobs';
import { useGame } from './GameContext';
import { Bar } from './ui';

const KIND_LABEL: Record<string, string> = { recolte: 'Récolte', artisanat: 'Artisanat', service: 'Service', commerce: 'Commerce', ombre: 'Ombre', combat: 'Combat', savoir: 'Savoir' };
const LEARN_LABEL = { libre: 'S’apprend en pratiquant', maitre: 'Auprès d’un maître', livre: 'Dans un livre' };

export function JobsPanel() {
  const { player, dispatch } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  if (!player) return null;
  const known = CONTENT.lists.jobs.filter((j) => player.jobs[j.id]);
  const others = CONTENT.lists.jobs.filter((j) => !player.jobs[j.id]);
  const masters = (jobId: string) => CONTENT.lists.npcs.filter((n) => n.teaches?.includes(jobId)).map((n) => n.name);

  const JobCard = ({ jobId }: { jobId: string }) => {
    const j = CONTENT.jobs[jobId];
    const p = player.jobs[jobId];
    const title = p ? [...j.progression].reverse().find((x) => x.level <= p.level)?.title : undefined;
    return (
      <li className="job-card">
        <button className="job-head" onClick={() => setOpen(open === jobId ? null : jobId)} aria-expanded={open === jobId}>
          <strong>{j.name}</strong>
          <small className="pill">{KIND_LABEL[j.kind]}</small>
          {p && (
            <small>
              {title} · niv. {p.level}
            </small>
          )}
        </button>
        {p && <Bar value={p.xp} max={xpToNextJobLevel(p.level)} tone="xp" label="XP" />}
        {open === jobId && (
          <div className="job-detail">
            <p>{j.description}</p>
            <p>
              <strong>Stats clés :</strong> {j.keyStats.map((s) => CONTENT.stats[s].name).join(', ')} · <strong>Revenus :</strong> {j.income}
            </p>
            {j.tools.length > 0 && (
              <p>
                <strong>Outils :</strong> {j.tools.map((t) => CONTENT.items[t]?.name).join(', ')}
              </p>
            )}
            <p>
              <strong>Produit :</strong> {j.produces.map((t) => CONTENT.items[t]?.name).join(', ') || '—'}
            </p>
            <p>
              <strong>Fournisseurs :</strong> {j.dependsOn.map((x) => CONTENT.jobs[x]?.name).join(', ') || '—'} · <strong>Clients :</strong>{' '}
              {j.feeds.map((x) => CONTENT.jobs[x]?.name).join(', ') || '—'}
            </p>
            <p>
              <strong>Risques :</strong> {j.risks.join(', ')}
            </p>
            <p>
              <strong>Économie :</strong> {j.economyImpact} <strong>Réputation :</strong> {j.reputationImpact}
            </p>
            <p>
              <strong>Progression :</strong> {j.progression.map((x) => `niv. ${x.level} ${x.title} (${x.unlocks})`).join(' → ')}
            </p>
            {!p && (
              <p>
                <strong>Apprentissage :</strong> {LEARN_LABEL[j.learnable]}
                {j.learnable === 'maitre' && ` : ${masters(jobId).join(', ')}${j.learnCost ? ` (${j.learnCost} po)` : ''}`}
                {j.learnable === 'livre' && ' : trouvez le grimoire correspondant.'}
              </p>
            )}
            {!p && j.learnable === 'libre' && (
              <button className="btn" onClick={() => dispatch({ type: 'learn_job', payload: { jobId } })}>
                Commencer ce métier
              </button>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <section className="panel">
      <h2>Mes métiers</h2>
      {known.length === 0 && <p className="muted">Aucun métier pour l’instant. Récoltez, travaillez ou trouvez un maître.</p>}
      <ul className="job-list">
        {known.map((j) => (
          <JobCard key={j.id} jobId={j.id} />
        ))}
      </ul>
      <h2>Autres métiers</h2>
      <p className="hint">Les métiers se cumulent. Touchez un métier pour voir ses outils, ses dépendances et comment l’apprendre.</p>
      <ul className="job-list">
        {others.map((j) => (
          <JobCard key={j.id} jobId={j.id} />
        ))}
      </ul>
    </section>
  );
}
