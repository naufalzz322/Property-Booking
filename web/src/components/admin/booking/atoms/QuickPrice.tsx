interface QuickPriceProps {
  amount: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showCurrency?: boolean;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `Rp ${millions.toFixed(millions % 1 === 0 ? 0 : 1)}jt`;
  }
  if (amount >= 1_000) {
    const thousands = amount / 1_000;
    return `Rp ${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}rb`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function QuickPrice({
  amount,
  size = "md",
  showCurrency = true,
}: QuickPriceProps) {
  if (amount == null) {
    return <span className="text-slate-400">—</span>;
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <span className={`font-semibold ${sizeClasses[size]} text-slate-900`}>
      {formatCurrency(amount)}
    </span>
  );
}
