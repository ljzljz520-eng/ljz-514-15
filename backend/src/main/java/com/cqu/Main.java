package com.cqu;

import com.cqu.handler.RequestHandler;
import com.cqu.model.Node;
import com.cqu.model.RouteTemplate;
import com.cqu.service.DataLoader;
import com.cqu.service.Db;
import com.cqu.service.GraphService;
import com.cqu.service.NodeRepository;
import com.sun.net.httpserver.HttpServer;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Main {
    private static final Logger logger = Logger.getLogger(Main.class.getName());

    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));

        Db db = new Db();
        NodeRepository repo = new NodeRepository(db.emf());
        DataLoader dataLoader = new DataLoader();

        if (!repo.hasAnyNodes()) {
            repo.saveAll(dataLoader.loadNodeList());
            logger.log(Level.INFO, "Seeded nodes into database from nodes.csv");
        }

        Map<String, Node> nodeMap = repo.findAllAsMap();
        GraphService graphService = new GraphService(nodeMap, dataLoader.loadEdgeListOrEmpty());

        List<RouteTemplate> templates = validateTemplates(dataLoader.loadTemplateList(), nodeMap);
        logger.log(Level.INFO, "Loaded " + templates.size() + " route templates from templates.csv");

        RequestHandler handler = new RequestHandler(graphService, templates);

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/health", handler::handleHealth);
        server.createContext("/api/nodes", handler::handleNodes);
        server.createContext("/api/templates", handler::handleTemplates);
        server.createContext("/api/path", handler::handlePath);
        server.setExecutor(Executors.newFixedThreadPool(Math.max(4, Runtime.getRuntime().availableProcessors())));
        server.start();
        logger.log(Level.INFO, "Backend started on port " + port);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                server.stop(0);
            } catch (Exception ignored) {
            }
            try {
                db.close();
            } catch (Exception ignored) {
            }
        }));
    }

    private static List<RouteTemplate> validateTemplates(List<RouteTemplate> raw, Map<String, Node> nodeMap) {
        List<RouteTemplate> valid = new ArrayList<>();
        for (RouteTemplate t : raw) {
            if (!nodeMap.containsKey(t.getStartId()) || !nodeMap.containsKey(t.getEndId())) {
                logger.log(Level.WARNING, "Skip template " + t.getId() + ": start/end node not found");
                continue;
            }
            List<String> validVia = new ArrayList<>();
            for (String viaId : t.getViaIds()) {
                if (nodeMap.containsKey(viaId)) {
                    validVia.add(viaId);
                } else {
                    logger.log(Level.WARNING, "Template " + t.getId() + " references unknown via node: " + viaId);
                }
            }
            valid.add(new RouteTemplate(t.getId(), t.getName(), t.getDesc(), t.getStartId(), t.getEndId(), validVia));
        }
        return valid;
    }
}
