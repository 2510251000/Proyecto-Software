-- ============================================================================
--  Al Día: Portal de Noticias
--  V6: Silvania entra al catálogo de ciudades.
--
--  Las noticias iniciales de la aplicación (datos-iniciales/noticias) incluyen
--  una de Silvania, que no estaba en V2. Las coordenadas y el id del lugar son
--  los que devuelve Nominatim (OpenStreetMap). Si la ciudad ya existe, porque
--  alguien la eligió en el mapa, no se hace nada.
-- ============================================================================

INSERT INTO ciudad (nombre, departamento, latitud, longitud, id_lugar)
VALUES ('Silvania', 'Cundinamarca', 4.46950662, -74.38394900, 'osm:R1354793')
ON CONFLICT DO NOTHING;
