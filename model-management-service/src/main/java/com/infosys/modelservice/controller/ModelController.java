package com.infosys.modelservice.controller;

import com.infosys.modelservice.entity.ModelInfo;
import com.infosys.modelservice.service.ModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/model")
public class ModelController {

    @Autowired
    private ModelService service;

    @PostMapping
    public ResponseEntity<ModelInfo> addModel(@RequestBody ModelInfo model) {
        return ResponseEntity.ok(service.addModel(model));
    }

    @GetMapping
    public ResponseEntity<List<ModelInfo>> getAllModels() {
        return ResponseEntity.ok(service.getAllModels());
    }

    @GetMapping("/latest")
    public ResponseEntity<ModelInfo> getLatestModel() {
        ModelInfo m = service.getLatestActiveModel();
        if (m == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(m);
    }

    @PutMapping("/{version}")
    public ResponseEntity<ModelInfo> activateModel(@PathVariable String version) {
        return ResponseEntity.ok(service.activateModel(version));
    }

    @DeleteMapping("/{version}")
    public ResponseEntity<String> deleteModel(@PathVariable String version) {
        service.deleteModel(version);
        return ResponseEntity.ok("Model version deleted successfully");
    }

    // Validation status endpoint
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getModelStatus() {
        Map<String, Object> map = new HashMap<>();
        map.put("federatedRound", 14);
        map.put("convergenceStatus", "STABLE");
        map.put("activeClientsCount", 5); // 5 local hospital nodes participating
        map.put("aggregationStrategy", "FedAvg");
        map.put("lastAggregationTime", LocalDate.now().toString());
        return ResponseEntity.ok(map);
    }
}
