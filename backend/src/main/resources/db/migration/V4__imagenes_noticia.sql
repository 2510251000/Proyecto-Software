-- ============================================================================
--  V4: fotos de las noticias (HU MF02_003).
--  La tabla multimedia ya existe desde V1. Se le agrega la descripción de la foto
--  (texto alternativo para lectores de pantalla) y un orden único por noticia.
--  En «url» se guarda la clave del archivo en el almacén, no una URL pública.
-- ============================================================================

ALTER TABLE multimedia ADD COLUMN IF NOT EXISTS texto_alternativo VARCHAR(250);

CREATE UNIQUE INDEX IF NOT EXISTS ux_multimedia_noticia_orden ON multimedia (noticia_id, orden);
