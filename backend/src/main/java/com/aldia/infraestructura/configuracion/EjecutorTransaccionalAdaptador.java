package com.aldia.infraestructura.configuracion;

import java.util.function.Supplier;

import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.aldia.dominio.puerto.salida.EjecutorTransaccionalPuerto;

/**
 * Transacciones de Spring detrás del puerto: los casos de uso no conocen Spring.
 */
@Component
public class EjecutorTransaccionalAdaptador implements EjecutorTransaccionalPuerto {

    private final TransactionTemplate plantilla;

    public EjecutorTransaccionalAdaptador(PlatformTransactionManager administrador) {
        this.plantilla = new TransactionTemplate(administrador);
    }

    @Override
    public <T> T ejecutar(Supplier<T> bloque) {
        return plantilla.execute(estado -> bloque.get());
    }
}
