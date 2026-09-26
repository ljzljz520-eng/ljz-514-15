import { Typography } from "antd";
import { Sparkles } from "lucide-react";
import { routeTemplates } from "@/data/routeTemplates";
import { useTravelStore } from "@/stores/useTravelStore";

const { Text } = Typography;

export default function RouteTemplates() {
  const applyTemplate = useTravelStore((s) => s.applyTemplate);
  const routeLoading = useTravelStore((s) => s.routeLoading);
  const activeTemplateId = useTravelStore((s) => s.activeTemplateId);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <Text type="secondary">热门路线模板</Text>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {routeTemplates.map((tpl) => {
          const active = tpl.id === activeTemplateId;
          return (
            <button
              key={tpl.id}
              type="button"
              disabled={routeLoading}
              onClick={() => void applyTemplate(tpl)}
              className={[
                "rounded-xl border p-2 text-left transition-colors",
                active
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40",
                routeLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="text-sm font-medium text-slate-900">{tpl.name}</div>
              <div className="mt-0.5 text-xs leading-4 text-slate-500">{tpl.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
