package com.tarea4.t4.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EvaluarController {
    
    @GetMapping("/evaluar")
    public String mostrarEvaluar() {
        return "Evaluar";
    }
}
