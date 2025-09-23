import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS } from "@/types/constants";
import { useTranslations } from "next-intl";

export function StatusBadge({ status }: {status: string}) {

  const t = useTranslations("STATUS-ORDER");

  const getBadgeVariant = (status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS]) => {
    switch (status) {
      case ORDER_STATUS.SUGGESTED:
        return "bg-yellow-500/50 hover:bg-yellow-500/80 text-white"; // Amarillo
      case ORDER_STATUS.REVISED:
        return "bg-purple-500/50 hover:bg-purple-500/80 text-white"; // Púrpura
      case ORDER_STATUS.ACCEPTED:
        return "bg-green-500/50 hover:bg-green-500/80 text-white"; // Verde
      case ORDER_STATUS.RECEIVED:
        return "bg-slate-500/50 hover:bg-slate-500/80 text-white"; // Gris
      default:
        return "bg-gray-200 hover:bg-gray-200/80 text-gray-800"; // Por defecto
    }
  };

  return (
    <Badge className={getBadgeVariant(status)}>
      {t(status)}
    </Badge>
  );
}