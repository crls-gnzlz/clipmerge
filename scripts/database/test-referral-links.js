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

// Función para probar la generación de enlaces de referidos
const testReferralLinks = async () => {
  try {
    console.log('🔗 Probando generación de enlaces de referidos...\n');
    
    // Mostrar configuración
    console.log('📋 Configuración actual:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'No configurado'}`);
    console.log(`   Config frontendUrl: ${config.frontendUrl}`);
    console.log('');
    
    // Obtener todos los usuarios
    const allUsers = await User.find({}).select('username referralId');
    
    if (allUsers.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    console.log(`📊 Usuarios encontrados: ${allUsers.length}\n`);
    
    // Probar generación de enlaces
    console.log('🔗 Enlaces de referidos generados:');
    
    allUsers.forEach(user => {
      if (user.referralId) {
        // Usar el método del modelo (para comparar)
        const modelLink = user.getReferralLink();
        
        // Generar enlace manualmente con la configuración actual
        const configLink = `${config.frontendUrl}/ref/${user.referralId}`;
        
        console.log(`\n👤 ${user.username}:`);
        console.log(`   Referral ID: ${user.referralId}`);
        console.log(`   Enlace (modelo): ${modelLink}`);
        console.log(`   Enlace (config): ${configLink}`);
        
        // Verificar que el enlace apunte al frontend
        if (configLink.includes('localhost:5173') || configLink.includes('clipchain.app')) {
          console.log(`   ✅ Enlace correcto (apunta al frontend)`);
        } else {
          console.log(`   ❌ Enlace incorrecto (apunta al backend)`);
        }
      }
    });
    
    // Verificar que no haya enlaces apuntando al puerto 9000
    console.log('\n🔍 Verificación de URLs:');
    const backendPort = config.port || 9000;
    const hasBackendLinks = allUsers.some(user => {
      if (!user.referralId) return false;
      const link = `${config.frontendUrl}/ref/${user.referralId}`;
      return link.includes(`:${backendPort}`);
    });
    
    if (!hasBackendLinks) {
      console.log('✅ Todos los enlaces apuntan al frontend');
    } else {
      console.log('❌ Algunos enlaces apuntan al backend');
    }
    
    console.log('\n🎯 URLs esperadas:');
    console.log(`   Desarrollo: http://localhost:5173/ref/[REFERRAL_ID]`);
    console.log(`   Producción: https://clipchain.app/ref/[REFERRAL_ID]`);
    
    console.log('\n🎉 Prueba de enlaces completada!');
    
  } catch (error) {
    console.error('❌ Error probando enlaces de referidos:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Iniciando prueba de enlaces de referidos...\n');
    
    await testReferralLinks();
    
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
