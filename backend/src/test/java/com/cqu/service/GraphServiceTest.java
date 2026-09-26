package com.cqu.service;

import com.cqu.model.Node;
import com.cqu.model.PathResult;
import com.cqu.model.RouteTemplate;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class GraphServiceTest {
    @Test
    void shortestPathReturnsValidResult() {
        Map<String, Node> nodes = Map.of(
                "A", new Node("A", "A", 29.56301, 106.57577, "t", "d"),
                "B", new Node("B", "B", 29.56470, 106.58169, "t", "d"),
                "C", new Node("C", "C", 29.56336, 106.58713, "t", "d")
        );
        GraphService g = new GraphService(nodes);
        PathResult r = g.shortestPath("A", "C");
        assertNotNull(r);
        assertEquals("A", r.getStartId());
        assertEquals("C", r.getEndId());
        assertFalse(r.getPathNodeIds().isEmpty());
        assertEquals(r.getPathNodeIds().size(), r.getPathNodes().size());
        assertNotNull(r.getViaNodeIds());
        assertTrue(r.getViaNodeIds().isEmpty());
    }

    @Test
    void shortestPathWithViaPassesThroughWaypointsInOrder() {
        Map<String, Node> nodes = Map.of(
                "A", new Node("A", "A", 29.56000, 106.57000, "t", "d"),
                "B", new Node("B", "B", 29.56100, 106.57100, "t", "d"),
                "C", new Node("C", "C", 29.56200, 106.57200, "t", "d"),
                "D", new Node("D", "D", 29.56300, 106.57300, "t", "d")
        );
        GraphService g = new GraphService(nodes);
        PathResult r = g.shortestPath("A", "D", List.of("B", "C"));

        assertEquals("A", r.getStartId());
        assertEquals("D", r.getEndId());
        assertEquals(List.of("B", "C"), r.getViaNodeIds());

        List<String> ids = r.getPathNodeIds();
        assertEquals("A", ids.get(0));
        assertEquals("D", ids.get(ids.size() - 1));
        assertTrue(ids.indexOf("B") < ids.indexOf("C"), "途经点顺序应保持 B 在 C 之前");
        assertEquals(ids.size(), r.getPathNodes().size());
        assertEquals(ids.size() - 1, r.getSegmentDistanceMeters().size());

        double legSum = r.getSegmentDistanceMeters().stream().mapToDouble(Double::doubleValue).sum();
        assertEquals(legSum, r.getTotalDistanceMeters(), 1e-6);
    }

    @Test
    void shortestPathWithUnknownViaThrows() {
        Map<String, Node> nodes = Map.of(
                "A", new Node("A", "A", 29.56301, 106.57577, "t", "d"),
                "B", new Node("B", "B", 29.56470, 106.58169, "t", "d")
        );
        GraphService g = new GraphService(nodes);
        assertThrows(IllegalArgumentException.class, () -> g.shortestPath("A", "B", List.of("NOPE")));
    }

    @Test
    void templatesLoadFromCsv() {
        DataLoader loader = new DataLoader();
        List<RouteTemplate> templates = loader.loadTemplateList();
        assertEquals(4, templates.size());
        for (RouteTemplate t : templates) {
            assertFalse(t.getId().isBlank());
            assertFalse(t.getName().isBlank());
            assertFalse(t.getStartId().isBlank());
            assertFalse(t.getEndId().isBlank());
            assertNotNull(t.getViaIds());
        }
    }
}
