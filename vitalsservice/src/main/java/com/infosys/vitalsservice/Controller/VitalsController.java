package com.infosys.vitalsservice.Controller;

import com.infosys.vitalsservice.Service.VitalsService;
import com.infosys.vitalsservice.dto.VitalsRequestDTO;
import com.infosys.vitalsservice.dto.VitalsResponseDTO;
import com.infosys.vitalsservice.kafka.WearableDataProducer;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vitals")
public class VitalsController {

    @Autowired
    private VitalsService service;

    @Autowired
    private WearableDataProducer wearableDataProducer;

    @PostMapping("/save")
    public VitalsResponseDTO save(@Valid @RequestBody VitalsRequestDTO dto) {

        return service.save(dto);
    }

    @GetMapping("/all")
    public List<VitalsResponseDTO> getAll() {

        return service.getAll();
    }

    @GetMapping("/{id}")
    public VitalsResponseDTO getById(@PathVariable UUID id) {

        return service.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<VitalsResponseDTO> getByPatientId(@PathVariable UUID patientId) {

        return service.getByPatientId(patientId);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable UUID id) {

        service.delete(id);

        return "Vitals Deleted Successfully";
    }
    @GetMapping("/latest/{patientId}")
    public VitalsResponseDTO getLatest(@PathVariable UUID patientId) {

        return service.getLatestByPatientId(patientId);
    }

    // Simulates a wearable device streaming vitals data in real time via Kafka.
    // The reading is published to Kafka and saved asynchronously by the consumer.
    @PostMapping("/wearable/publish")
    public String publishFromWearable(@Valid @RequestBody VitalsRequestDTO dto) {

        wearableDataProducer.publish(dto);

        return "Wearable vitals data published to Kafka successfully";
    }
}