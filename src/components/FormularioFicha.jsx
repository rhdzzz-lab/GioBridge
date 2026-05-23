import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Loader2, MapPin, HardHat, FileImage, ClipboardList } from 'lucide-react';
import './Formulario.css';

const FormularioFicha = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Estados del Formulario
  const [ficha, setFicha] = useState({
    numero_ficha: '',
    fecha: new Date().toISOString().split('T')[0],
    provincia: '',
    canton: '',
    parroquia: '',
    tramo_vial: '',
    utm_este: '',
    utm_norte: '',
    observaciones: ''
  });

  const [muroAla, setMuroAla] = useState({
    longitud_m: '', espesor_m: '', tiene_solera: false, material_id: '1', estado_id: '1'
  });

  const [muroCabezal, setMuroCabezal] = useState({
    existe: true, longitud_m: '', espesor_m: '', estado_id: '1'
  });

  const [tuberia, setTuberia] = useState({
    longitud_m: '', diametro_m: '', material_id: '1', estado_id: '1'
  });

  const [pozo, setPozo] = useState({
    existe: false, ancho_m: '', largo_m: '', estado_id: '1'
  });

  const [fotoFile, setFotoFile] = useState(null);

  // Catálogos (IDs asumidos según plan)
  const estados = [
    { id: '1', nombre: 'Bueno' },
    { id: '2', nombre: 'Regular' },
    { id: '3', nombre: 'Malo' }
  ];

  const materialesMuro = [
    { id: '1', nombre: 'H. Simple' },
    { id: '2', nombre: 'H. Ciclopeo' },
    { id: '3', nombre: 'H. Armado' },
    { id: '4', nombre: 'Muro Gavión' }
  ];

  const materialesTuberia = [
    { id: '1', nombre: 'Cemento' },
    { id: '2', nombre: 'PVC' },
    { id: '3', nombre: 'M. Corrugado' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!ficha.utm_este || !ficha.utm_norte) {
        throw new Error("Las coordenadas UTM (Este y Norte) son obligatorias.");
      }

      // 1. Insertar Ficha Alcantarilla (Maestra)
      const { data: fichaData, error: fichaErr } = await supabase
        .from('ficha_alcantarilla')
        .insert({
          numero_ficha: ficha.numero_ficha || null,
          fecha: ficha.fecha,
          provincia: ficha.provincia || null,
          canton: ficha.canton || null,
          parroquia: ficha.parroquia || null,
          tramo_vial: ficha.tramo_vial || null,
          utm_este: parseFloat(ficha.utm_este),
          utm_norte: parseFloat(ficha.utm_norte),
          observaciones: ficha.observaciones || null
        })
        .select()
        .single();
      
      if (fichaErr) throw new Error("Error guardando ficha principal: " + fichaErr.message);
      const fichaId = fichaData.id;

      // 2. Inserciones paralelas de infraestructura
      const promesas = [];

      // Muro Ala
      promesas.push(supabase.from('muro_ala').insert({
        ficha_id: fichaId,
        longitud_m: parseFloat(muroAla.longitud_m) || null,
        espesor_m: parseFloat(muroAla.espesor_m) || null,
        tiene_solera: muroAla.tiene_solera,
        material_id: parseInt(muroAla.material_id),
        estado_id: parseInt(muroAla.estado_id)
      }));

      // Muro Cabezal
      if (muroCabezal.existe) {
        promesas.push(supabase.from('muro_cabezal').insert({
          ficha_id: fichaId,
          longitud_m: parseFloat(muroCabezal.longitud_m) || null,
          espesor_m: parseFloat(muroCabezal.espesor_m) || null,
          estado_id: parseInt(muroCabezal.estado_id)
        }));
      }

      // Tubería
      promesas.push(supabase.from('tuberia').insert({
        ficha_id: fichaId,
        longitud_m: parseFloat(tuberia.longitud_m) || null,
        diametro_m: parseFloat(tuberia.diametro_m) || null,
        material_id: parseInt(tuberia.material_id),
        estado_id: parseInt(tuberia.estado_id)
      }));

      // Pozo Recolección
      promesas.push(supabase.from('pozo_recoleccion').insert({
        ficha_id: fichaId,
        tiene_pozo: pozo.existe,
        ancho_m: pozo.existe ? parseFloat(pozo.ancho_m) : null,
        largo_m: pozo.existe ? parseFloat(pozo.largo_m) : null,
        estado_id: parseInt(pozo.estado_id)
      }));

      // Fotografía
      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${fichaId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('fotografias')
          .upload(fileName, fotoFile);

        if (uploadError) {
          throw new Error("Error subiendo la imagen: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('fotografias')
          .getPublicUrl(fileName);

        promesas.push(supabase.from('fotografia').insert({
          ficha_id: fichaId,
          storage_path: publicUrlData.publicUrl, // Guardamos la URL pública por conveniencia visual
          descripcion: 'Foto principal',
          orden: 1
        }));
      }

      const resultados = await Promise.all(promesas);
      
      const erroresInfra = resultados.filter(r => r.error);
      if (erroresInfra.length > 0) {
        console.error(erroresInfra);
        throw new Error("Se guardó la ficha maestra, pero hubo errores guardando algunos detalles de infraestructura. Revisa la consola.");
      }

      setSuccess(true);
      window.scrollTo(0, 0);
      setTimeout(() => onBack(), 2500);

    } catch (err) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Registro de Ficha Técnica</h2>
        <p>Completa la información recolectada en campo (Nueva Estructura).</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">¡Ficha guardada exitosamente en la base de datos! Redirigiendo al mapa...</div>}

      <form onSubmit={handleSubmit}>
        
        {/* SECCION 1: UBICACION */}
        <div className="form-section">
          <div className="form-section-title"><MapPin size={20} /> 1. Identificación y Ubicación</div>
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>N# Ficha Física</label>
              <input type="text" className="form-input" value={ficha.numero_ficha} onChange={e => setFicha({...ficha, numero_ficha: e.target.value})} placeholder="Ej. 11" />
            </div>
            <div className="form-group">
              <label>Fecha de Inspección</label>
              <input type="date" required className="form-input" value={ficha.fecha} onChange={e => setFicha({...ficha, fecha: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Tramo Vial</label>
              <input type="text" className="form-input" value={ficha.tramo_vial} onChange={e => setFicha({...ficha, tramo_vial: e.target.value})} placeholder="Vía Quevedo - Pto Limón" />
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <input type="text" className="form-input" value={ficha.provincia} onChange={e => setFicha({...ficha, provincia: e.target.value})} placeholder="Santo Domingo..." />
            </div>
            <div className="form-group">
              <label>Cantón</label>
              <input type="text" className="form-input" value={ficha.canton} onChange={e => setFicha({...ficha, canton: e.target.value})} placeholder="Santo Domingo" />
            </div>
            <div className="form-group">
              <label>Parroquia</label>
              <input type="text" className="form-input" value={ficha.parroquia} onChange={e => setFicha({...ficha, parroquia: e.target.value})} placeholder="Puerto Limón" />
            </div>
            <div className="form-group">
              <label>Coordenada ESTE (UTM) *</label>
              <input type="number" step="any" required className="form-input" value={ficha.utm_este} onChange={e => setFicha({...ficha, utm_este: e.target.value})} placeholder="689050" />
            </div>
            <div className="form-group">
              <label>Coordenada NORTE (UTM) *</label>
              <input type="number" step="any" required className="form-input" value={ficha.utm_norte} onChange={e => setFicha({...ficha, utm_norte: e.target.value})} placeholder="9964142" />
            </div>
          </div>
        </div>

        {/* SECCION 2: INFRAESTRUCTURA */}
        <div className="form-section">
          <div className="form-section-title"><HardHat size={20} /> 2. Infraestructura Existente</div>
          
          {/* MUROS DE ALA */}
          <h3 style={{marginTop: '1rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '1rem'}}>Muros de Ala</h3>
          <div className="form-grid cols-4">
            <div className="form-group">
              <label>Longitud (m)</label>
              <input type="number" step="any" className="form-input" value={muroAla.longitud_m} onChange={e => setMuroAla({...muroAla, longitud_m: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Espesor (m)</label>
              <input type="number" step="any" className="form-input" value={muroAla.espesor_m} onChange={e => setMuroAla({...muroAla, espesor_m: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Material</label>
              <select className="form-input" value={muroAla.material_id} onChange={e => setMuroAla({...muroAla, material_id: e.target.value})}>
                {materialesMuro.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-input" value={muroAla.estado_id} onChange={e => setMuroAla({...muroAla, estado_id: e.target.value})}>
                {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 4' }}>
              <label className="checkbox-group">
                <input type="checkbox" className="form-input" checked={muroAla.tiene_solera} onChange={e => setMuroAla({...muroAla, tiene_solera: e.target.checked})} />
                El muro tiene Solera
              </label>
            </div>
          </div>

          {/* TUBERIA */}
          <h3 style={{marginTop: '2rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '1rem'}}>Tubería</h3>
          <div className="form-grid cols-4">
            <div className="form-group">
              <label>Longitud (m)</label>
              <input type="number" step="any" className="form-input" value={tuberia.longitud_m} onChange={e => setTuberia({...tuberia, longitud_m: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Diámetro (m)</label>
              <input type="number" step="any" className="form-input" value={tuberia.diametro_m} onChange={e => setTuberia({...tuberia, diametro_m: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Material</label>
              <select className="form-input" value={tuberia.material_id} onChange={e => setTuberia({...tuberia, material_id: e.target.value})}>
                {materialesTuberia.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-input" value={tuberia.estado_id} onChange={e => setTuberia({...tuberia, estado_id: e.target.value})}>
                {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* MURO CABEZAL */}
          <h3 style={{marginTop: '2rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '1rem'}}>Muro Cabezal</h3>
          <div className="form-grid cols-4">
            <div className="form-group" style={{ gridColumn: 'span 4' }}>
              <label className="checkbox-group">
                <input type="checkbox" className="form-input" checked={muroCabezal.existe} onChange={e => setMuroCabezal({...muroCabezal, existe: e.target.checked})} />
                Existe Muro Cabezal
              </label>
            </div>
            {muroCabezal.existe && (
              <>
                <div className="form-group">
                  <label>Longitud (m)</label>
                  <input type="number" step="any" className="form-input" value={muroCabezal.longitud_m} onChange={e => setMuroCabezal({...muroCabezal, longitud_m: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Espesor (m)</label>
                  <input type="number" step="any" className="form-input" value={muroCabezal.espesor_m} onChange={e => setMuroCabezal({...muroCabezal, espesor_m: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select className="form-input" value={muroCabezal.estado_id} onChange={e => setMuroCabezal({...muroCabezal, estado_id: e.target.value})}>
                    {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* POZOS DE RECOLECCION */}
          <h3 style={{marginTop: '2rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '1rem'}}>Pozo de Recolección</h3>
          <div className="form-grid cols-4">
            <div className="form-group" style={{ gridColumn: 'span 4' }}>
              <label className="checkbox-group">
                <input type="checkbox" className="form-input" checked={pozo.existe} onChange={e => setPozo({...pozo, existe: e.target.checked})} />
                Existe Pozo de Recolección
              </label>
            </div>
            {pozo.existe && (
              <>
                <div className="form-group">
                  <label>Ancho (m)</label>
                  <input type="number" step="any" className="form-input" value={pozo.ancho_m} onChange={e => setPozo({...pozo, ancho_m: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Largo (m)</label>
                  <input type="number" step="any" className="form-input" value={pozo.largo_m} onChange={e => setPozo({...pozo, largo_m: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select className="form-input" value={pozo.estado_id} onChange={e => setPozo({...pozo, estado_id: e.target.value})}>
                    {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECCION 3: EXTRAS */}
        <div className="form-section">
          <div className="form-section-title"><ClipboardList size={20} /> 3. Extras y Fotografía</div>
          <div className="form-grid cols-1">
            <div className="form-group">
              <label><FileImage size={16} style={{display:'inline', verticalAlign:'middle'}}/> Fotografía de Inspección (PNG/JPEG)</label>
              <input type="file" accept="image/png, image/jpeg, image/jpg" className="form-input" onChange={e => setFotoFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label>Observaciones</label>
              <textarea className="form-input" rows="3" value={ficha.observaciones} onChange={e => setFicha({...ficha, observaciones: e.target.value})} placeholder="Detalles adicionales..."></textarea>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn" onClick={onBack} disabled={loading} style={{backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            {loading ? 'Guardando...' : 'Guardar Ficha Técnica'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioFicha;
