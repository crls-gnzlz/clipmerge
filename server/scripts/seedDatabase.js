import mongoose from 'mongoose';
import config from '../config/config.js';

// Import models
import { User } from '../models/User.js';
import { Clip } from '../models/Clip.js';
import { Chain } from '../models/Chain.js';

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@clipchain.com',
    password: 'admin123',
    displayName: 'Administrator',
    bio: 'System administrator',
    isAdmin: true,
    isVerified: true
  },
  {
    username: 'demo_user',
    email: 'demo@clipchain.com',
    password: 'demo123',
    displayName: 'Demo User',
    bio: 'Demo user for testing',
    isVerified: true
  },
  {
    username: 'content_creator',
    email: 'creator@clipchain.com',
    password: 'creator123',
    displayName: 'Content Creator',
    bio: 'Professional creator of clips and chains',
    isVerified: true
  }
];

const sampleClips = [
  {
    title: 'Introducción a React Hooks',
    videoId: 'TNhaISOU2GU',
    startTime: 120,
    endTime: 300,
    description: 'Explicación clara de useState y useEffect en React con ejemplos prácticos',
    tags: ['programming', 'react', 'javascript', 'hooks', 'frontend', 'web-development'],
    isPublic: true,
    duration: 180,
    thumbnailUrl: 'https://img.youtube.com/vi/TNhaISOU2GU/maxresdefault.jpg',
    views: 45
  },
  {
    title: 'Mejor momento del partido',
    videoId: 'dQw4w9WgXcQ',
    startTime: 45,
    endTime: 120,
    description: 'El gol más espectacular del partido con técnica increíble',
    tags: ['football', 'goal', 'sports', 'highlight', 'soccer', 'amazing'],
    isPublic: true,
    duration: 75,
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    views: 128
  },
  {
    title: 'Tutorial de cocina - Pasta perfecta',
    videoId: 'abc123def',
    startTime: 60,
    endTime: 180,
    description: 'Guía paso a paso para hacer pasta perfecta con consejos de chef profesional',
    tags: ['cooking', 'pasta', 'tutorial', 'food', 'chef', 'italian-cuisine'],
    isPublic: true,
    duration: 120,
    thumbnailUrl: 'https://img.youtube.com/vi/abc123def/maxresdefault.jpg',
    views: 89
  },
  {
    title: 'Clase de guitarra - Acordes básicos',
    videoId: 'xyz789ghi',
    startTime: 45,
    endTime: 150,
    description: 'Aprende los acordes esenciales de guitarra para principiantes con demostraciones claras',
    tags: ['music', 'guitar', 'tutorial', 'chords', 'beginner', 'learning'],
    isPublic: true,
    duration: 105,
    thumbnailUrl: 'https://img.youtube.com/vi/xyz789ghi/maxresdefault.jpg',
    views: 67
  },
  {
    title: 'Chiste gracioso del show',
    videoId: 'jNQXAC9IVRw',
    startTime: 30,
    endTime: 90,
    description: 'El momento más divertido del programa nocturno que se volvió viral',
    tags: ['comedy', 'entertainment', 'funny', 'late-show', 'viral', 'humor'],
    isPublic: true,
    duration: 60,
    thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    views: 234
  },
  {
    title: 'Patrones avanzados de React',
    videoId: 'advanced-react-123',
    startTime: 200,
    endTime: 450,
    description: 'Patrones avanzados de React incluyendo render props, HOCs y hooks personalizados',
    tags: ['programming', 'react', 'advanced', 'patterns', 'javascript', 'web-development'],
    isPublic: true,
    duration: 250,
    thumbnailUrl: 'https://img.youtube.com/vi/advanced-react-123/maxresdefault.jpg',
    views: 156
  },
  {
    title: 'Highlights de baloncesto - Mejores jugadas',
    videoId: 'basketball-highlights-456',
    startTime: 15,
    endTime: 95,
    description: 'Top 10 jugadas de baloncesto de la semana con mates y tiros increíbles',
    tags: ['basketball', 'sports', 'highlights', 'dunks', 'amazing', 'top-plays'],
    isPublic: true,
    duration: 80,
    thumbnailUrl: 'https://img.youtube.com/vi/basketball-highlights-456/maxresdefault.jpg',
    views: 312
  },
  {
    title: 'Tutorial de piano - Sonata Claro de Luna',
    videoId: 'piano-moonlight-789',
    startTime: 30,
    endTime: 180,
    description: 'Aprende a tocar la Sonata Claro de Luna de Beethoven con posicionamiento detallado de dedos',
    tags: ['music', 'piano', 'classical', 'beethoven', 'tutorial', 'moonlight-sonata'],
    isPublic: true,
    duration: 150,
    thumbnailUrl: 'https://img.youtube.com/vi/piano-moonlight-789/maxresdefault.jpg',
    views: 98
  }
];

