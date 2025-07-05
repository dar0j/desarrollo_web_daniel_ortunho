package com.tarea4.t4.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Actividad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private LocalDateTime diaHoraInicio;

    @Column(nullable = false)
    private LocalDateTime diaHoraTermino;

    private String sector;
    
    private String tema;

    @OneToMany(mappedBy = "actividad", cascade = CascadeType.ALL)
    private List<Nota> notas;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public LocalDateTime getDiaHoraInicio() { return diaHoraInicio; }
    public void setDiaHoraInicio(LocalDateTime diaHoraInicio) { this.diaHoraInicio = diaHoraInicio; }
    
    public LocalDateTime getDiaHoraTermino() { return diaHoraTermino; }
    public void setDiaHoraTermino(LocalDateTime diaHoraTermino) { this.diaHoraTermino = diaHoraTermino; }
    
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    
    public String getTema() { return tema; }
    public void setTema(String tema) { this.tema = tema; }
    
    public List<Nota> getNotas() { return notas; }
    public void setNotas(List<Nota> notas) { this.notas = notas; }
}
