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
      { username: 'demo_user', total: 5, successful: 3 },
      { username: 'admin', total: 12, successful: 8 },
      { username: 'test_user', total: 3, successful: 1 },
      { username: 'creator_user', total: 8, successful: 6 },
      { username: 'carlosg', total: 15, successful: 12 },
      { username: 'carlos_test', total: 2, successful: 0 }
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
          totalReferrals: simulation.total,
          successfulReferrals: simulation.successful
        };
        
        await user.save();
        
        console.log(`✅ ${user.username}: ${simulation.total} referidos totales, ${simulation.successful} exitosos`);
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
      const stats = user.referralStats || { totalReferrals: 0, successfulReferrals: 0 };
      const successRate = stats.totalReferrals > 0 ? ((stats.successfulReferrals / stats.totalReferrals) * 100).toFixed(1) : 0;
      
      console.log(`   👤 ${user.username}: ${stats.totalReferrals} total, ${stats.successfulReferrals} exitosos (${successRate}% éxito)`);
    });
    
    // Calcular estadísticas generales
    const totalReferrals = updatedUsers.reduce((sum, user) => sum + (user.referralStats?.totalReferrals || 0), 0);
    const totalSuccessful = updatedUsers.reduce((sum, user) => sum + (user.referralStats?.successfulReferrals || 0), 0);
    const overallSuccessRate = totalReferrals > 0 ? ((totalSuccessful / totalReferrals) * 100).toFixed(1) : 0;
    
    console.log('\n🎯 Estadísticas generales:');
    console.log(`   📈 Total de referidos: ${totalReferrals}`);
    console.log(`   🎯 Total exitosos: ${totalSuccessful}`);
    console.log(`   📊 Tasa de éxito general: ${overallSuccessRate}%`);
    
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
