import React, { useState, useEffect } from 'react';
import { Download, MapPin, Database, Loader2, FileText, PlusCircle, LogOut, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from './supabaseClient';
import { convertToGeoJSON, downloadGeoJSON, convertToCSV, downloadCSV } from './utils/exportUtils';
import FichaTecnica from './components/FichaTecnica';
import FormularioFicha from './components/FormularioFicha';
import Login from './components/Login';
import PanelAdmin from './components/PanelAdmin';
import proj4 from 'proj4';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const UTM17S = '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs';
const WGS84 = 'EPSG:4326';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'nuevo' | 'admin'
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFicha, setSelectedFicha] = useState(null);

  const tableName = import.meta.env.VITE_SUPABASE_TABLE_NAME || 'ficha_alcantarilla';
  const latCol = import.meta.env.VITE_LATITUDE_COLUMN || 'utm_norte';
  const lngCol = import.meta.env.VITE_LONGITUDE_COLUMN || 'utm_este';

  // Lógica de Autenticación
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else {
        setUserRole(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('perfil_usuario')
        .select('rol, activo')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (data && !data.activo) {
        alert("Tu cuenta ha sido desactivada por un administrador.");
        await supabase.auth.signOut();
        return;
      }
      setUserRole(data?.rol || 'USER');
    } catch (err) {
      console.error("Error obteniendo rol:", err);
      // Por defecto asignamos USER si falla (podría fallar por RLS si no está bien configurado)
      setUserRole('USER');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Lógica de Datos
  useEffect(() => {
    if (session && activeTab === 'dashboard') {
      fetchData();
    }
  }, [activeTab, session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('tu-proyecto')) {
        setTimeout(() => {
          setData([
            { id: 1, numero_ficha: '11', utm_norte: 9964142, utm_este: 689050, tramo_vial: 'Via Quevedo' },
          ]);
          setLoading(false);
        }, 1000);
        return;
      }

      const { data: records, error: supabaseError } = await supabase
        .from(tableName)
        .select(`
          *,
          muro_ala (*),
          muro_cabezal (*),
          tuberia (*),
          pozo_recoleccion (*),
          fotografia (*)
        `);

      if (supabaseError) throw supabaseError;
      setData(records || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('No se pudo conectar con Supabase o hay un error en las relaciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const csvData = convertToCSV(data, latCol, lngCol);
    downloadCSV(csvData, `${tableName}_export.csv`);
  };

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}><Loader2 className="animate-spin" size={40} /></div>;
  }

  if (!session) {
    return <Login />;
  }

  const mapMarkers = data.map(item => {
    const norte = parseFloat(item[latCol]);
    const este = parseFloat(item[lngCol]);
    if (isNaN(norte) || isNaN(este)) return null;

    let lat = norte;
    let lng = este;

    if (este > 1000 || norte > 1000) {
      try {
        const [wgsLng, wgsLat] = proj4(UTM17S, WGS84, [este, norte]);
        lng = wgsLng;
        lat = wgsLat;
      } catch (e) {
        console.error("Proj4 conversion error", e);
      }
    }
    return { ...item, _mapLat: lat, _mapLng: lng };
  }).filter(Boolean);

  const mapCenter = mapMarkers.length > 0
    ? [mapMarkers[0]._mapLat, mapMarkers[0]._mapLng]
    : [-0.25, -79.16];

  return (
    <div className="app-container">
      <header className="header" style={{ marginBottom: '1rem', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="header-content">
            <h1>GeoBridge</h1>
            <p>Sistema de Captura y Gestión Topográfica</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={`status-badge ${error ? 'error' : ''}`}>
              <Database size={18} />
              {error ? 'Error DB' : 'DB Conectada'}
            </div>
            <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '5px 10px' }}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
        
        {/* Navegación por Pestañas */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={activeTab !== 'dashboard' ? { backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' } : {}}
          >
            <MapPin size={18} />
            Mapa y Exportación
          </button>
          <button 
            className={`btn ${activeTab === 'nuevo' ? 'btn-success' : ''}`}
            onClick={() => setActiveTab('nuevo')}
            style={activeTab !== 'nuevo' ? { backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' } : {}}
          >
            <PlusCircle size={18} />
            Registrar Nueva Ficha
          </button>
          
          {userRole === 'ADMIN' && (
            <button 
              className={`btn ${activeTab === 'admin' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={activeTab !== 'admin' ? { backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' } : {}}
            >
              <Shield size={18} />
              Gestión de Usuarios
            </button>
          )}
        </div>
      </header>

      {activeTab === 'nuevo' ? (
        <FormularioFicha onBack={() => setActiveTab('dashboard')} />
      ) : activeTab === 'admin' && userRole === 'ADMIN' ? (
        <PanelAdmin />
      ) : (
        <main className="main-content">
          <div className="panel">
            <h2>Resumen de Datos</h2>
            <div className="stat-box">
              {loading ? (
                <Loader2 className="skeleton" size={40} style={{ margin: 'auto' }} />
              ) : (
                <>
                  <div className="stat-value">{data.length}</div>
                  <div className="stat-label">Alcantarillas Registradas</div>
                </>
              )}
            </div>
            <div style={{ flex: 1 }}></div>
            <button 
              className="btn btn-success" 
              onClick={handleExport}
              disabled={loading || data.length === 0}
              style={{ width: '100%', padding: '1rem' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              Exportar a CSV
            </button>
          </div>

          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="map-container">
              {!loading && (
                <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {mapMarkers.map((item, index) => (
                    <Marker key={index} position={[item._mapLat, item._mapLng]}>
                      <Popup>
                        <div style={{ color: '#0f172a', minWidth: '150px' }}>
                          <strong>Ficha N#:</strong> {item.numero_ficha || item.id} <br/>
                          <strong>Tramo:</strong> {item.tramo_vial || 'NA'} <br/>
                          <button 
                            onClick={() => setSelectedFicha(item)}
                            style={{
                              marginTop: '10px', background: '#3b82f6', color: 'white', border: 'none',
                              padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', width: '100%', justifyContent: 'center'
                            }}
                          >
                            <FileText size={14} style={{ marginRight: '5px' }} />
                            Ver Ficha Técnica
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
        </main>
      )}

      {selectedFicha && (
        <FichaTecnica data={selectedFicha} onClose={() => setSelectedFicha(null)} />
      )}
    </div>
  );
}

export default App;
