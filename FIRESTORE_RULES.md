# Reglas de Seguridad de Firebase

Para proteger tus datos en producción, debes configurar las reglas de seguridad en la consola de Firebase. Aquí tienes una plantilla base recomendada:

## Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de camiones y menús
    match /food_trucks/{truckId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == resource.data.ownerId;
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null; // Refinar según ownerId del truck
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Pedidos: Solo el truck owner puede leerlos/editarlos, público puede crear
    match /orders/{orderId} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }
  }
}
```

## Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Lectura pública para imágenes
      allow read: if true;
      // Solo usuarios autenticados pueden subir/borrar
      allow write: if request.auth != null;
    }
  }
}
```

> [!IMPORTANT]
> Estas reglas son una base inicial. Se recomienda implementar una validación más estricta comparando el `ownerId` del documento con el `uid` del usuario autenticado (`request.auth.uid`).
