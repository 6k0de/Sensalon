export const calculateTotals = ({
  products = [],
  addCredit = false,
  credit = 0,
  useCashback = false,
  cashback = 0,
  envio = 0,
}: any) => {
  const toNumber = (v: any) => Number(v) || 0;

  const subtotal = products.reduce((acc: number, item: any) => {
    const total = toNumber(item.total);
    const price =
      total > 0
        ? total
        : toNumber(item.product?.price || item.product?.priceUnit || 0) *
          toNumber(item.quantity || 1);
    return acc + price;
  }, 0);

  let total = subtotal;

  if (addCredit) total -= toNumber(credit);
  if (useCashback) total -= toNumber(cashback);
  total += toNumber(envio);

  total = Math.max(0, Math.round(total * 100) / 100);

  return { subtotal: Math.round(subtotal * 100) / 100, total };
};
