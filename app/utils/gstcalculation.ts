export type OrderCalculations = {
  gstPercentage: number;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  totalGST: number;
  grandTotal: number;
  totalItems: number;
};

export function calculateOrderTotals(
  totalInclusive: number,
  items: { quantity: number }[],
): OrderCalculations {
  const gstPercentage = 9;

  const cgst_amount = Number(
    ((totalInclusive * gstPercentage) / 100).toFixed(2),
  );

  const sgst_amount = Number(
    ((totalInclusive * gstPercentage) / 100).toFixed(2),
  );

  const totalGST = Number(
    (cgst_amount + sgst_amount).toFixed(2),
  );

  const subtotal = Number(
    (totalInclusive - totalGST).toFixed(2),
  );

  const grandTotal = Number(
    (subtotal + cgst_amount + sgst_amount).toFixed(2),
  );

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return {
    gstPercentage,
    subtotal,
    cgst_amount,
    sgst_amount,
    totalGST,
    grandTotal,
    totalItems,
  };
}