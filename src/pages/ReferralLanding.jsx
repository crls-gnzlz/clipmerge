import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../lib/api';

const ReferralLanding = () => {
  const { referralId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [referrer, setReferrer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleReferral = async () => {
      try {
        setIsLoading(true);
        
        // Verificar que el referralId existe
        if (!referralId) {
          setError('Referral ID no válido');
          return;
        }

        // Buscar información del usuario referidor
        const response = await apiService.findUserByReferralId(referralId);
        
        if (response.success) {
          // Guardar el referralId en localStorage para usarlo durante el registro
          localStorage.setItem('referralId', referralId);
          
          // Redirigir inmediatamente al registro
          navigate('/register', { 
            state: { 
              referralId,
              referrer: response.data.user 
            }
          });
          
        } else {
          setError('Referral ID no encontrado');
        }
        
      } catch (error) {
        console.error('Error procesando referral:', error);
        setError('Error procesando el referral');
      } finally {
        setIsLoading(false);
      }
    };

    handleReferral();
  }, [referralId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando tu referral...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Referral No Válido</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Ir al Registro
          </button>
        </div>
      </div>
    );
  }

  // Esta parte nunca se ejecutará porque redirigimos inmediatamente
  // pero la mantenemos por si acaso
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al registro...</p>
      </div>
    </div>
  );
};

export default ReferralLanding;
