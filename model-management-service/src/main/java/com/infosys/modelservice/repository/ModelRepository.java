package com.infosys.modelservice.repository;

import com.infosys.modelservice.entity.ModelInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModelRepository extends MongoRepository<ModelInfo, String> {
}
