// Configuración de la API del backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Clase para manejar las llamadas a la API
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    // Initialize token from localStorage if available
    this.initializeToken();
  }

  // Initialize token from localStorage
  initializeToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.token = localStorage.getItem('authToken');
      }
    } catch (error) {
      console.warn('Could not access localStorage:', error);
      this.token = null;
    }
  }

  // Configurar headers comunes
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔑 API Headers: Token incluido en Authorization header');
    } else {
      console.log('⚠️ API Headers: No hay token disponible');
    }

    return headers;
  }

  // Método para verificar el estado del token
  getTokenStatus() {
    return {
      hasToken: !!this.token,
      tokenValue: this.token,
      localStorageToken: typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    };
  }

  // Establecer token de autenticación
  setToken(token) {
    console.log('🔑 apiService.setToken called with:', token ? 'Token presente' : 'Token ausente');
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('authToken', token);
        console.log('🔑 apiService: Token guardado en localStorage');
        
        // Verify it was actually stored
        const storedToken = localStorage.getItem('authToken');
        console.log('🔑 apiService: Verificación - token en localStorage:', storedToken ? 'Presente' : 'Ausente');
      } else {
        localStorage.removeItem('authToken');
        console.log('🔑 apiService: Token removido de localStorage');
      }
    } catch (error) {
      console.warn('Could not access localStorage:', error);
    }
  }

  // Refrescar token desde localStorage
  refreshToken() {
    this.initializeToken();
  }

  // Método genérico para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Si la respuesta no es exitosa, lanzar error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos para Clips
  async getClips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clips?${queryString}`);
  }

  async getClipById(id) {
    return this.request(`/clips/${id}`);
  }

  async createClip(clipData) {
    return this.request('/clips', {
      method: 'POST',
      body: JSON.stringify(clipData),
    });
  }

  async updateClip(id, clipData) {
    return this.request(`/clips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clipData),
    });
  }

  async deleteClip(id) {
    return this.request(`/clips/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleClipReaction(id, reactionType) {
    return this.request(`/clips/${id}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  }

  async getPopularClips(limit = 10) {
    return this.request(`/clips/popular?limit=${limit}`);
  }

  async getClipsByTags(tags) {
    return this.request(`/clips/tags/${tags}`);
  }

  async getUserClips(userId = null) {
    const endpoint = userId ? `/clips/user/${userId}` : '/clips/user';
    return this.request(endpoint);
  }

  async analyzeVideo(videoUrl) {
    return this.request('/clips/analyze-video', {
      method: 'POST',
      body: JSON.stringify({ videoUrl }),
    });
  }

  async getAllTags() {
    return this.request('/clips/tags');
  }

  // Métodos para Chains
  async getChains(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/chains?${queryString}`);
  }

  async getChainById(id) {
    return this.request(`/chains/${id}`);
  }

  async createChain(chainData) {
    return this.request('/chains', {
      method: 'POST',
      body: JSON.stringify(chainData),
    });
  }

  async updateChain(id, chainData) {
    return this.request(`/chains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chainData),
    });
  }

  async deleteChain(id) {
    return this.request(`/chains/${id}`, {
      method: 'DELETE',
    });
  }

  async addClipToChain(chainId, clipId, order = null) {
    const body = order !== null ? { clipId, order } : { clipId };
    return this.request(`/chains/${chainId}/clips`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async reorderChainClips(chainId, clipOrders) {
    return this.request(`/chains/${chainId}/clips/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ clipOrders }),
    });
  }

  async toggleChainReaction(id, reactionType) {
    return this.request(`/chains/${id}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  }

  async incrementChainPlays(id) {
    return this.request(`/chains/${id}/play`, {
      method: 'POST',
    });
  }

  async getPopularChains(limit = 10) {
    return this.request(`/chains/popular?limit=${limit}`);
  }

  async getChainsByCategory(category, limit = 20) {
    return this.request(`/chains/category/${category}?limit=${limit}`);
  }

  async getUserChains(userId = null) {
    const endpoint = userId ? `/chains/user/${userId}` : '/chains/user';
    return this.request(endpoint);
  }

  async getRecentChains(limit = 5) {
    return this.request(`/chains?limit=${limit}&sort=updatedAt&order=-1`);
  }

  // Métodos para Usuarios
  async register(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async getPublicProfile(username) {
    return this.request(`/users/profile/${username}`);
  }

  async getUserStats(userId) {
    return this.request(`/users/stats/${userId}`);
  }

  async searchUsers(search, limit = 10) {
    return this.request(`/users/search?search=${search}&limit=${limit}`);
  }

  async checkAvailability(field, value) {
    return this.request(`/users/check-availability?field=${field}&value=${value}`);
  }

  refreshToken() {
    this.initializeToken();
  }

  async logout() {
    return this.request('/users/logout', {
      method: 'POST',
    });
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.token;
  }

  // Método para limpiar datos de autenticación
  clearAuth() {
    this.token = null;
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Could not access localStorage:', error);
    }
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

// Exportar la instancia y la clase
export default apiService;
export { ApiService };
