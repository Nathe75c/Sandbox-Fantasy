/**
 * Transforme les événements de jeu en phrases pour le journal du joueur.
 * Les événements purement techniques (opinion, apparition...) ne sont pas affichés.
 */
import { CONTENT } from '@/data';
import type { GameEvent } from '@/types';

export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'world';

export function narrate(event: GameEvent, playerId: string): { text: string; tone: Tone } | null {
  const mine = event.actorId === playerId;
  switch (event.type) {
    case 'message':
      return event.actorId === playerId || event.actorId === 'world' ? { text: event.data.text, tone: event.data.tone ?? 'info' } : null;
    case 'player_moved':
      return mine ? { text: `Vous arrivez : ${CONTENT.locations[event.data.to]?.name}${event.data.hours ? ` (${event.data.hours} h de route)` : ''}.`, tone: 'info' } : null;
    case 'job_learned':
      return mine ? { text: `Nouveau métier : ${CONTENT.jobs[event.data.jobId]?.name}.`, tone: 'success' } : null;
    case 'job_leveled':
      return mine ? { text: `${CONTENT.jobs[event.data.jobId]?.name} : niveau ${event.data.level} !`, tone: 'success' } : null;
    case 'player_leveled':
      return mine ? { text: `Niveau ${event.data.level} atteint ! +1 point de statistique, forces restaurées.`, tone: 'success' } : null;
    case 'reputation_changed': {
      if (!mine) return null;
      const name = event.data.scope === 'faction' ? CONTENT.factions[event.data.targetId]?.name : CONTENT.locations[event.data.targetId]?.name;
      const sign = event.data.delta > 0 ? '+' : '';
      return { text: `Réputation ${name} : ${sign}${event.data.delta} (${event.data.reason}).`, tone: event.data.delta > 0 ? 'success' : 'warning' };
    }
    case 'notoriety_changed':
      return mine && event.data.delta > 0 ? { text: `Notoriété criminelle : ${event.data.value}.`, tone: 'warning' } : null;
    case 'npc_memory_added':
      return mine && !event.data.hearsay && event.data.impact !== 0 && Math.abs(event.data.impact) >= 10
        ? { text: `${CONTENT.npcs[event.data.npcId]?.name} s’en souviendra.`, tone: event.data.impact > 0 ? 'success' : 'warning' }
        : null;
    case 'world_event_triggered':
      return { text: `Événement : ${CONTENT.worldEvents[event.data.eventId]?.name}.`, tone: 'world' };
    case 'world_event_ended':
      return { text: `Fin de l’événement : ${CONTENT.worldEvents[event.data.eventId]?.name}.`, tone: 'world' };
    case 'rumor_spread':
      return { text: `Rumeur : ${event.data.text}`, tone: 'world' };
    case 'day_started':
      return { text: `— Jour ${event.data.day} —`, tone: 'world' };
    case 'faction_joined':
      return null;
    default:
      return null;
  }
}
