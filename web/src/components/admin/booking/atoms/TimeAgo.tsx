import { format, parseISO, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface TimeAgoProps {
  dateString: string;
  className?: string;
}

export function TimeAgo({ dateString, className = "" }: TimeAgoProps) {
  const date = parseISO(dateString);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: id });

  // Convert "sekitar 2 jam yang lalu" to "2j lalu" format
  const shortTimeAgo = timeAgo
    .replace("sekitar ", "")
    .replace(" yang lalu", " lalu")
    .replace(" menit", "m")
    .replace(" jam", "j")
    .replace(" hari", "h")
    .replace(" bulan", "bln");

  return (
    <span className={`text-xs text-slate-400 ${className}`} title={timeAgo}>
      {shortTimeAgo}
    </span>
  );
}

interface FormattedDateProps {
  dateString: string;
  format?: string;
  className?: string;
}

const defaultFormat = "dd MMM yyyy";

export function FormattedDate({
  dateString,
  format: formatStr = defaultFormat,
  className = "",
}: FormattedDateProps) {
  const date = parseISO(dateString);

  return (
    <span className={`text-sm text-slate-700 ${className}`}>
      {format(date, formatStr, { locale: id })}
    </span>
  );
}
