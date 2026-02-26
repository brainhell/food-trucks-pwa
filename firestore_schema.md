# Estructura de Datos (Firestore Schema)

## Colecciones Principales

### 1. `food_trucks` (Negocios)
| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | String | ID Documento (auth uid o auto) |
| `name` | String | Nombre comercial ("Burger Truck X") |
| `slug` | String | Identificador para URL QR ("burger-truck-x") |
| `description`| String | Breve descripción |
| `logoUrl` | String | URL de la imagen del logo |
| `bannerUrl` | String | Imagen de fondo del menú |
| `ownerId` | String | UID del dueño (Firebase Auth) |
| `active` | Boolean | Si el truck está operando actualmente |
| `createdAt` | Timestamp| Fecha de creación |

### 2. `categories` (Categorías por Truck)
| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | String | ID Documento |
| `food_truck_id`| String | Referencia al truck |
| `name` | String | Nombre (ej: "Hamburguesas", "Bebidas") |
| `order` | Number | Orden de visualización |

### 3. `products` (Menú)
| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | String | ID Documento |
| `food_truck_id`| String | Referencia al truck |
| `category_id` | String | Referencia a categoría |
| `name` | String | Nombre del plato |
| `description`| String | Ingredientes/detalle |
| `price` | Number | Precio venta |
| `cost` | Number | Costo (para reportes de ganancia) |
| `imageUrl` | String | Imagen del producto |
| `available` | Boolean | Disponibilidad inmediata |
| `stock` | Number | Cantidad actual (opcional) |

### 4. `orders` (Pedidos en Tiempo Real)
| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | String | ID Documento |
| `food_truck_id`| String | Referencia al truck |
| `customerName`| String | Nombre opcional del cliente |
| `items` | Array | Lista de productos: `{id, name, qty, price}` |
| `total` | Number | Monto total |
| `status` | String | `pending` \| `preparing` \| `ready` \| `done` \| `cancelled` |
| `createdAt` | Timestamp| Hora exacta del pedido |
