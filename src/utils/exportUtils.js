import proj4 from 'proj4';

// Definición para UTM Zona 17 Sur (Santo Domingo, Ecuador)
const UTM17S = '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs';
const WGS84 = 'EPSG:4326';

// Función para aplanar objetos anidados (útil para que QGIS lea todas las columnas)
const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else if (Array.isArray(obj[k])) {
      // Si es un array (ej. inspecciones), tomamos el primero o lo convertimos a string
      if (obj[k].length > 0 && typeof obj[k][0] === 'object') {
        Object.assign(acc, flattenObject(obj[k][0], pre + k));
      } else {
        acc[pre + k] = JSON.stringify(obj[k]);
      }
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

export const convertToGeoJSON = (data, latCol = 'utm_norte', lngCol = 'utm_este') => {
  const features = data.map((item) => {
    const norte = parseFloat(item[latCol]);
    const este = parseFloat(item[lngCol]);

    const hasCoordinates = !isNaN(norte) && !isNaN(este);
    
    let lng = este;
    let lat = norte;

    // Convertir UTM a Lat/Lng si las coordenadas parecen ser UTM (números grandes)
    if (hasCoordinates && (este > 1000 || este < -1000 || norte > 1000 || norte < -1000)) {
      try {
        const [wgsLng, wgsLat] = proj4(UTM17S, WGS84, [este, norte]);
        lng = wgsLng;
        lat = wgsLat;
      } catch (e) {
        console.error("Error convirtiendo coordenadas UTM:", e);
      }
    }

    const flattenedProps = flattenObject(item);

    return {
      type: 'Feature',
      geometry: hasCoordinates
        ? {
            type: 'Point',
            coordinates: [lng, lat],
          }
        : null,
      properties: flattenedProps,
    };
  });

  return {
    type: 'FeatureCollection',
    name: 'Exportacion_Alcantarillas',
    crs: { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    features,
  };
};

export const downloadGeoJSON = (geoJSONData, filename = 'exportacion.geojson') => {
  const blob = new Blob([JSON.stringify(geoJSONData, null, 2)], {
    type: 'application/geo+json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const convertToCSV = (data, latCol = 'utm_norte', lngCol = 'utm_este') => {
  if (!data || data.length === 0) return '';

  const rows = data.map(item => {
    const flattened = flattenObject(item);
    
    const norte = parseFloat(item[latCol]);
    const este = parseFloat(item[lngCol]);

    if (!isNaN(norte) && !isNaN(este)) {
      if (este > 1000 || este < -1000 || norte > 1000 || norte < -1000) {
        try {
          const [wgsLng, wgsLat] = proj4(UTM17S, WGS84, [este, norte]);
          flattened['lng_wgs84'] = wgsLng;
          flattened['lat_wgs84'] = wgsLat;
        } catch (e) {
          console.error("Error convirtiendo coordenadas UTM:", e);
        }
      } else {
        flattened['lng_wgs84'] = este;
        flattened['lat_wgs84'] = norte;
      }
    }
    
    return flattened;
  });

  // Obtener todas las columnas únicas de todos los objetos
  const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row))));

  const csvRows = [];
  // Fila de encabezado
  csvRows.push(headers.join(','));

  // Filas de datos
  for (const row of rows) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) {
        return '';
      }
      val = String(val);
      // Escapar comillas dobles y comas
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

export const downloadCSV = (csvData, filename = 'exportacion.csv') => {
  const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for Excel UTF-8 BOM
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
