// Node 26 define un localStorage global sin implementar que tapa el de jsdom,
// así que las pruebas lo reemplazan con vi.stubGlobal('localStorage', ...).
export function crearAlmacenamientoFalso(): Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem' | 'clear'
> {
  const datos = new Map<string, string>();
  return {
    getItem: (clave: string) => datos.get(clave) ?? null,
    setItem: (clave: string, valor: string) => {
      datos.set(clave, valor);
    },
    removeItem: (clave: string) => {
      datos.delete(clave);
    },
    clear: () => datos.clear(),
  };
}
