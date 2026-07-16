package com.infosys.modelservice.service;

import com.infosys.modelservice.entity.ModelInfo;
import com.infosys.modelservice.repository.ModelRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ModelService {

    @Autowired
    private ModelRepository repository;

    @PostConstruct
    public void seedDefaultModel() {
        if (repository.count() == 0) {
            ModelInfo defaultModel = new ModelInfo("1.0", 91.4, "2026-07-12", "ACTIVE");
            repository.save(defaultModel);
        }
    }

    public ModelInfo addModel(ModelInfo model) {
        if (model.getCreatedDate() == null) {
            model.setCreatedDate(LocalDate.now().toString());
        }
        if (model.getStatus() == null) {
            model.setStatus("INACTIVE");
        }
        return repository.save(model);
    }

    public List<ModelInfo> getAllModels() {
        return repository.findAll();
    }

    public ModelInfo getLatestActiveModel() {
        List<ModelInfo> all = repository.findAll();
        // Return active one, or fallback to latest in list
        return all.stream()
                .filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()))
                .findFirst()
                .orElse(all.isEmpty() ? null : all.get(all.size() - 1));
    }

    public ModelInfo activateModel(String version) {
        List<ModelInfo> all = repository.findAll();
        ModelInfo activated = null;
        for (ModelInfo m : all) {
            if (m.getVersion().equalsIgnoreCase(version)) {
                m.setStatus("ACTIVE");
                activated = repository.save(m);
            } else {
                m.setStatus("INACTIVE");
                repository.save(m);
            }
        }
        if (activated == null) {
            throw new RuntimeException("Model version not found: " + version);
        }
        return activated;
    }

    public void deleteModel(String version) {
        repository.deleteById(version);
    }
}
