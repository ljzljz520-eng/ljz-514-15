/**
 * 热门路线模板。
 *
 * 注意：模板只声明“起点 / 终点 / 途经偏好”的节点 ID，
 * 具体途经哪些景点、顺序如何，仍由后端 `/api/path` 根据图数据实时计算，
 * 前端不写死任何景点序列。
 */
export type RouteTemplate = {
  id: string;
  name: string;
  desc: string;
  startId: string;
  endId: string;
  viaIds: string[];
};

export const routeTemplates: RouteTemplate[] = [
  {
    id: "night-half-day",
    name: "夜景半日",
    desc: "傍晚逛洪崖洞、朝天门，登南山看夜景",
    startId: "JIEFANGBEI",
    endId: "NANSHAN",
    viaIds: ["HONGYADONG", "CHAO_TIAN_MEN"],
  },
  {
    id: "family-relaxed",
    name: "亲子轻松",
    desc: "鹅岭公园散步，动物园看大熊猫",
    startId: "JIEFANGBEI",
    endId: "CHONGQING_ZOO",
    viaIds: ["ELINGPARK"],
  },
  {
    id: "old-street-photo",
    name: "老街拍照",
    desc: "轻轨穿楼出发，漫步磁器口老街",
    startId: "LIZIBA",
    endId: "CIFENGLOU",
    viaIds: ["CIQIKOU_BACKHILL"],
  },
  {
    id: "first-visit",
    name: "首次来渝",
    desc: "大礼堂、李子坝、洪崖洞经典打卡",
    startId: "JIEFANGBEI",
    endId: "HONGYADONG",
    viaIds: ["PEOPLE_GREAT_HALL", "LIZIBA"],
  },
];
