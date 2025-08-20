import mongoose from 'mongoose';
import { User } from '../../server/models/User.js';
import config from '../../server/config/config.js';

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Generar referral ID único
const generateReferralId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Verificar si un referral ID ya existe
const referralIdExists = async (referralId) => {
  const count = await User.countDocuments({ referralId });
  return count > 0;
};

// Generar referral ID único verificando que no exista
const generateUniqueReferralId = async () => {
  let referralId;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    referralId = generateReferralId();
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error('Unable to generate unique referral ID after multiple attempts');
    }
  } while (await referralIdExists(referralId));

  return referralId;
};

// Agregar referral IDs a usuarios existentes
const addReferralIdsToUsers = async () => {
  try {
    console.log('🔄 Buscando usuarios sin referral ID...');
    
    // Buscar usuarios que no tienen referralId
    const usersWithoutReferralId = await User.find({ referralId: { $exists: false } });
    
    if (usersWithoutReferralId.length === 0) {
      console.log('✅ Todos los usuarios ya tienen referral ID');
      return;
    }
    
    console.log(`📊 Encontrados ${usersWithoutReferralId.length} usuarios sin referral ID`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of usersWithoutReferralId) {
      try {
        // Generar referral ID único
        const referralId = await generateUniqueReferralId();
        
        // Actualizar usuario
        user.referralId = referralId;
        user.referralStats = {
          totalReferrals: 0,
          successfulReferrals: 0
        };
        
        await user.save();
        
        console.log(`✅ Usuario ${user.username} actualizado con referral ID: ${referralId}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error actualizando usuario ${user.username}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Resumen de la migración:');
    console.log(`✅ Usuarios actualizados exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Iniciando migración de referral IDs...\n');
    
    await addReferralIdsToUsers();
    
    console.log('\n✅ Migración completada');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
