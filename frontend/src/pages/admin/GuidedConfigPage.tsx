import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

interface BusinessType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  features: string[];
  configSteps: ConfigStep[];
}

interface ConfigStep {
  id: string;
  title: string;
  description: string;
  type: 'menu' | 'site' | 'ecommerce' | 'custom';
  questions: ConfigQuestion[];
  autoConfig?: any;
}

interface ConfigQuestion {
  id: string;
  question: string;
  type: 'boolean' | 'text' | 'select' | 'multiselect';
  options?: string[];
  defaultValue?: any;
  dependsOn?: string;
  dependsValue?: any;
}

const GuidedConfigPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);

  const businessTypes: BusinessType[] = [
    {
      id: 'legal-office',
      name: 'Despacho Legal',
      description: 'Gestión completa de casos legales, clientes y documentación',
      icon: '⚖️',
      category: 'Legal',
      features: [
        'Gestión de expedientes y casos',
        'Sistema de citas y calendario',
        'Documentación legal',
        'Facturación y pagos',
        'Comunicación con clientes'
      ],
      configSteps: [
        {
          id: 'basic-info',
          title: 'Información Básica del Despacho',
          description: 'Configura los datos fundamentales de tu despacho',
          type: 'site',
          questions: [
            {
              id: 'office_name',
              question: '¿Cuál es el nombre de tu despacho legal?',
              type: 'text',
              defaultValue: 'Despacho Legal'
            },
            {
              id: 'specialties',
              question: '¿En qué especialidades legales te enfocas?',
              type: 'multiselect',
              options: [
                'Derecho Civil',
                'Derecho Penal',
                'Derecho Laboral',
                'Derecho Mercantil',
                'Derecho Administrativo',
                'Derecho de Familia',
                'Derecho Inmobiliario',
                'Derecho Fiscal'
              ]
            },
            {
              id: 'office_hours',
              question: '¿Cuáles son tus horarios de atención?',
              type: 'text',
              defaultValue: 'Lunes a Viernes: 9:00 - 18:00'
            }
          ]
        },
        {
          id: 'menu-setup',
          title: 'Configuración de Menús',
          description: 'Personaliza la navegación para abogados y clientes',
          type: 'menu',
          questions: [
            {
              id: 'enable_consultations',
              question: '¿Quieres ofrecer consultas online?',
              type: 'boolean',
              defaultValue: true
            },
            {
              id: 'enable_document_templates',
              question: '¿Quieres vender plantillas de documentos legales?',
              type: 'boolean',
              defaultValue: true
            },
            {
              id: 'enable_payment_plans',
              question: '¿Quieres ofrecer planes de pago a plazos?',
              type: 'boolean',
              defaultValue: false
            }
          ]
        },
        {
          id: 'ecommerce-setup',
          title: 'Configuración de Tienda Online',
          description: 'Configura la venta de servicios y productos legales',
          type: 'ecommerce',
          questions: [
            {
              id: 'enable_online_payments',
              question: '¿Quieres habilitar pagos online?',
              type: 'boolean',
              defaultValue: true
            },
            {
              id: 'payment_methods',
              question: '¿Qué métodos de pago quieres aceptar?',
              type: 'multiselect',
              options: ['PayPal', 'Tarjeta de Crédito', 'Transferencia Bancaria'],
              dependsOn: 'enable_online_payments',
              dependsValue: true
            },
            {
              id: 'consultation_price',
              question: '¿Cuál será el precio de la consulta inicial?',
              type: 'text',
              defaultValue: '50',
              dependsOn: 'enable_consultations',
              dependsValue: true
            }
          ]
        }
      ]
    },
    {
      id: 'consulting-firm',
      name: 'Empresa de Consultoría',
      description: 'Servicios de consultoría empresarial y estratégica',
      icon: '💼',
      category: 'Business',
      features: [
        'Consultoría estratégica',
        'Análisis de procesos',
        'Gestión de proyectos',
        'Formación empresarial',
        'Auditorías y reportes'
      ],
      configSteps: [
        {
          id: 'basic-info',
          title: 'Información de la Consultora',
          description: 'Configura los datos de tu empresa de consultoría',
          type: 'site',
          questions: [
            {
              id: 'company_name',
              question: '¿Cuál es el nombre de tu consultora?',
              type: 'text',
              defaultValue: 'Consultora Empresarial'
            },
            {
              id: 'consulting_areas',
              question: '¿En qué áreas de consultoría te especializas?',
              type: 'multiselect',
              options: [
                'Estrategia Empresarial',
                'Optimización de Procesos',
                'Recursos Humanos',
                'Finanzas Corporativas',
                'Marketing Digital',
                'Transformación Digital',
                'Gestión de Calidad',
                'Compliance y Legal'
              ]
            }
          ]
        },
        {
          id: 'service-catalog',
          title: 'Catálogo de Servicios',
          description: 'Configura los servicios que ofreces',
          type: 'ecommerce',
          questions: [
            {
              id: 'service_types',
              question: '¿Qué tipos de servicios quieres ofrecer?',
              type: 'multiselect',
              options: [
                'Consultoría por Horas',
                'Proyectos Completos',
                'Auditorías',
                'Formación',
                'Mentoring',
                'Análisis de Datos'
              ]
            },
            {
              id: 'enable_packages',
              question: '¿Quieres ofrecer paquetes de servicios?',
              type: 'boolean',
              defaultValue: true
            }
          ]
        }
      ]
    },
    {
      id: 'online-academy',
      name: 'Academia Online',
      description: 'Plataforma de formación y cursos online',
      icon: '🎓',
      category: 'Education',
      features: [
        'Cursos online',
        'Sistema de evaluación',
        'Certificaciones',
        'Comunidad de estudiantes',
        'Contenido multimedia'
      ],
      configSteps: [
        {
          id: 'academy-info',
          title: 'Información de la Academia',
          description: 'Configura los datos de tu academia online',
          type: 'site',
          questions: [
            {
              id: 'academy_name',
              question: '¿Cuál es el nombre de tu academia?',
              type: 'text',
              defaultValue: 'Academia Online'
            },
            {
              id: 'academic_areas',
              question: '¿En qué áreas académicas te especializas?',
              type: 'multiselect',
              options: [
                'Tecnología y Programación',
                'Negocios y Emprendimiento',
                'Idiomas',
                'Arte y Diseño',
                'Salud y Bienestar',
                'Ciencias y Matemáticas',
                'Humanidades',
                'Formación Profesional'
              ]
            }
          ]
        },
        {
          id: 'course-structure',
          title: 'Estructura de Cursos',
          description: 'Configura cómo organizarás tus cursos',
          type: 'custom',
          questions: [
            {
              id: 'course_types',
              question: '¿Qué tipos de cursos quieres ofrecer?',
              type: 'multiselect',
              options: [
                'Cursos Autodidactas',
                'Cursos con Tutor',
                'Bootcamps Intensivos',
                'Webinars',
                'Talleres Prácticos',
                'Certificaciones'
              ]
            },
            {
              id: 'enable_subscriptions',
              question: '¿Quieres ofrecer suscripciones mensuales?',
              type: 'boolean',
              defaultValue: true
            }
          ]
        }
      ]
    },
    {
      id: 'digital-agency',
      name: 'Agencia Digital',
      description: 'Servicios de marketing digital y desarrollo web',
      icon: '🚀',
      category: 'Digital',
      features: [
        'Desarrollo web',
        'Marketing digital',
        'SEO y SEM',
        'Redes sociales',
        'Analytics y reportes'
      ],
      configSteps: [
        {
          id: 'agency-info',
          title: 'Información de la Agencia',
          description: 'Configura los datos de tu agencia digital',
          type: 'site',
          questions: [
            {
              id: 'agency_name',
              question: '¿Cuál es el nombre de tu agencia?',
              type: 'text',
              defaultValue: 'Agencia Digital'
            },
            {
              id: 'digital_services',
              question: '¿Qué servicios digitales ofreces?',
              type: 'multiselect',
              options: [
                'Desarrollo Web',
                'Diseño Gráfico',
                'Marketing Digital',
                'SEO y SEM',
                'Gestión de Redes Sociales',
                'Email Marketing',
                'Analytics y Reportes',
                'Consultoría Digital'
              ]
            }
          ]
        },
        {
          id: 'project-management',
          title: 'Gestión de Proyectos',
          description: 'Configura el sistema de gestión de proyectos',
          type: 'custom',
          questions: [
            {
              id: 'project_tracking',
              question: '¿Quieres que los clientes puedan seguir sus proyectos?',
              type: 'boolean',
              defaultValue: true
            },
            {
              id: 'client_portal',
              question: '¿Quieres crear un portal para clientes?',
              type: 'boolean',
              defaultValue: true
            }
          ]
        }
      ]
    },
    {
      id: 'health-clinic',
      name: 'Clínica de Salud',
      description: 'Gestión de citas médicas y pacientes',
      icon: '🏥',
      category: 'Health',
      features: [
        'Gestión de citas',
        'Historiales médicos',
        'Facturación médica',
        'Comunicación con pacientes',
        'Reportes médicos'
      ],
      configSteps: [
        {
          id: 'clinic-info',
          title: 'Información de la Clínica',
          description: 'Configura los datos de tu clínica',
          type: 'site',
          questions: [
            {
              id: 'clinic_name',
              question: '¿Cuál es el nombre de tu clínica?',
              type: 'text',
              defaultValue: 'Clínica de Salud'
            },
            {
              id: 'medical_specialties',
              question: '¿Qué especialidades médicas ofreces?',
              type: 'multiselect',
              options: [
                'Medicina General',
                'Cardiología',
                'Dermatología',
                'Ginecología',
                'Pediatría',
                'Psicología',
                'Fisioterapia',
                'Odontología'
              ]
            }
          ]
        },
        {
          id: 'appointment-system',
          title: 'Sistema de Citas',
          description: 'Configura el sistema de citas médicas',
          type: 'custom',
          questions: [
            {
              id: 'online_booking',
              question: '¿Quieres que los pacientes puedan reservar citas online?',
              type: 'boolean',
              defaultValue: true
            },
            {
              id: 'appointment_reminders',
              question: '¿Quieres enviar recordatorios de citas?',
              type: 'boolean',
              defaultValue: true
            }
          ]
        }
      ]
    }
  ];

  const handleBusinessTypeSelect = (businessType: BusinessType) => {
    setSelectedBusinessType(businessType);
    setCurrentStep(0);
    setAnswers({});
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isQuestionVisible = (question: ConfigQuestion): boolean => {
    if (!question.dependsOn) return true;
    return answers[question.dependsOn] === question.dependsValue;
  };

  const getCurrentStep = () => {
    if (!selectedBusinessType) return null;
    return selectedBusinessType.configSteps[currentStep];
  };

  const handleNextStep = () => {
    if (currentStep < selectedBusinessType!.configSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar configuración
      handleFinishConfiguration();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishConfiguration = async () => {
    setConfiguring(true);
    try {
      // Aplicar configuraciones automáticamente
      await applyConfiguration();
      
      // Redirigir a las páginas de configuración específicas
      navigate('/admin/menu-config');
    } catch (error) {
      console.error('Error applying configuration:', error);
    } finally {
      setConfiguring(false);
    }
  };

  const applyConfiguration = async () => {
    // Aplicar configuraciones del sitio
    const siteConfigs = generateSiteConfigs();
    for (const config of siteConfigs) {
      await axios.post('/api/site-config', config);
    }

    // Aplicar configuraciones de menús
    const menuConfigs = generateMenuConfigs();
    for (const config of menuConfigs) {
      await axios.post('/api/menu-config', config);
    }
  };

  const generateSiteConfigs = () => {
    const configs = [];
    
    // Configuraciones básicas según el tipo de negocio
    if (selectedBusinessType?.id === 'legal-office') {
      configs.push(
        { key: 'site_name', value: answers.office_name || 'Despacho Legal', type: 'string', category: 'branding', isPublic: true },
        { key: 'site_description', value: 'Servicios legales profesionales', type: 'string', category: 'branding', isPublic: true },
        { key: 'office_hours', value: answers.office_hours || 'Lunes a Viernes: 9:00 - 18:00', type: 'string', category: 'contact', isPublic: true }
      );
    } else if (selectedBusinessType?.id === 'consulting-firm') {
      configs.push(
        { key: 'site_name', value: answers.company_name || 'Consultora Empresarial', type: 'string', category: 'branding', isPublic: true },
        { key: 'site_description', value: 'Consultoría empresarial y estratégica', type: 'string', category: 'branding', isPublic: true }
      );
    }
    // Agregar más configuraciones según el tipo de negocio...

    return configs;
  };

  const generateMenuConfigs = () => {
    const configs = [];
    
    // Generar menús según el tipo de negocio y respuestas
    if (selectedBusinessType?.id === 'legal-office') {
      // Menú para abogados
      const lawyerMenu = {
        name: 'Menú Abogado',
        role: 'ABOGADO',
        orientation: 'horizontal',
        isActive: true,
        items: [
          { label: 'Dashboard', url: '/dashboard', icon: '🏠', order: 1, isVisible: true, isExternal: false },
          { label: 'Expedientes', url: '/lawyer/cases', icon: '📋', order: 2, isVisible: true, isExternal: false },
          { label: 'Citas', url: '/lawyer/appointments', icon: '📅', order: 3, isVisible: true, isExternal: false }
        ]
      };

      if (answers.enable_consultations) {
        lawyerMenu.items.push(
          { label: 'Consultas', url: '/lawyer/consultations', icon: '💬', order: 4, isVisible: true, isExternal: false }
        );
      }

      configs.push(lawyerMenu);
    }

    return configs;
  };

  const renderQuestion = (question: ConfigQuestion) => {
    if (!isQuestionVisible(question)) return null;

    switch (question.type) {
      case 'boolean':
        return (
          <div key={question.id} className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={answers[question.id] ?? question.defaultValue}
                onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-lg font-medium text-gray-900">{question.question}</span>
            </label>
          </div>
        );

      case 'text':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-lg font-medium text-gray-900 mb-2">
              {question.question}
            </label>
            <input
              type="text"
              value={answers[question.id] ?? question.defaultValue ?? ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escribe tu respuesta..."
            />
          </div>
        );

      case 'select':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-lg font-medium text-gray-900 mb-2">
              {question.question}
            </label>
            <select
              value={answers[question.id] ?? ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona una opción</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-lg font-medium text-gray-900 mb-2">
              {question.question}
            </label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={(answers[question.id] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = answers[question.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleAnswerChange(question.id, newValues);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 Configuración Guiada del Sistema
          </h1>
          <p className="text-lg text-gray-600">
            Te ayudaremos a configurar tu sistema paso a paso según tu tipo de negocio
          </p>
        </div>

        {!selectedBusinessType ? (
          /* Selección de tipo de negocio */
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ¿Qué tipo de negocio quieres configurar?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businessTypes.map((businessType) => (
                <div
                  key={businessType.id}
                  onClick={() => handleBusinessTypeSelect(businessType)}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{businessType.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {businessType.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {businessType.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      <strong>Características principales:</strong>
                      <ul className="mt-2 space-y-1">
                        {businessType.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Configuración paso a paso */
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Paso {currentStep + 1} de {selectedBusinessType.configSteps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentStep + 1) / selectedBusinessType.configSteps.length) * 100)}% completado
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / selectedBusinessType.configSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Business type info */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{selectedBusinessType.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Configurando: {selectedBusinessType.name}
                  </h3>
                  <p className="text-gray-600">{selectedBusinessType.description}</p>
                </div>
              </div>
            </div>

            {/* Current step */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getCurrentStep()?.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {getCurrentStep()?.description}
              </p>

              {/* Questions */}
              <div className="space-y-6">
                {getCurrentStep()?.questions.map(renderQuestion)}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedBusinessType(null)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Cambiar tipo de negocio
              </button>

              <div className="flex space-x-4">
                {currentStep > 0 && (
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    ← Anterior
                  </button>
                )}

                <button
                  onClick={handleNextStep}
                  disabled={configuring}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {configuring ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Configurando...
                    </span>
                  ) : currentStep === selectedBusinessType.configSteps.length - 1 ? (
                    'Finalizar Configuración'
                  ) : (
                    'Siguiente →'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 ¿Necesitas ayuda?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Para Despachos Legales:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Configura especialidades legales</li>
                <li>• Habilita consultas online</li>
                <li>• Establece precios de servicios</li>
              </ul>
            </div>
            <div>
              <strong>Para Consultorías:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Define áreas de consultoría</li>
                <li>• Configura tipos de servicios</li>
                <li>• Establece paquetes de servicios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedConfigPage; 