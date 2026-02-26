// Script para crear un Food Truck de Pizzas de prueba con datos completos
// Ejecutar: node scripts/seed-pizza-truck.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seedPizzaTruck() {
    console.log('🍕 Iniciando creación del Food Truck de Pizzas...\n');

    try {
        // 1. Crear el Food Truck
        const truckRef = await db.collection('food_trucks').add({
            name: 'Napoli Street Pizza',
            slug: 'napoli-pizza',
            description: 'Auténticas pizzas artesanales al horno de leña. Masa madre fermentada 48h.',
            ownerId: 'admin-user-123',
            active: true,
            primaryColor: '#DC2626', // Rojo intenso
            accentColor: '#1F2937', // Gris oscuro/negro
            logoUrl: '', // Opcional: puedes añadir una URL de logo
            bannerUrl: '', // Opcional: puedes añadir una URL de banner
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Food Truck creado con ID: ${truckRef.id}\n`);

        // 2. Crear Categorías
        const categories = [
            { name: 'Pizzas Clásicas', order: 1 },
            { name: 'Pizzas Gourmet', order: 2 },
            { name: 'Bebidas', order: 3 },
            { name: 'Postres', order: 4 }
        ];

        const categoryIds = {};
        for (const cat of categories) {
            const catRef = await db.collection('categories').add({
                foodTruckId: truckRef.id,
                name: cat.name,
                order: cat.order
            });
            categoryIds[cat.name] = catRef.id;
            console.log(`✅ Categoría creada: ${cat.name}`);
        }

        console.log('\n');

        // 3. Crear Productos
        const products = [
            // Pizzas Clásicas
            {
                categoryId: categoryIds['Pizzas Clásicas'],
                name: 'Margherita',
                description: 'Salsa de tomate San Marzano, mozzarella di bufala, albahaca fresca y aceite de oliva extra virgen.',
                price: 12.50,
                cost: 4.20,
                stock: 25,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Pizzas Clásicas'],
                name: 'Pepperoni',
                description: 'Doble porción de pepperoni premium, mozzarella y salsa de tomate casera.',
                price: 14.00,
                cost: 5.00,
                stock: 30,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Pizzas Clásicas'],
                name: 'Cuatro Quesos',
                description: 'Mozzarella, gorgonzola, parmesano y queso de cabra sobre base blanca.',
                price: 15.50,
                cost: 6.50,
                stock: 20,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Pizzas Clásicas'],
                name: 'Hawaiana',
                description: 'Jamón ahumado, piña caramelizada y mozzarella. Un clásico controversial.',
                price: 13.50,
                cost: 4.80,
                stock: 18,
                available: true,
                imageUrl: ''
            },

            // Pizzas Gourmet
            {
                categoryId: categoryIds['Pizzas Gourmet'],
                name: 'Trufa Negra',
                description: 'Crema de trufa, champiñones portobello, rúcula y parmesano en láminas.',
                price: 22.00,
                cost: 10.00,
                stock: 12,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Pizzas Gourmet'],
                name: 'Prosciutto e Rucola',
                description: 'Prosciutto di Parma, rúcula fresca, parmesano y reducción de balsámico.',
                price: 19.50,
                cost: 8.50,
                stock: 15,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Pizzas Gourmet'],
                name: 'BBQ Pulled Pork',
                description: 'Cerdo desmechado BBQ, cebolla caramelizada, jalapeños y cilantro.',
                price: 18.00,
                cost: 7.20,
                stock: 10,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Pizzas Gourmet'],
                name: 'Mediterránea',
                description: 'Aceitunas Kalamata, tomates cherry, queso feta, espinaca y orégano.',
                price: 16.50,
                cost: 6.00,
                stock: 8,
                available: true,
                imageUrl: ''
            },

            // Bebidas
            {
                categoryId: categoryIds['Bebidas'],
                name: 'Coca-Cola 500ml',
                description: 'Refresco de cola clásico bien frío.',
                price: 2.50,
                cost: 0.80,
                stock: 50,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Bebidas'],
                name: 'Limonada Artesanal',
                description: 'Limonada natural con hierbabuena y jengibre.',
                price: 3.50,
                cost: 1.00,
                stock: 30,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Bebidas'],
                name: 'Cerveza Artesanal IPA',
                description: 'Cerveza local de producción artesanal, 355ml.',
                price: 5.00,
                cost: 2.50,
                stock: 24,
                available: true,
                imageUrl: ''
            },

            // Postres
            {
                categoryId: categoryIds['Postres'],
                name: 'Tiramisú Casero',
                description: 'El clásico postre italiano con café espresso y mascarpone.',
                price: 6.50,
                cost: 2.50,
                stock: 15,
                available: true,
                imageUrl: ''
            },
            {
                categoryId: categoryIds['Postres'],
                name: 'Nutella Pizza',
                description: 'Mini pizza dulce con Nutella, fresas y azúcar glass.',
                price: 8.00,
                cost: 3.00,
                stock: 12,
                available: true,
                imageUrl: ''
            }
        ];

        for (const product of products) {
            await db.collection('products').add({
                foodTruckId: truckRef.id,
                ...product
            });
        }

        console.log(`✅ ${products.length} productos creados\n`);

        // 4. Crear algunos pedidos de prueba
        const sampleOrders = [
            {
                customerName: 'María González',
                tableNumber: 'Mesa 3',
                items: [
                    { productId: 'pizza-margherita', name: 'Margherita', price: 12.50, quantity: 2 },
                    { productId: 'coca-cola', name: 'Coca-Cola 500ml', price: 2.50, quantity: 2 }
                ],
                total: 30.00,
                status: 'preparing'
            },
            {
                customerName: 'Carlos Ramírez',
                tableNumber: 'Mesa 7',
                items: [
                    { productId: 'trufa-negra', name: 'Trufa Negra', price: 22.00, quantity: 1 },
                    { productId: 'cerveza-ipa', name: 'Cerveza Artesanal IPA', price: 5.00, quantity: 1 }
                ],
                total: 27.00,
                status: 'pending'
            },
            {
                customerName: 'Ana Martínez',
                tableNumber: 'Mesa 1',
                items: [
                    { productId: 'pepperoni', name: 'Pepperoni', price: 14.00, quantity: 1 },
                    { productId: 'tiramisu', name: 'Tiramisú Casero', price: 6.50, quantity: 1 },
                    { productId: 'limonada', name: 'Limonada Artesanal', price: 3.50, quantity: 2 }
                ],
                total: 27.50,
                status: 'ready'
            }
        ];

        for (const order of sampleOrders) {
            await db.collection('orders').add({
                foodTruckId: truckRef.id,
                ...order,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        console.log(`✅ ${sampleOrders.length} pedidos de prueba creados\n`);

        console.log('🎉 ¡Food Truck "Napoli Street Pizza" creado exitosamente!\n');
        console.log('📋 Resumen:');
        console.log(`   - ID del Truck: ${truckRef.id}`);
        console.log(`   - Slug: napoli-pizza`);
        console.log(`   - URL del menú: http://localhost:3000/menu/napoli-pizza`);
        console.log(`   - Categorías: ${categories.length}`);
        console.log(`   - Productos: ${products.length}`);
        console.log(`   - Pedidos de prueba: ${sampleOrders.length}`);
        console.log(`   - Colores: Rojo (#DC2626) y Negro (#1F2937)\n`);

    } catch (error) {
        console.error('❌ Error al crear el Food Truck:', error);
    }

    process.exit(0);
}

seedPizzaTruck();
