import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyContactCardProps {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  operationalHours?: string | null;
  variant?: "default" | "compact";
}

export function PropertyContactCard({
  phone,
  email,
  address,
  operationalHours,
  variant = "default",
}: PropertyContactCardProps) {
  const hasContact = phone || email || address || operationalHours;

  if (!hasContact) return null;

  // Full card version for kamar detail page
  if (variant === "default") {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-stone-900 mb-3">Hubungi Kami</h3>
          <div className="space-y-2">
            {phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-stone-400" />
                <a href={`tel:${phone}`} className="text-stone-600 hover:text-amber-600">
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-stone-400" />
                <a href={`mailto:${email}`} className="text-stone-600 hover:text-amber-600">
                  {email}
                </a>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                <span className="text-stone-600">{address}</span>
              </div>
            )}
            {operationalHours && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-stone-400" />
                <span className="text-stone-600">{operationalHours}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact inline version for kamar listing page
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
      {phone && (
        <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-amber-600">
          <Phone className="w-4 h-4" />
          {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-amber-600">
          <Mail className="w-4 h-4" />
          {email}
        </a>
      )}
    </div>
  );
}
