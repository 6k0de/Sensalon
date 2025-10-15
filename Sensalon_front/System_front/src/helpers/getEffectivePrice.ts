export const getEffectivePrice = (p: any) =>
  [p.decprice1, p.decprice2, p.decprice3]
    .map(v => (typeof v === "number" ? v : parseFloat(v)))
    .find(n => Number.isFinite(n)) ?? 0;
