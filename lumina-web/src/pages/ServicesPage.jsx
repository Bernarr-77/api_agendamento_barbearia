import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './ServicesPage.css';

export default function ServicesPage() {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setActiveTab(category);
    }
    loadProviders();
  }, [searchParams]);

  const loadProviders = async () => {
    try {
      const response = await api.get('/providers/');
      const providerList = response.data;
      setProviders(providerList);

      // Carrega serviços de todos os providers retornados
      const allServices = [];
      for (const provider of providerList) {
        try {
          const servicesRes = await api.get(`/services/${provider.id}`);
          const servicesWithProvider = servicesRes.data.map((s) => ({
            ...s,
            provider_name: provider.name,
            provider_specialty: provider.specialty,
            provider_id: provider.id,
            // Normaliza a categoria para garantir que o filtro funcione
            category: s.category?.toUpperCase()
          }));
          allServices.push(...servicesWithProvider);
        } catch (err) {
          console.warn(`Não foi possível carregar serviços para o provider ${provider.id}`);
        }
      }
      setServices(allServices);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (service) => {
    navigate(`/booking/${service.id}`, { 
      state: { providerId: service.provider_id, service } 
    });
  };

  const filteredServices = services.filter((s) => {
    if (activeTab === 'all') return true;
    const cat = s.category?.toUpperCase() || '';
    if (activeTab === 'ESTETICO') return cat === 'ESTETICO';
    if (activeTab === 'ODONTOLOGICO') return cat === 'ODONTOLOGICO';
    return true;
  });

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'ESTETICO', label: 'Estéticos' },
    { id: 'ODONTOLOGICO', label: 'Odontológicos' },
  ];

  return (
    <div className="page" id="services-page">
      <div className="container">
        <header className="services-header animate-fade-in">
          <h1>Serviços</h1>
          <p>Escolha o serviço ideal para você</p>
        </header>

        {/* Tabs */}
        <div className="services-tabs animate-fade-in delay-1" id="services-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services List */}
        {loading ? (
          <LoadingSpinner text="Carregando serviços..." />
        ) : filteredServices.length === 0 ? (
          <div className="services-empty animate-fade-in">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3>Nenhum serviço encontrado</h3>
            <p>Tente outra categoria</p>
          </div>
        ) : (
          <div className="services-list">
            {filteredServices.map((service, index) => (
              <div key={service.id} className={`animate-fade-in-up delay-${Math.min(index + 2, 5)}`}>
                <ServiceCard service={service} onBook={handleBook} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
}
