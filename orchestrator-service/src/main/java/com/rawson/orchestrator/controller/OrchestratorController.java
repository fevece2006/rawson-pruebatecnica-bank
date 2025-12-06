package com.rawson.orchestrator.controller;

import com.rawson.orchestrator.domain.TransferSaga;
import com.rawson.orchestrator.dto.TransferRequest;
import com.rawson.orchestrator.service.OrchestratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 Controller pÃºblico del Orchestrator.
*/
@RestController
@RequestMapping("/api/v1/transfer")
public class OrchestratorController {

    private final OrchestratorService service;

    public OrchestratorController(OrchestratorService service) {
        this.service = service;
    }

    @PostMapping("/start")
    public ResponseEntity<TransferSaga> start(@RequestBody TransferRequest req) {
        TransferSaga saga = service.startTransfer(req);
        return ResponseEntity.ok(saga);
    }
}
