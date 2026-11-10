-- ============================================================================
--  Al Día: Portal de Noticias
--  V5: la calificación pasa de la noticia al autor.
--
--  Antes cada lector le daba de 1 a 5 estrellas a una noticia. Ahora, en cada
--  noticia, el lector dice si el autor debe seguir publicando así (recomienda =
--  TRUE) o si no le gustó lo que publicó (recomienda = FALSE). La aprobación de
--  un autor es el porcentaje de votos TRUE sobre todos los votos de sus noticias.
--
--  Sigue habiendo un voto por lector y noticia (uq_calificacion_usuario_noticia):
--  si cambia de opinión, se actualiza la misma fila.
-- ============================================================================

ALTER TABLE calificacion ADD COLUMN recomienda BOOLEAN;

-- Las calificaciones que ya existían: 4 o 5 estrellas cuentan como «sigue así».
UPDATE calificacion SET recomienda = (valor >= 4);

ALTER TABLE calificacion ALTER COLUMN recomienda SET NOT NULL;
ALTER TABLE calificacion DROP CONSTRAINT ck_calificacion_valor;
ALTER TABLE calificacion DROP COLUMN valor;

COMMENT ON COLUMN calificacion.recomienda IS
    'TRUE: el lector quiere que el autor siga publicando así. FALSE: no le gustó lo que publicó.';

-- La aprobación se calcula por autor con el índice idx_noticia_usuario que ya existe (V1).
