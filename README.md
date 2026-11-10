# Proyecto SAD

Aplicación móvil y web para conectar estudiantes de una sede educativa. Está construida con React, Ionic, TypeScript, Vite y Firebase.

> Proyecto en desarrollo. Antes de usar datos reales o publicar la aplicación, configura y valida las reglas de seguridad de Firebase. El repositorio no incluye reglas de Firestore.

## Requisitos

- Node.js 20 LTS o superior
- npm
- Android Studio y Android SDK, solo para compilar la aplicación Android

## Inicio local

```bash
npm ci
npm run dev
```

Vite inicia en `http://localhost:8100`. No se requieren certificados TLS locales.

La configuración del cliente Firebase está en `src/firebaseConfig.ts`. Para usar otro proyecto, configura allí los datos de tu aplicación web Firebase. Esa configuración del cliente no sustituye reglas de Firestore ni credenciales de servidor. No subas claves privadas, cuentas de servicio ni archivos `.env`.

En Firebase Console habilita únicamente los proveedores de autenticación que uses y configura los dominios autorizados para desarrollo y publicación.

## Comprobaciones

```bash
npm run lint
npm run test.unit
npm run build
```

Para las pruebas e2e, inicia primero `npm run dev` y en otra terminal ejecuta:

```bash
npm run test.e2e
```

## Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Completa la configuración de firma y los identificadores de aplicación antes de distribuir una compilación.

## Seguridad antes de publicar

- Configura reglas de Firestore restrictivas y pruébalas con Firebase Emulator.
- No confíes en validaciones del cliente para autorizar pagos, roles, acceso a perfiles, mensajes o reportes.
- Usa credenciales de servidor solo en un backend seguro; nunca en el bundle web o móvil.
- Cambia los identificadores de paquete y revisa los dominios, claves y servicios asociados a tu propio proyecto.
- El historial Git puede conservar archivos o secretos aunque se eliminen del último commit. Revisa y sanea el historial antes de hacer público el repositorio.
