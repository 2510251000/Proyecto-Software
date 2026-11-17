-- ============================================================================
--  Al Día: Portal de Noticias
--  V8: los archivos de las fotos pueden vivir en la base de datos.
--
--  En el despliegue gratuito (Render) el disco del servidor se borra en cada
--  reinicio: con IMAGENES_ALMACEN=base-datos las fotos (ya reducidas y en
--  WebP o JPEG, de unos cientos de KB) se guardan aquí y sobreviven. En Docker
--  y en local se siguen guardando en disco y esta tabla queda vacía.
-- ============================================================================

CREATE TABLE archivo_imagen (
    clave     VARCHAR(64) PRIMARY KEY,
    contenido BYTEA       NOT NULL,
    creado    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE archivo_imagen IS
    'Archivo de cada foto cuando el almacén es la base de datos. La clave es la de multimedia.url.';
