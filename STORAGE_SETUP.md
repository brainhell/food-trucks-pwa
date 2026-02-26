# Despliegue de Reglas de Firebase Storage

Para que el sistema de upload de imágenes funcione correctamente, necesitas desplegar las reglas de seguridad de Firebase Storage.

## Opción 1: Firebase Console (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Storage** → **Rules**
4. Copia y pega el contenido del archivo `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /food-trucks/{truckId}/products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /food-trucks/{truckId}/branding/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

5. Haz clic en **Publicar**

## Opción 2: Firebase CLI

Si tienes Firebase CLI instalado:

```bash
firebase deploy --only storage
```

## Verificación

Una vez desplegadas las reglas, puedes probar el upload:

1. Ve a `/admin/menu-management`
2. Selecciona un Food Truck
3. Edita o crea un producto
4. Arrastra una imagen al área de upload
5. La imagen se subirá automáticamente a Firebase Storage
6. La URL se guardará en Firestore

## Estructura de Storage

Las imágenes se organizan así:

```
/food-trucks/
  /{truckId}/
    /products/
      /{productId}/
        /{timestamp}_{filename}
```

Esto permite:
- Organización clara por negocio
- Fácil limpieza si se elimina un truck
- URLs persistentes y públicas