const sampleChains = [
  {
    name: 'Tutorial completo de React',
    description: 'Serie de clips para aprender React desde cero hasta avanzado, perfecto para principiantes y desarrolladores intermedios',
    category: 'tutorial',
    difficulty: 'beginner',
    tags: ['react', 'javascript', 'programming', 'tutorial', 'web-development', 'series'],
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Mejores momentos deportivos',
    description: 'Compilación de los momentos más emocionantes del deporte incluyendo fútbol, baloncesto y otras jugadas increíbles',
    category: 'entertainment',
    difficulty: 'beginner',
    tags: ['sports', 'highlights', 'entertainment', 'football', 'basketball', 'amazing'],
    isPublic: true,
    isFeatured: false
  },
  {
    name: 'Cocina italiana básica',
    description: 'Aprende a cocinar platos italianos tradicionales con técnicas profesionales',
    category: 'education',
    difficulty: 'intermediate',
    tags: ['cooking', 'italian', 'food', 'education', 'professional', 'skills'],
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Entretenimiento y comedia',
    description: 'Una colección divertida de momentos entretenidos y clips de comedia para relajarse',
    category: 'entertainment',
    difficulty: 'beginner',
    tags: ['entertainment', 'comedy', 'funny', 'relaxation', 'viral', 'humor'],
    isPublic: true,
    isFeatured: false
  }
];

