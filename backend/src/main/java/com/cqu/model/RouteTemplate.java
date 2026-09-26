package com.cqu.model;

import java.util.List;

public class RouteTemplate {
    private String id;
    private String name;
    private String desc;
    private String startId;
    private String endId;
    private List<String> viaIds;

    public RouteTemplate() {
    }

    public RouteTemplate(String id, String name, String desc, String startId, String endId, List<String> viaIds) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.startId = startId;
        this.endId = endId;
        this.viaIds = viaIds == null ? List.of() : List.copyOf(viaIds);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getStartId() {
        return startId;
    }

    public void setStartId(String startId) {
        this.startId = startId;
    }

    public String getEndId() {
        return endId;
    }

    public void setEndId(String endId) {
        this.endId = endId;
    }

    public List<String> getViaIds() {
        return viaIds;
    }

    public void setViaIds(List<String> viaIds) {
        this.viaIds = viaIds == null ? List.of() : List.copyOf(viaIds);
    }
}
