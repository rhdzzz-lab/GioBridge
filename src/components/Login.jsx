import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Mail, Loader2, UserPlus, LogIn, User } from 'lucide-react';
import './Formulario.css'; // Reutilizamos estilos del formulario

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // INICIAR SESIÓN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // El App.jsx detectará el cambio de sesión automáticamente
      } else {
        // REGISTRO
        if (!nombre) throw new Error('El nombre es obligatorio para registrarse.');
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Crear perfil automáticamente
          const { error: profileError } = await supabase
            .from('perfil_usuario')
            .insert({
              id: data.user.id,
              nombre: nombre,
              email: email,
              rol: 'usuario', // Por defecto todos son usuario
              activo: true
            });

          if (profileError) {
            console.error("Error creando perfil:", profileError);
            throw new Error("Cuenta creada, pero hubo un error generando tu perfil. Contacta al administrador.");
          }

          setMessage("¡Registro exitoso! Ya puedes acceder al sistema.");
          setIsLogin(true); // Cambiar a pestaña de login
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="form-container" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--blue-dark)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1rem' }}>
            <Lock size={30} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>GeoBridge - Plataforma Topográfica</p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {message && <div className="success-message" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div className="form-group">
              <label>Nombre Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  style={{ paddingLeft: '35px' }}
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  placeholder="Juan Pérez" 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
              <input 
                type="email" 
                required 
                className="form-input" 
                style={{ paddingLeft: '35px' }}
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="tu@correo.com" 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
              <input 
                type="password" 
                required 
                className="form-input" 
                style={{ paddingLeft: '35px' }}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="********" 
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
            {isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
