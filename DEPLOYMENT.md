# Guía Rápida de Despliegue - FoodTruck Hub PWA

## 🚀 Despliegue Rápido con Vercel (Recomendado)

### Paso 1: Preparar el Proyecto

```bash
# Asegúrate de que todo funciona localmente
npm run build
npm start
```

### Paso 2: Subir a GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Paso 3: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Clic en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno:

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

5. Clic en **"Deploy"**
6. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

---

## 📱 Cómo los Clientes Usan la App

### Flujo del Cliente

1. **Escanea el QR** en la mesa del Food Truck
2. Se abre el menú en el navegador
3. **Aparece banner de instalación** (opcional)
4. Navega por el menú y hace su pedido
5. Recibe confirmación con número de orden
6. **Puede instalar la app** para futuras visitas

### Instalación en Android

- Chrome muestra automáticamente: **"Agregar a pantalla de inicio"**
- El cliente toca "Agregar"
- Ícono aparece en el home screen
- Se abre como app nativa (sin barra del navegador)

### Instalación en iOS

- Cliente abre en Safari
- Toca botón compartir (cuadro con flecha)
- Selecciona **"Agregar a pantalla de inicio"**
- Ícono aparece en el home screen

---

## ✅ Checklist Post-Despliegue

- [ ] App accesible en la URL de producción
- [ ] HTTPS habilitado (automático en Vercel)
- [ ] Manifest.json accesible en `/manifest.json`
- [ ] Service Worker funcionando
- [ ] Firebase conectado correctamente
- [ ] Imágenes cargando desde Storage
- [ ] QR codes generando URLs correctas
- [ ] Pedidos creándose en tiempo real
- [ ] Prompt de instalación aparece en móviles

---

## 🔧 Comandos Útiles

```bash
# Compilar para producción
npm run build

# Probar build localmente
npm start

# Limpiar caché de Next.js
rm -rf .next

# Verificar que no hay errores
npm run lint
```

---

## 🌐 Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. En Vercel, ve a **Settings → Domains**
2. Agrega tu dominio (ej: `foodtruckhub.com`)
3. Configura los DNS según las instrucciones
4. Espera propagación (5-10 minutos)
5. HTTPS se configura automáticamente

---

## 📊 Monitoreo

### Vercel Analytics

Vercel incluye analytics gratis:
- Visitas por página
- Tiempo de carga
- Dispositivos y navegadores
- Ubicación geográfica

### Firebase Analytics (Opcional)

Para analytics más detallados, agrega Firebase Analytics:

```bash
npm install firebase/analytics
```

---

## 🆘 Solución de Problemas

### La app no se despliega

- Verifica que `npm run build` funciona localmente
- Revisa los logs de Vercel
- Asegúrate de que las variables de entorno están configuradas

### Las imágenes no cargan

- Verifica que las reglas de Storage están desplegadas
- Revisa que `next.config.js` tiene los dominios permitidos
- Comprueba que Firebase Storage está habilitado

### El prompt de instalación no aparece

- Solo funciona con HTTPS (Vercel lo tiene por defecto)
- Solo aparece en móviles/Chrome
- No aparece si ya está instalada
- Verifica que `manifest.json` es válido

---

## 📞 Soporte

Si tienes problemas, revisa:
- Logs de Vercel
- Console del navegador (F12)
- Firebase Console para errores de Firestore/Storage
