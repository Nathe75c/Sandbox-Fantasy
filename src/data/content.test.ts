import { describe, expect, it } from 'vitest';
import { validateContent } from './validate';
import { CONTENT, itemUsage } from './index';

describe('contenu statique', () => {
  it('ne contient aucune référence cassée', () => {
    expect(validateContent()).toEqual([]);
  });

  it('chaque item fabriqué a au moins une source (récolte, butin, boutique ou recette)', () => {
    const orphans = CONTENT.lists.recipes
      .flatMap((r) => r.inputs.map((i) => i.itemId))
      .filter((id) => {
        const u = itemUsage(id);
        return u.producedBy.length + u.droppedBy.length + u.gatheredAt.length + u.soldAt.length === 0;
      });
    expect([...new Set(orphans)]).toEqual([]);
  });

  it('propose une base de contenu riche', () => {
    expect(CONTENT.lists.items.length).toBeGreaterThanOrEqual(100);
    expect(CONTENT.lists.recipes.length).toBeGreaterThanOrEqual(50);
    expect(CONTENT.lists.jobs.length).toBeGreaterThanOrEqual(15);
  });
});
