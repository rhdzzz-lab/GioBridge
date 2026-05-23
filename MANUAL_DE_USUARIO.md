# Manual de Usuario - GeoBridge

Bienvenido a **GeoBridge**, el Sistema de Captura y Gestión Topográfica diseñado para el registro, visualización y administración de fichas técnicas de alcantarillado. 

Este manual le guiará a través de todas las funcionalidades del sistema para que pueda utilizarlo de manera eficiente.

---

## Índice

1. [Acceso al Sistema](#1-acceso-al-sistema)
   - Iniciar Sesión
   - Registro de Nueva Cuenta
2. [Panel Principal (Mapa y Exportación)](#2-panel-principal-mapa-y-exportación)
   - Navegación por el Mapa
   - Visualización de Fichas Técnicas
   - Exportación de Datos
3. [Registro de Nueva Ficha](#3-registro-de-nueva-ficha)
   - Llenado del Formulario
   - Secciones de la Ficha
4. [Gestión de Usuarios (Solo Administradores)](#4-gestión-de-usuarios-solo-administradores)
5. [Cerrar Sesión](#5-cerrar-sesión)

---

## 1. Acceso al Sistema

Para utilizar GeoBridge, debe tener una cuenta de usuario.

### Iniciar Sesión
1. Abra la aplicación en su navegador.
2. Ingrese su **Correo Electrónico** y **Contraseña**.
3. Haga clic en el botón **Ingresar**.
4. *Nota:* Si su cuenta fue desactivada por un administrador, el sistema le mostrará un aviso y no le permitirá el acceso.

### Registro de Nueva Cuenta
Si es un usuario nuevo:
1. En la pantalla de inicio de sesión, haga clic en **"Regístrate aquí"**.
2. Ingrese su **Nombre Completo**, **Correo Electrónico** y una **Contraseña** (mínimo 6 caracteres).
3. Haga clic en **Registrarse**.
4. Una vez registrado exitosamente, el sistema le indicará que puede iniciar sesión.

> **Nota:** Las cuentas nuevas se crean con el rol de usuario estándar (`USER`). Si requiere privilegios de administrador, debe solicitarlo a un administrador existente.

---

## 2. Panel Principal (Mapa y Exportación)

Una vez iniciada la sesión, será dirigido al Panel Principal, también conocido como el "Dashboard".

### Navegación por el Mapa
- El mapa interactivo muestra puntos geolocalizados de todas las alcantarillas registradas en el sistema.
- Puede hacer zoom acercándose (scroll hacia arriba o botón `+`) y alejándose (scroll hacia abajo o botón `-`).
- Haga clic, mantenga presionado y arrastre para moverse por diferentes áreas del mapa.

### Visualización de Fichas Técnicas
- Al hacer clic sobre cualquier marcador en el mapa, aparecerá un recuadro (Popup) con información básica: Número de ficha y Tramo vial.
- Haga clic en el botón azul **"Ver Ficha Técnica"** dentro del recuadro para abrir un panel detallado con toda la información técnica registrada, medidas de muros, tuberías, y las fotografías adjuntas de la alcantarilla seleccionada.

### Exportación de Datos
- En la parte superior izquierda del panel, verá un contador con el total de "Alcantarillas Registradas".
- Justo debajo, encontrará el botón verde **"Exportar a CSV"**.
- Al presionarlo, el sistema descargará un archivo CSV a su dispositivo con todos los datos registrados en el sistema, listo para ser utilizado en QGIS, Excel u otro software de análisis.

---

## 3. Registro de Nueva Ficha

Para ingresar una nueva alcantarilla al sistema, diríjase a la pestaña **"Registrar Nueva Ficha"** en el menú superior.

### Llenado del Formulario
El formulario está dividido en varias secciones técnicas. Es importante llenar la información con la mayor precisión posible.

**Secciones de la Ficha:**
1. **Datos Generales:** Incluye número de ficha, fechas, inspector, sector, ruta, abscisa, tramo vial y condición (buena/mala, etc.).
2. **Coordenadas UTM:** Debe ingresar el Norte (Y) y el Este (X) en la zona UTM 17S.
3. **Muros de Ala:** Dimensiones geométricas (A, B, C, D, E, H) y material.
4. **Tubería:** Diámetro, longitud, espesor, material y condición.
5. **Muro Cabezal:** Dimensiones geométricas (A, B, C, D, H) y material.
6. **Pozo de Recolección:** Dimensiones y características.
7. **Fotografías:** *Actualmente, los campos de fotografía y observación están preparados para registrar referencias. Asegúrese de completar los reportes fotográficos según las indicaciones de su proyecto.*

Al finalizar, haga clic en el botón de **Guardar / Registrar**. Si la operación es exitosa, será redirigido al mapa y el nuevo punto aparecerá graficado.

---

## 4. Gestión de Usuarios (Solo Administradores)

Si su cuenta tiene el rol de `ADMIN`, verá una tercera pestaña en el menú superior llamada **"Gestión de Usuarios"**.

En este panel, el administrador puede:
- **Ver la lista de usuarios registrados:** Nombre, correo electrónico y rol actual.
- **Cambiar Roles:** Puede promover a un usuario a `ADMIN` o degradarlo a `USER`.
- **Activar / Desactivar Cuentas:** Si desactiva a un usuario, este no podrá volver a iniciar sesión en el sistema, pero su información se conservará.
- **Guardar Cambios:** Después de modificar roles o estados de activación, debe hacer clic en "Guardar Cambios" en la fila correspondiente para aplicar las modificaciones en la base de datos.

> **Advertencia:** Tenga cuidado al cambiar su propio rol o al desactivar su cuenta, ya que podría perder el acceso a las herramientas de administración.

---

## 5. Cerrar Sesión

Para salir del sistema de forma segura:
1. Diríjase a la esquina superior derecha de la pantalla.
2. Haga clic en el botón **"Salir"** (junto al indicador de estado de la base de datos).
3. Esto cerrará su sesión y lo devolverá a la pantalla de inicio de sesión.
