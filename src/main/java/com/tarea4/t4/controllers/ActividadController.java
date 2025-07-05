package com.tarea4.t4.controllers;

import com.tarea4.t4.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/actividades")
public class ActividadController {

    @Autowired
    private ActividadRepository actividadRepository;

    @Autowired
    private NotaRepository notaRepository;

    @GetMapping("/finalizadas")
    public List<Map<String, Object>> obtenerActividadesFinalizadas() {
        List<Actividad> actividades = actividadRepository.findByDiaHoraTerminoBefore(LocalDateTime.now());
        
        return actividades.stream().map(actividad -> {
            Map<String, Object> actividadMap = new HashMap<>();
            actividadMap.put("id", actividad.getId());
            actividadMap.put("nombre", actividad.getNombre());
            actividadMap.put("fechaInicio", actividad.getDiaHoraInicio().toString());
            actividadMap.put("sector", actividad.getSector());
            actividadMap.put("tema", actividad.getTema()); // Ahora es un campo directo
            
            // Calcular promedio de notas
            List<Nota> notas = actividad.getNotas();
            double promedio = notas.isEmpty() ? 0.0 : 
                notas.stream().mapToInt(Nota::getNota).average().orElse(0.0);
            actividadMap.put("nota", String.format("%.1f", promedio));
            
            return actividadMap;
        }).collect(Collectors.toList());
    }

    @PostMapping("/{id}/notas")
    public ResponseEntity<?> agregarNota(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Optional<Actividad> actividadOpt = actividadRepository.findById(id);
        if (!actividadOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Actividad actividad = actividadOpt.get();
        
        Nota nota = new Nota();
        nota.setActividad(actividad);
        nota.setNota(request.get("nota"));
        
        notaRepository.save(nota);
        
        return ResponseEntity.ok().build();
    }
}