// Function to connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Function to clear database
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Clip.deleteMany({});
    await Chain.deleteMany({});
    console.log('🗑️ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

// Function to create users
const createUsers = async () => {
  try {
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Don't hash password here - let the User model's pre-save hook handle it
      const user = new User({
        ...userData
        // password will be automatically hashed by the User model
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`👤 User created: ${user.username}`);
    }
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
};

// Function to create clips
const createClips = async (users) => {
  try {
    const createdClips = [];
    const demoUser = users.find(u => u.username === 'demo_user');
    const creator = users.find(u => u.username === 'content_creator');
    
    for (let i = 0; i < sampleClips.length; i++) {
      const clipData = sampleClips[i];
      const author = i < 3 ? demoUser : creator;
      
      const clip = new Clip({
        ...clipData,
        author: author._id,
        // Calculate duration if not provided
        duration: clipData.duration || (clipData.endTime - clipData.startTime)
      });
      
      await clip.save();
      createdClips.push(clip);
      console.log(`🎬 Clip created: ${clip.title}`);
    }
    
    return createdClips;
  } catch (error) {
    console.error('❌ Error creating clips:', error);
    throw error;
  }
};

// Function to create chains
const createChains = async (users, clips) => {
  try {
    const createdChains = [];
    const demoUser = users.find(u => u.username === 'demo_user');
    const creator = users.find(u => u.username === 'content_creator');
    
    // Chain 1: React Tutorial
    const reactChain = new Chain({
      ...sampleChains[0],
      author: demoUser._id,
      clips: [
        {
          clip: clips[0]._id, // React Hooks clip
          order: 0,
          transition: 'fade',
          transitionDuration: 0.5
        },
        {
          clip: clips[5]._id, // Advanced React Patterns
          order: 1,
          transition: 'crossfade',
          transitionDuration: 0.8
        }
      ]
    });
    await reactChain.save();
    createdChains.push(reactChain);
    console.log(`🔗 Chain created: ${reactChain.name}`);
    
    // Chain 2: Sports moments
    const sportsChain = new Chain({
      ...sampleChains[1],
      author: demoUser._id,
      clips: [
        {
          clip: clips[1]._id, // Football clip
          order: 0,
          transition: 'cut',
          transitionDuration: 0.3
        },
        {
          clip: clips[6]._id, // Basketball highlights
          order: 1,
          transition: 'slide',
          transitionDuration: 0.6
        }
      ]
    });
    await sportsChain.save();
    createdChains.push(sportsChain);
    console.log(`🔗 Chain created: ${sportsChain.name}`);
    
    // Chain 3: Italian cooking
    const cookingChain = new Chain({
      ...sampleChains[2],
      author: creator._id,
      clips: [
        {
          clip: clips[2]._id, // Pasta tutorial
          order: 0,
          transition: 'crossfade',
          transitionDuration: 0.8
        },
        {
          clip: clips[3]._id, // Guitar tutorial
          order: 1,
          transition: 'fade',
          transitionDuration: 0.5
        },
        {
          clip: clips[7]._id, // Piano tutorial
          order: 2,
          transition: 'slide',
          transitionDuration: 0.7
        }
      ]
    });
    await cookingChain.save();
    createdChains.push(cookingChain);
    console.log(`🔗 Chain created: ${cookingChain.name}`);
    
    // Chain 4: Entertainment & Comedy
    const entertainmentChain = new Chain({
      ...sampleChains[3],
      author: demoUser._id,
      clips: [
        {
          clip: clips[4]._id, // Funny moment
          order: 0,
          transition: 'cut',
          transitionDuration: 0.4
        }
      ]
    });
    await entertainmentChain.save();
    createdChains.push(entertainmentChain);
    console.log(`🔗 Chain created: ${entertainmentChain.name}`);
    
    return createdChains;
  } catch (error) {
    console.error('❌ Error creating chains:', error);
    throw error;
  }
};

// Function to update user statistics and chain metadata
const updateUserStats = async (users, clips, chains) => {
  try {
    // Update chain metadata (total duration, etc.)
    for (const chain of chains) {
      let totalDuration = 0;
      for (const clipRef of chain.clips) {
        const clip = clips.find(c => c._id.toString() === clipRef.clip.toString());
        if (clip) {
          totalDuration += clip.duration || (clip.endTime - clip.startTime);
        }
      }
      
      chain.totalDuration = totalDuration;
      await chain.save();
      console.log(`📊 Chain metadata updated: ${chain.name} (${totalDuration}s)`);
    }
    
    // Update user statistics
    for (const user of users) {
      const userClips = clips.filter(clip => clip.author.toString() === user._id.toString());
      const userChains = chains.filter(chain => chain.author.toString() === user._id.toString());
      
      user.stats.totalClips = userClips.length;
      user.stats.totalChains = userChains.length;
      
      // Calculate total views
      const totalViews = userClips.reduce((sum, clip) => sum + (clip.views || 0), 0);
      
      user.stats.totalViews = totalViews;
      
      await user.save();
      console.log(`📊 Statistics updated for: ${user.username}`);
    }
  } catch (error) {
    console.error('❌ Error updating statistics:', error);
  }
};

// Main function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database population...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing database
    await clearDatabase();
    
    // Create users
    console.log('\n👥 Creating users...');
    const users = await createUsers();
    
    // Create clips
    console.log('\n🎬 Creating clips...');
    const clips = await createClips(users);
    
    // Create chains
    console.log('\n🔗 Creating chains...');
    const chains = await createChains(users, clips);
    
    // Update statistics
    console.log('\n📊 Updating statistics...');
    await updateUserStats(users, clips, chains);
    
    console.log('\n✅ Database populated successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Clips: ${clips.length}`);
    console.log(`   - Chains: ${chains.length}`);
    
    // Show access credentials
    console.log('\n🔑 Access credentials:');
    console.log('   Admin: admin@clipchain.com / admin123');
    console.log('   Demo: demo@clipchain.com / demo123');
    console.log('   Creator: creator@clipchain.com / creator123');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
