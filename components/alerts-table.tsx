import { AlertRow } from "@/types/alert";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { resolveAlert } from "@/actions/alerts";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    data: AlertRow[];
    typeTable: 'DASHBOARD' | 'VIEW';
    onChange?: (update: boolean) => void
};

export default function AlertsTable({ data, typeTable, onChange }: Props) {
    const t = useTranslations("ALERTS-VIEW");
    const { profile } = useProfileLoginSWR();

    const isDashboard = typeTable === "DASHBOARD";

    async function handleResolve(alertId: number) {
        if (profile) {
            const response = await resolveAlert(String(alertId), String(profile.profile_id));
            if (response.success) {
                toast.success(t("RESOLVED-SUCCESSFULLY"));
                if (onChange) {
                    onChange(true);
                }
            }
        }
    }

    return (
        <div
            className={cn(
                "space-y-2 overflow-y-auto",
                isDashboard ? "h-full" : "max-h-[60vh]"
            )}
        >
      {data.map((alert) => {
        return (
          <div
            key={alert.alert_id}
            className={cn(
              "bg-accent/25 rounded-sm shadow-sm transition-all hover:shadow-md",
              isDashboard ? "p-2" : "p-4"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between gap-3",
                isDashboard && "text-sm"
              )}
            >
              <div className="flex flex-col">
                <span className={cn("font-semibold text-foreground", isDashboard && "text-sm")}>
                  {alert.item_name}
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                    {t("QTY")}: {alert.remaining_quantity}
                </span>
                <span className="text-muted-foreground text-xs">
                    Vence: {new Date(alert.due_date).toLocaleDateString()}
                </span>
            </div>    
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleResolve(alert.alert_id)}
                  size={isDashboard ? "sm" : "default"}
                  className={cn(isDashboard && "h-7 px-2 text-xs")}
                >
                    {isDashboard ? (
                        <Check className="w-4 h-4"></Check>
                    ) : (
                       t("RESOLVE")
                    )}
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
    );
}