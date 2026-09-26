import { create } from "zustand";
import { notification } from "antd";

export type TravelNode = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
  desc?: string;
};

export type PathResult = {
  startId: string;
  endId: string;
  totalDistanceMeters: number;
  pathNodeIds: string[];
  pathNodes: TravelNode[];
  segmentDistanceMeters: number[];
  viaNodeIds?: string[];
};

export type RouteTemplate = {
  id: string;
  name: string;
  desc?: string;
  startId: string;
  endId: string;
  viaIds: string[];
};

type State = {
  nodes: TravelNode[];
  nodesLoading: boolean;
  templates: RouteTemplate[];
  templatesLoading: boolean;
  startId?: string;
  endId?: string;
  viaIds: string[];
  route?: PathResult;
  routeLoading: boolean;
  selectedNodeId?: string;
  activeTemplateId?: string;
};

type Actions = {
  loadNodes: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  setStartId: (id?: string) => void;
  setEndId: (id?: string) => void;
  setViaIds: (ids: string[]) => void;
  swap: () => void;
  clear: () => void;
  setSelectedNodeId: (id?: string) => void;
  applyTemplate: (id: string) => Promise<void>;
  fetchRoute: () => Promise<void>;
};

const apiBase = import.meta.env.VITE_API_BASE || "/api";

export const useTravelStore = create<State & Actions>((set, get) => ({
  nodes: [],
  nodesLoading: false,
  templates: [],
  templatesLoading: false,
  viaIds: [],
  routeLoading: false,

  loadNodes: async () => {
    if (get().nodesLoading) return;
    set({ nodesLoading: true });
    try {
      const res = await fetch(`${apiBase}/nodes`);
      if (!res.ok) throw new Error("nodes_fetch_failed");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("nodes_payload_invalid");
      const nodes = (data as Array<Record<string, unknown>>)
        .map((raw) => {
          const id = String(raw?.id ?? "").trim();
          const name = String(raw?.name ?? "").trim();
          const lat = Number(raw?.lat);
          const lng = Number(raw?.lng);
          const type = typeof raw?.type === "string" ? raw.type : undefined;
          const desc = typeof raw?.desc === "string" ? raw.desc : undefined;
          return { id, name, lat, lng, type, desc } satisfies TravelNode;
        })
        .filter((n) => n.id && Number.isFinite(n.lat) && Number.isFinite(n.lng));
      set({ nodes });
    } catch {
      notification.error({ message: "加载节点失败", description: "请检查后端服务是否已启动" });
    } finally {
      set({ nodesLoading: false });
    }
  },

  loadTemplates: async () => {
    if (get().templatesLoading) return;
    set({ templatesLoading: true });
    try {
      const res = await fetch(`${apiBase}/templates`);
      if (!res.ok) throw new Error("templates_fetch_failed");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("templates_payload_invalid");
      const templates = (data as Array<Record<string, unknown>>)
        .map((raw) => {
          const id = String(raw?.id ?? "").trim();
          const name = String(raw?.name ?? "").trim();
          const desc = typeof raw?.desc === "string" ? raw.desc : undefined;
          const startId = String(raw?.startId ?? "").trim();
          const endId = String(raw?.endId ?? "").trim();
          const viaIds = Array.isArray(raw?.viaIds)
            ? raw.viaIds.map((v: unknown) => String(v ?? "").trim()).filter(Boolean)
            : [];
          return { id, name, desc, startId, endId, viaIds } satisfies RouteTemplate;
        })
        .filter((t) => t.id && t.startId && t.endId);
      set({ templates });
    } catch {
      notification.error({ message: "加载路线模板失败", description: "请检查后端服务是否已启动" });
    } finally {
      set({ templatesLoading: false });
    }
  },

  setStartId: (id) => set({ startId: id, route: undefined, activeTemplateId: undefined }),
  setEndId: (id) => set({ endId: id, route: undefined, activeTemplateId: undefined }),
  setViaIds: (ids) => set({ viaIds: ids, route: undefined, activeTemplateId: undefined }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  swap: () => {
    const { startId, endId } = get();
    set({ startId: endId, endId: startId, route: undefined, activeTemplateId: undefined });
  },

  clear: () =>
    set({
      startId: undefined,
      endId: undefined,
      viaIds: [],
      route: undefined,
      selectedNodeId: undefined,
      activeTemplateId: undefined,
    }),

  applyTemplate: async (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) return;
    set({
      startId: template.startId,
      endId: template.endId,
      viaIds: [...template.viaIds],
      activeTemplateId: template.id,
      route: undefined,
    });
    await get().fetchRoute();
  },

  fetchRoute: async () => {
    const { startId, endId, viaIds } = get();
    if (!startId || !endId) {
      notification.warning({ message: "请选择起点与终点" });
      return;
    }
    set({ routeLoading: true });
    try {
      const qs = new URLSearchParams({ from: startId, to: endId });
      if (viaIds.length > 0) {
        qs.set("via", viaIds.join(","));
      }
      const res = await fetch(`${apiBase}/path?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        notification.error({ message: "规划失败", description: data?.error || "后端错误" });
        return;
      }
      set({ route: data as PathResult });
    } catch {
      notification.error({ message: "规划失败", description: "网络异常或后端不可用" });
    } finally {
      set({ routeLoading: false });
    }
  },
}));
