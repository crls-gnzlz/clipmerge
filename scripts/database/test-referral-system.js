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

// Función para probar el sistema de referidos
const testReferralSystem = async () => {
  try {
    console.log('🧪 Probando sistema de referidos...\n');
    
    // 1. Verificar que todos los usuarios tengan referral ID
    console.log('1️⃣ Verificando usuarios con referral ID...');
    const allUsers = await User.find({}).select('username referralId referralStats');
    
    if (allUsers.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    console.log(`📊 Total de usuarios: ${allUsers.length}`);
    
    const usersWithReferralId = allUsers.filter(user => user.referralId);
    const usersWithoutReferralId = allUsers.filter(user => !user.referralId);
    
    console.log(`✅ Usuarios con referral ID: ${usersWithReferralId.length}`);
    console.log(`❌ Usuarios sin referral ID: ${usersWithoutReferralId.length}`);
    
    if (usersWithoutReferralId.length > 0) {
      console.log('\n⚠️ Usuarios sin referral ID:');
      usersWithoutReferralId.forEach(user => {
        console.log(`   - ${user.username}`);
      });
    }
    
    // 2. Mostrar todos los referral IDs
    console.log('\n2️⃣ Referral IDs generados:');
    usersWithReferralId.forEach(user => {
      console.log(`   👤 ${user.username}: ${user.referralId}`);
      console.log(`      📊 Stats: Total=${user.referralStats?.totalReferrals || 0}, Successful=${user.referralStats?.successfulReferrals || 0}`);
    });
    
    // 3. Verificar unicidad de referral IDs
    console.log('\n3️⃣ Verificando unicidad de referral IDs...');
    const referralIds = usersWithReferralId.map(user => user.referralId);
    const uniqueReferralIds = [...new Set(referralIds)];
    
    if (referralIds.length === uniqueReferralIds.length) {
      console.log('✅ Todos los referral IDs son únicos');
    } else {
      console.log('❌ Hay referral IDs duplicados');
      const duplicates = referralIds.filter((id, index) => referralIds.indexOf(id) !== index);
      console.log(`   Duplicados: ${duplicates.join(', ')}`);
    }
    
    // 4. Verificar formato de referral IDs
    console.log('\n4️⃣ Verificando formato de referral IDs...');
    const validFormat = referralIds.every(id => /^[A-Z0-9]{8}$/.test(id));
    
    if (validFormat) {
      console.log('✅ Todos los referral IDs tienen el formato correcto (8 caracteres A-Z, 0-9)');
    } else {
      console.log('❌ Algunos referral IDs no tienen el formato correcto');
    }
    
    // 5. Generar enlaces de ejemplo
    console.log('\n5️⃣ Enlaces de referidos de ejemplo:');
    const baseUrl = 'https://clipchain.app';
    usersWithReferralId.slice(0, 3).forEach(user => {
      const referralLink = `${baseUrl}/ref/${user.referralId}`;
      console.log(`   🔗 ${user.username}: ${referralLink}`);
    });
    
    // 6. Estadísticas generales
    console.log('\n6️⃣ Estadísticas generales:');
    const totalReferrals = usersWithReferralId.reduce((sum, user) => sum + (user.referralStats?.totalReferrals || 0), 0);
    const totalSuccessful = usersWithReferralId.reduce((sum, user) => sum + (user.referralStats?.successfulReferrals || 0), 0);
    
    console.log(`   📈 Total de referidos generados: ${totalReferrals}`);
    console.log(`   🎯 Total de referidos exitosos: ${totalSuccessful}`);
    console.log(`   📊 Promedio por usuario: ${(totalReferrals / usersWithReferralId.length).toFixed(2)}`);
    
    console.log('\n🎉 Sistema de referidos funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error probando sistema de referidos:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Iniciando pruebas del sistema de referidos...\n');
    
    await testReferralSystem();
    
    console.log('\n✅ Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
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
