import React from 'react';
import proj4 from 'proj4';
import './FichaTecnica.css';

const UTM17S = '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs';
const WGS84 = 'EPSG:4326';

const FichaTecnica = ({ data, onClose, onEdit }) => {
  if (!data) return null;

  // Extraer información directamente de la raíz según el nuevo esquema
  const muros = data.muro_ala && data.muro_ala.length > 0 ? data.muro_ala[0] : {};
  const murosCabezal = data.muro_cabezal && data.muro_cabezal.length > 0 ? data.muro_cabezal[0] : {};
  const tuberia = data.tuberia && data.tuberia.length > 0 ? data.tuberia[0] : {};
  const pozo = data.pozo_recoleccion && data.pozo_recoleccion.length > 0 ? data.pozo_recoleccion[0] : {};
  const foto = data.fotografia && data.fotografia.length > 0 ? data.fotografia[0] : {};

  let lat = null;
  let lng = null;
  const norte = parseFloat(data.utm_norte);
  const este = parseFloat(data.utm_este);
  if (!isNaN(norte) && !isNaN(este) && (este > 1000 || norte > 1000)) {
    try {
      const [wgsLng, wgsLat] = proj4(UTM17S, WGS84, [este, norte]);
      lng = wgsLng;
      lat = wgsLat;
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="ficha-overlay" onClick={onClose}>
      <div className="ficha-modal" onClick={e => e.stopPropagation()}>
        <div className="ficha-header-actions">
          <div className="ficha-header-title">Detalles de Alcantarilla</div>
          <div className="ficha-actions-group">
            {onEdit && <button className="btn btn-primary" onClick={() => onEdit(data)} style={{ padding: '8px 16px', fontSize: '14px' }}>Editar Ficha</button>}
            <button className="close-btn" onClick={onClose}>Cerrar</button>
          </div>
        </div>
        
        <div className="ficha-content" id="ficha-print-area">
          <table className="ficha-table">
            <tbody>
              {/* Header */}
              <tr>
                <td colSpan="6" className="ficha-title" style={{ padding: '20px' }}>
                  PONTIFICIA UNIVERSIDAD CATOLICA DEL ECUADOR
                </td>
              </tr>
              <tr>
                <td colSpan="5" className="bg-blue ficha-title">FICHA TÉCNICA - ALCANTARILLA</td>
                <td className="bg-light-blue">N# {data.numero_ficha || data.id || 'S/N'}</td>
              </tr>
              
              {/* Ubicacion */}
              <tr>
                <td className="bg-blue">Ubicación</td>
                <td className="bg-light-blue">Parroquia</td>
                <td>{data.parroquia || 'NA'}</td>
                <td className="bg-light-blue">Cantón</td>
                <td>{data.canton || 'NA'}</td>
                <td>Provincia: {data.provincia || 'NA'}</td>
              </tr>
              <tr>
                <td className="bg-blue">Fecha</td>
                <td colSpan="2">{data.fecha || 'NA'}</td>
                <td className="bg-light-blue">Tramo vial</td>
                <td colSpan="2">{data.tramo_vial || 'NA'}</td>
              </tr>
              
              <tr>
                <td colSpan="6" className="bg-blue ficha-title">INFRAESTRUCTURA EXISTENTE</td>
              </tr>

              {/* Muros y Tubería */}
              <tr>
                <td colSpan="3" className="bg-light-blue">MUROS DE ALA</td>
                <td colSpan="3" className="bg-light-blue">TUBERÍA</td>
              </tr>
              
              <tr>
                <td className="bg-light-blue">Dimensiones</td>
                <td colSpan="2" className="bg-light-blue">Material</td>
                <td colSpan="3" className="bg-light-blue">Material</td>
              </tr>

              <tr>
                <td>Longitud</td>
                <td>{muros.longitud_m || 'NA'} m</td>
                <td>ID: {muros.material_id || 'NA'}</td>
                <td colSpan="3">ID Material Tubería: {tuberia.material_id || 'NA'}</td>
              </tr>
              <tr>
                <td>Espesor</td>
                <td>{muros.espesor_m || 'NA'} m</td>
                <td></td>
                <td colSpan="3" className="bg-light-blue">Dimensiones</td>
              </tr>

              <tr>
                <td colSpan="2" className="bg-light-blue">Solera</td>
                <td className="bg-light-blue">Estado</td>
                <td className="bg-light-blue">Longitud</td>
                <td colSpan="2">{tuberia.longitud_m || 'NA'} m</td>
              </tr>
              <tr>
                <td colSpan="2">Si [{muros.tiene_solera ? 'X' : ' '}] No [{!muros.tiene_solera ? 'X' : ' '}]</td>
                <td>ID: {muros.estado_id || 'NA'}</td>
                <td className="bg-light-blue">Diametro</td>
                <td>{tuberia.diametro_m || 'NA'} m</td>
                <td>Est ID: {tuberia.estado_id || 'NA'}</td>
              </tr>

              {/* Muro Cabezal */}
              <tr>
                <td colSpan="6" className="bg-light-blue">MURO CABEZAL</td>
              </tr>
              <tr>
                <td rowSpan="2" className="bg-light-blue">Dimensiones</td>
                <td className="bg-light-blue">Longitud</td>
                <td>{murosCabezal.longitud_m || 'NA'}</td>
                <td rowSpan="2" className="bg-light-blue">Estado</td>
                <td rowSpan="2" colSpan="2">ID: {murosCabezal.estado_id || 'NA'}</td>
              </tr>
              <tr>
                <td className="bg-light-blue">Espesor</td>
                <td>{murosCabezal.espesor_m || 'NA'}</td>
              </tr>

              {/* Pozos de recoleccion */}
              <tr>
                <td colSpan="6" className="bg-light-blue">Pozo de recolección</td>
              </tr>
              <tr>
                <td>Si [{pozo.tiene_pozo ? 'X' : ' '}]</td>
                <td rowSpan="2" className="bg-light-blue">Dimensiones</td>
                <td className="bg-light-blue">Ancho</td>
                <td>{pozo.ancho_m || 'NA'}</td>
                <td className="bg-light-blue" rowSpan="2">ESTADO</td>
                <td rowSpan="2">ID: {pozo.estado_id || 'NA'}</td>
              </tr>
              <tr>
                <td>NO [{!pozo.tiene_pozo ? 'X' : ' '}]</td>
                <td className="bg-light-blue">Largo</td>
                <td>{pozo.largo_m || 'NA'}</td>
              </tr>

              {/* Fotografia */}
              <tr>
                <td colSpan="6" className="text-left">Fotografía</td>
              </tr>
              <tr>
                <td colSpan="6" className="foto-container" style={{ padding: '10px' }}>
                  {foto.storage_path ? (
                    <img src={foto.storage_path} alt="Alcantarilla" />
                  ) : (
                    <div style={{ height: '200px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Sin fotografía
                    </div>
                  )}
                </td>
              </tr>

              {/* Coordenadas Georreferenciadas */}
              <tr>
                <td colSpan="6" className="bg-blue ficha-title">GEORREFERENCIACIÓN Y UBICACIÓN ESPACIAL</td>
              </tr>
              <tr>
                <td rowSpan="4" className="bg-light-blue" style={{ verticalAlign: 'middle' }}>Coordenadas</td>
                <td colSpan="2" className="bg-blue" style={{ color: '#fff' }}>UTM Zona 17S</td>
                <td colSpan="3" className="bg-blue" style={{ color: '#fff' }}>WGS84 (Global Lat/Lng)</td>
              </tr>
              <tr>
                <td colSpan="2" className="bg-light-blue">ESTE (X)</td>
                <td colSpan="3" className="bg-light-blue">LONGITUD</td>
              </tr>
              <tr>
                <td colSpan="2">{data.utm_este || 'NA'}</td>
                <td colSpan="3">{lng ? lng.toFixed(6) : 'NA'}</td>
              </tr>
              <tr>
                <td colSpan="2" className="bg-light-blue">NORTE (Y)</td>
                <td colSpan="3" className="bg-light-blue">LATITUD</td>
              </tr>
              <tr>
                <td style={{ borderTop: 'none', borderRight: 'none' }}></td>
                <td colSpan="2">{data.utm_norte || 'NA'}</td>
                <td colSpan="3">{lat ? lat.toFixed(6) : 'NA'}</td>
              </tr>

              {/* Observaciones */}
              <tr>
                <td className="bg-light-blue">Observaciones</td>
                <td colSpan="5" className="text-left" style={{ height: '60px', verticalAlign: 'top' }}>
                  {data.observaciones || ''}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FichaTecnica;
