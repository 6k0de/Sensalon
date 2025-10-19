export const isNewProduct = (dt: string | Date | undefined | null) => {
  console.log(dt)
  if (!dt) return false;
  const created = new Date(dt);
  if (isNaN(created.getTime())) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return (Date.now() - created.getTime()) < THIRTY_DAYS;
};
