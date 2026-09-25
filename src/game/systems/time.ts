import type { Ctx } from '../actions/context';
import { dailyTick } from './world';

/** Fait avancer l'horloge du monde ; chaque nouveau jour déclenche la simulation. */
export function advanceTime(ctx: Ctx, hours: number) {
  const time = ctx.state.world.time;
  let remaining = Math.max(0, Math.round(hours));
  while (remaining > 0) {
    const step = Math.min(remaining, 24 - time.hour);
    time.hour += step;
    remaining -= step;
    if (time.hour >= 24) {
      time.hour -= 24;
      time.day += 1;
      dailyTick(ctx);
    }
  }
}
