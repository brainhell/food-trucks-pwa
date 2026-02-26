import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { id: 'admin-user-123' }
        });

        if (existingUser) {
            console.log('✅ El usuario admin ya existe');
            return;
        }

        // Crear el usuario admin
        const user = await prisma.user.create({
            data: {
                id: 'admin-user-123',
                name: 'Admin User',
                email: 'admin@foodtrucks.com',
                emailVerified: new Date(),
            }
        });

        console.log('✅ Usuario admin creado exitosamente:', user);
    } catch (error) {
        console.error('❌ Error creando usuario admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
