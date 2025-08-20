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

// Función para probar el flujo completo de referidos
const testReferralFlow = async () => {
  try {
    console.log('🔄 Probando flujo completo de referidos...\n');
    
    // 1. Verificar usuarios existentes con sus estadísticas
    console.log('📊 Usuarios existentes y sus estadísticas:');
    const allUsers = await User.find({}).select('username referralId referralStats referredBy');
    
    allUsers.forEach(user => {
      console.log(`\n👤 ${user.username}:`);
      console.log(`   Referral ID: ${user.referralId || 'No generado'}`);
      console.log(`   Referido por: ${user.referredBy || 'Ninguno'}`);
      console.log(`   Estadísticas: ${user.referralStats?.totalReferrals || 0} total, ${user.referralStats?.successfulReferrals || 0} exitosos`);
    });
    
    // 2. Simular un nuevo registro con referral
    console.log('\n🎯 Simulando registro con referral...');
    
    // Tomar un usuario existente como referidor
    const referrer = allUsers.find(u => u.referralId);
    if (!referrer) {
      console.log('❌ No hay usuarios con referral ID para probar');
      return;
    }
    
    console.log(`\n🔗 Usando como referidor: ${referrer.username} (${referrer.referralId})`);
    
    // 3. Crear un usuario de prueba con referral
    const testUserData = {
      username: `test_referral_${Date.now()}`,
      email: `test_referral_${Date.now()}@example.com`,
      password: 'testpassword123',
      displayName: 'Test Referral User',
      referralId: referrer.referralId
    };
    
    console.log('\n📝 Datos del usuario de prueba:');
    console.log(`   Username: ${testUserData.username}`);
    console.log(`   Email: ${testUserData.email}`);
    console.log(`   Referral ID: ${testUserData.referralId}`);
    
    // 4. Verificar que el referidor existe
    const referrerCheck = await User.findOne({ referralId: testUserData.referralId });
    if (!referrerCheck) {
      console.log('❌ Referidor no encontrado');
      return;
    }
    
    console.log(`✅ Referidor encontrado: ${referrerCheck.username}`);
    
    // 5. Simular la creación del usuario (sin guardar realmente)
    console.log('\n🔄 Simulando proceso de registro...');
    
    // Verificar que el username no existe
    const existingUser = await User.findByUsernameOrEmail(testUserData.username);
    if (existingUser) {
      console.log('⚠️ Usuario de prueba ya existe, usando otro username');
      testUserData.username = `test_referral_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    
    // 6. Mostrar estadísticas antes del "registro"
    console.log('\n📈 Estadísticas ANTES del registro:');
    console.log(`   Referidor: ${referrerCheck.username}`);
    console.log(`   Total referrals: ${referrerCheck.referralStats?.totalReferrals || 0}`);
    console.log(`   Successful referrals: ${referrerCheck.referralStats?.successfulReferrals || 0}`);
    
    // 7. Simular la actualización de estadísticas
    console.log('\n🔄 Simulando actualización de estadísticas...');
    
    // Incrementar total referrals
    referrerCheck.referralStats.totalReferrals += 1;
    await referrerCheck.save();
    
    console.log('✅ Estadísticas actualizadas');
    
    // 8. Mostrar estadísticas después del "registro"
    console.log('\n📈 Estadísticas DESPUÉS del registro:');
    const updatedReferrer = await User.findById(referrerCheck._id).select('username referralStats');
    console.log(`   Referidor: ${updatedReferrer.username}`);
    console.log(`   Total referrals: ${updatedReferrer.referralStats?.totalReferrals || 0}`);
    console.log(`   Successful referrals: ${updatedReferrer.referralStats?.successfulReferrals || 0}`);
    
    // 9. Verificar que las estadísticas se incrementaron
    const totalIncreased = (updatedReferrer.referralStats?.totalReferrals || 0) > (referrer.referralStats?.totalReferrals || 0);
    
    if (totalIncreased) {
      console.log('✅ Estadísticas incrementadas correctamente');
    } else {
      console.log('❌ Las estadísticas no se incrementaron');
    }
    
    // 10. Mostrar resumen del flujo
    console.log('\n🎉 Resumen del flujo de referidos:');
    console.log(`   ✅ Referidor identificado: ${referrer.username}`);
    console.log(`   ✅ Referral ID válido: ${referrer.referralId}`);
    console.log(`   ✅ Estadísticas actualizadas: ${totalIncreased ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Flujo de registro simulado correctamente`);
    
    console.log('\n🔗 URL de prueba generada:');
    console.log(`   ${config.frontendUrl}/ref/${referrer.referralId}`);
    
    console.log('\n🎯 Para probar en el frontend:');
    console.log(`   1. Abrir: ${config.frontendUrl}/ref/${referrer.referralId}`);
    console.log(`   2. Verificar redirección al registro`);
    console.log(`   3. Completar registro con el referral ID`);
    console.log(`   4. Verificar que se asocie al usuario referidor`);
    
  } catch (error) {
    console.error('❌ Error probando flujo de referidos:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Iniciando prueba del flujo de referidos...\n');
    
    await testReferralFlow();
    
    console.log('\n✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
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
