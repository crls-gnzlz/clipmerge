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

// Simular referidos para pruebas
const simulateReferrals = async () => {
  try {
    console.log('🎭 Simulando referidos para pruebas...\n');
    
    // Obtener todos los usuarios
    const allUsers = await User.find({}).select('username referralId referralStats');
    
    if (allUsers.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    console.log(`📊 Usuarios disponibles: ${allUsers.length}`);
    
    // Simular referidos aleatorios
    const referralSimulations = [
      { username: 'demo_user', total: 5 },
      { username: 'admin', total: 12 },
      { username: 'test_user', total: 3 },
      { username: 'creator_user', total: 8 },
      { username: 'carlosg', total: 15 },
      { username: 'carlos_test', total: 2 }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const simulation of referralSimulations) {
      try {
        const user = allUsers.find(u => u.username === simulation.username);
        
        if (!user) {
          console.log(`⚠️ Usuario ${simulation.username} no encontrado`);
          continue;
        }
        
        // Actualizar estadísticas
        user.referralStats = {
          totalReferrals: simulation.total
        };
        
        await user.save();
        
        console.log(`✅ ${user.username}: ${simulation.total} referidos exitosos`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error actualizando ${simulation.username}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Resumen de la simulación:');
    console.log(`✅ Usuarios actualizados: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    
    // Mostrar estadísticas actualizadas
    console.log('\n📊 Estadísticas actualizadas:');
    const updatedUsers = await User.find({}).select('username referralId referralStats');
    
    updatedUsers.forEach(user => {
      const stats = user.referralStats || { totalReferrals: 0 };
      
      console.log(`   👤 ${user.username}: ${stats.totalReferrals} referidos exitosos`);
    });
    
    // Calcular estadísticas generales
    const totalReferrals = updatedUsers.reduce((sum, user) => sum + (user.referralStats?.totalReferrals || 0), 0);
    
    console.log('\n🎯 Estadísticas generales:');
    console.log(`   📈 Total de referidos exitosos: ${totalReferrals}`);
    console.log(`   🎯 Cada referral representa un usuario que completó su registro`);
    
    console.log('\n🎉 Simulación completada! Ahora puedes probar el sistema con datos realistas.');
    
  } catch (error) {
    console.error('❌ Error en la simulación:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Iniciando simulación de referidos...\n');
    
    await simulateReferrals();
    
    console.log('\n✅ Simulación completada');
    
  } catch (error) {
    console.error('❌ Error en la simulación:', error);
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
