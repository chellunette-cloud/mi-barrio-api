import type { Barrio, BarrioGeometria } from '../src/contracts/types.js';

export const barrio: Barrio = {
  slug: 'ciudad-granada',
  nombre: 'URBANIZACION CIUDAD GRANADA',
  nombreMostrar: 'Ciudad Granada',
  codigoId: 'LEG00645',
  localidad: { codigo: '08', nombre: 'Kennedy' },
  upz: { codigo: '82', nombre: 'Patio Bonito' },
  upl: 'UPL14',
  area: { hectareas: 9.1, metrosCuadrados: 94551.13 },
  lotes: 705,
  poblacion: { valor: 3807, tipo: 'estimacion', etiqueta: 'Estimación del registro del barrio' },
  densidad: 77.4725,
  estratoPredominante: 2,
  manzanasEstrato2: 34,
  centroide: { lat: 4.641833, lon: -74.171758 },
  limites: { norte: 4.6431, sur: 4.6405, este: -74.1701, oeste: -74.1734 },
  actualizadoEn: '2026-11-15T12:00:00Z',
  fuentes: [
    {
      codigo: 'F-01',
      entidad: 'SDP/UAECD',
      url: 'https://example.test/f01',
      fechaConsulta: '2026-11-15',
      licencia: 'CC BY 4.0',
      campos: ['area', 'lotes', 'nombre', 'poblacion']
    },
    {
      codigo: 'F-02',
      entidad: 'SDP/UAECD',
      url: 'https://example.test/f02',
      fechaConsulta: '2026-11-15',
      licencia: 'CC BY 4.0',
      campos: ['estrato', 'manzanas_estrato2']
    }
  ]
};

export const geometria: BarrioGeometria = {
  slug: barrio.slug,
  nombre: barrio.nombre,
  codigoId: barrio.codigoId,
  geometria: {
    type: 'Polygon',
    coordinates: [[[-74.1734, 4.6405], [-74.1701, 4.6405], [-74.1701, 4.6431], [-74.1734, 4.6431], [-74.1734, 4.6405]]]
  },
  centroide: barrio.centroide,
  limites: barrio.limites,
  area: barrio.area,
  vertices: 58,
  srid: 4326,
  actualizadoEn: barrio.actualizadoEn,
  fuente: barrio.fuentes[0]!
};
