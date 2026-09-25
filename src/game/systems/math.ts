export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const round = (v: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};
