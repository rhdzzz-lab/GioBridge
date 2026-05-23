import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Shield, UserX, UserCheck, Loader2 } from 'lucide-react';
import './Formulario.css';

const PanelAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('perfil_usuario')
        .select('*')
        .order('creado_en', { ascending: false });

      if (err) throw err;
      setUsuarios(data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios. Verifica que tienes permisos de Administrador.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, nuevoRol) => {
    try {
      setSavingId(userId);
      const { error: err } = await supabase
        .from('perfil_usuario')
        .update({ rol: nuevoRol })
        .eq('id', userId);

      if (err) throw err;
      
      setUsuarios(usuarios.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u));
    } catch (err) {
      alert("Error al actualizar el rol: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActivo = async (userId, estadoActual) => {
    try {
      setSavingId(userId);
      const { error: err } = await supabase
        .from('perfil_usuario')
        .update({ activo: !estadoActual })
        .eq('id', userId);

      if (err) throw err;
      
      setUsuarios(usuarios.map(u => u.id === userId ? { ...u, activo: !estadoActual } : u));
    } catch (err) {
      alert("Error al actualizar el estado: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div style={{ background: 'var(--blue-dark)', padding: '10px', borderRadius: '10px' }}>
          <Shield size={24} color="var(--accent-primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0' }}>Administra los roles y accesos al sistema.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--text-secondary)" />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Rol</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={16} color="var(--text-secondary)" />
                      {u.nombre}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={u.rol}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      disabled={savingId === u.id}
                      style={{ 
                        background: 'var(--bg-color)', 
                        color: u.rol === 'ADMIN' ? 'var(--accent-primary)' : 'white',
                        border: '1px solid var(--border-color)',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: u.rol === 'ADMIN' ? 'bold' : 'normal'
                      }}
                    >
                      <option value="USER">Usuario Normal</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      background: u.activo ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: u.activo ? '#4ade80' : '#f87171'
                    }}>
                      {u.activo ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleToggleActivo(u.id, u.activo)}
                      disabled={savingId === u.id}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid var(--border-color)', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        margin: '0 auto'
                      }}
                    >
                      {savingId === u.id ? <Loader2 size={16} className="animate-spin" /> : 
                        (u.activo ? <UserX size={16} color="#f87171" /> : <UserCheck size={16} color="#4ade80" />)
                      }
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PanelAdmin;
