# GeoBridge 🌉

**Sistema de Captura y Gestión Topográfica**

🌍 **Sitio Web en Vivo:** [https://geobridge-7041b.web.app](https://geobridge-7041b.web.app)

GeoBridge es una plataforma web integral diseñada para el registro, gestión y visualización geoespacial de infraestructuras de alcantarillado. Permite a ingenieros y topógrafos mantener un control detallado sobre los componentes estructurales en terreno con exportación directa para análisis GIS.

## 🚀 Características Principales

- 🗺️ **Visualización Geoespacial:** Mapa interactivo con soporte de conversión automática de coordenadas UTM a WGS84.
- 📝 **Registro Detallado:** Formularios técnicos completos para Muros de Ala, Tuberías, Muros Cabezales y Pozos de Recolección.
- 🔒 **Gestión de Roles:** Sistema de autenticación seguro con perfiles de Usuario (`USER`) y Administrador (`ADMIN`).
- 📊 **Exportación a GIS:** Capacidad de exportar todos los datos estructurados a formato CSV, listos para importar a QGIS o ArcGIS.
- 📱 **Diseño Responsivo:** Interfaz moderna y adaptable a diferentes dispositivos.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React + Vite
- **Mapas:** Leaflet (`react-leaflet`)
- **Proyección de Coordenadas:** `proj4`
- **Backend & Auth:** Supabase
- **Estilos:** CSS puro e Iconos de `lucide-react`

## ⚙️ Configuración del Entorno Local

### Prerrequisitos
- Node.js (v18 o superior recomendado)
- NPM o Yarn
- Un proyecto en [Supabase](https://supabase.com/)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/geobridge.git
   cd geobridge
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno. Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   VITE_SUPABASE_TABLE_NAME=ficha_alcantarilla
   VITE_LATITUDE_COLUMN=utm_norte
   VITE_LONGITUDE_COLUMN=utm_este
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📖 Documentación

Para instrucciones detalladas sobre cómo utilizar el sistema, por favor consulta nuestro [Manual de Usuario](MANUAL_DE_USUARIO.md) incluido en este repositorio.

## 👥 Autores y Contribuciones

Proyecto elaborado y desarrollado por:
- **Hernández Ríos Roberto Ángel**
- **Diaz Veytia Marcos**

---
*Plataforma desarrollada para la optimización y gestión eficiente de infraestructura topográfica.*
