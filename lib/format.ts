const tzsAmountFormatter = new Intl.NumberFormat("en-TZ", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Tanzanian Shilling (TZS), displayed as Tsh */
export function formatCurrency(amount: number) {
  return `Tsh ${tzsAmountFormatter.format(amount)}`;
}

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
}
