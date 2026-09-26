import { Button, Divider, Select, Skeleton, Typography } from "antd";
import { ArrowLeftRight, Baby, Camera, Compass, Moon, Route, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTravelStore } from "@/stores/useTravelStore";

const { Text } = Typography;

const templateIcons: Record<string, ReactNode> = {
  NIGHT_HALF_DAY: <Moon className="h-4 w-4" />,
  FAMILY_EASY: <Baby className="h-4 w-4" />,
  OLD_STREET_PHOTO: <Camera className="h-4 w-4" />,
  FIRST_VISIT: <Compass className="h-4 w-4" />,
};

export default function ControlPanel() {
  const nodes = useTravelStore((s) => s.nodes);
  const nodesLoading = useTravelStore((s) => s.nodesLoading);
  const templates = useTravelStore((s) => s.templates);
  const templatesLoading = useTravelStore((s) => s.templatesLoading);
  const startId = useTravelStore((s) => s.startId);
  const endId = useTravelStore((s) => s.endId);
  const viaIds = useTravelStore((s) => s.viaIds);
  const route = useTravelStore((s) => s.route);
  const routeLoading = useTravelStore((s) => s.routeLoading);
  const activeTemplateId = useTravelStore((s) => s.activeTemplateId);
  const setStartId = useTravelStore((s) => s.setStartId);
  const setEndId = useTravelStore((s) => s.setEndId);
  const setViaIds = useTravelStore((s) => s.setViaIds);
  const swap = useTravelStore((s) => s.swap);
  const clear = useTravelStore((s) => s.clear);
  const applyTemplate = useTravelStore((s) => s.applyTemplate);
  const fetchRoute = useTravelStore((s) => s.fetchRoute);

  const [keyword, setKeyword] = useState<string>("");

  const options = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const list = k ? nodes.filter((n) => (n.name || "").toLowerCase().includes(k)) : nodes;
    return list.map((n) => ({ label: n.name || n.id, value: n.id }));
  }, [keyword, nodes]);

  const distanceText = useMemo(() => {
    if (!route) return "";
    const m = route.totalDistanceMeters;
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(2)} km`;
  }, [route]);

  const viaIdSet = useMemo(() => new Set(route?.viaNodeIds ?? []), [route]);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">重庆旅游线路规划</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">数据源：nodes.csv</span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">权重：地理距离</span>
          </div>
        </div>
        <Button type="text" onClick={() => clear()} icon={<X className="h-4 w-4" />} />
      </div>

      <Divider className="my-3" />

      {nodesLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <div className="space-y-2">
            <Text type="secondary">热门路线模板</Text>
            {templatesLoading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => {
                  const active = t.id === activeTemplateId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => void applyTemplate(t.id)}
                      className={`rounded-xl border p-2 text-left transition-colors ${
                        active
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 ${active ? "text-blue-700" : "text-slate-900"}`}>
                        {templateIcons[t.id] ?? <Sparkles className="h-4 w-4" />}
                        <span className="text-sm font-medium">{t.name}</span>
                      </div>
                      {t.desc ? <div className="mt-1 text-xs text-slate-500 line-clamp-2">{t.desc}</div> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400">暂无可用模板</div>
            )}
          </div>

          <Divider className="my-3" />

          <div className="space-y-2">
            <Text type="secondary">起点</Text>
            <Select
              showSearch
              value={startId}
              placeholder="选择起点"
              options={options}
              className="w-full"
              filterOption={false}
              onSearch={setKeyword}
              onChange={(v) => setStartId(v)}
              allowClear
            />
          </div>

          <div className="mt-3 space-y-2">
            <Text type="secondary">终点</Text>
            <Select
              showSearch
              value={endId}
              placeholder="选择终点"
              options={options}
              className="w-full"
              filterOption={false}
              onSearch={setKeyword}
              onChange={(v) => setEndId(v)}
              allowClear
            />
          </div>

          <div className="mt-3 space-y-2">
            <Text type="secondary">途经点（可选）</Text>
            <Select
              mode="multiple"
              showSearch
              value={viaIds}
              placeholder="选择途经点"
              options={options}
              className="w-full"
              filterOption={false}
              onSearch={setKeyword}
              onChange={(vals) => setViaIds(vals)}
              allowClear
              maxTagCount="responsive"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={() => swap()} icon={<ArrowLeftRight className="h-4 w-4" />}>
              交换
            </Button>
            <Button type="primary" loading={routeLoading} onClick={() => fetchRoute()} icon={<Route className="h-4 w-4" />}>
              开始规划
            </Button>
          </div>

          <Divider className="my-4" />

          <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">路径结果</div>
              {route ? <div className="text-xs text-slate-500">{distanceText}</div> : null}
            </div>

            {route ? (
              <div className="mt-3 space-y-2">
                {route.pathNodes.map((n, idx) => (
                  <div key={n.id} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-900">
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs">
                          {idx + 1}
                        </span>
                        {n.name}
                        {viaIdSet.has(n.id) ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                            途经
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500">{n.type || ""}</div>
                    </div>
                    {n.desc ? <div className="mt-1 text-xs text-slate-600">{n.desc}</div> : null}
                    {idx > 0 ? (
                      <div className="mt-1 text-xs text-slate-500">
                        与上一点约 {Math.round(route.segmentDistanceMeters[idx - 1])} m
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-600">选择起点与终点后开始规划，或点击上方模板一键填入。</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
