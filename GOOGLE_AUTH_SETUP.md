# Guía de Configuración: Login con Google

El error `Error 401: invalid_client` ocurre porque la aplicación no tiene un **Client ID** válido de Google que la identifique. Sigue estos pasos para generarlo y solucionar el problema permanentemente.

## Paso 1: Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un **Nuevo Proyecto** (ej: "Life Ranked System").

## Paso 2: Pantalla de Consentimiento (OAuth Consent Screen)
1. En el menú lateral, ve a **APIs & Services** > **OAuth consent screen**.
2. Selecciona **External** y pulsa "Create".
3. Rellena los datos básicos:
   - **App Name**: Life Ranked
   - **User Support Email**: Tu correo
   - **Developer Contact Email**: Tu correo
4. Pulsa "Save and Continue" en las siguientes pantallas (no necesitas añadir Scopes especiales para el login básico).

## Paso 3: Crear Credenciales (Credentials)
1. En el menú lateral, ve a **APIs & Services** > **Credentials**.
2. Pulsa **+ CREATE CREDENTIALS** y selecciona **OAuth client ID**.
3. En "Application type", selecciona **Web application**.
4. En **Authorized JavaScript origins**, añade las URLs donde corre tu app:
   - `http://localhost:5173` (Frontend Vite)
   - `http://localhost:5000` (Backend, opcional pero recomendado)
5. Pulsa **Create**.

## Paso 4: Copiar el Client ID
Se abrirá una ventana con tus credenciales. Copia el string bajo **"Your Client ID"**.
Se verá algo como: `123456789-abcdefg...apps.googleusercontent.com`

## Paso 5: Actualizar el Código
1. Abre el archivo `src/main.tsx`.
2. Busca la línea:
   ```tsx
   <GoogleOAuthProvider clientId="YOUR_FULL_CLIENT_ID_HERE.apps.googleusercontent.com">
   ```
3. Reemplaza el texto entre comillas por tu **Client ID** real copiado en el paso 4.

---

### ¡Listo!
Reinicia tu aplicación frontend. El error desaparecerá y podrás usar el botón de Google oficialmente.
