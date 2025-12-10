import React from 'react';
import AppHeader from '../components/AppHeader.tsx';

const CadastroParametros = ({ onBack, onSelectPage }: { onBack: () => void; onSelectPage?: (page: string) => void }) => {
    const sections = [
        {
            id: 'sincronizacao-solus',
            title: 'Sincronização Solus',
            description: 'Configurações de sincronização com o sistema Solus',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
            )
        },
        {
            id: 'cadastro-programas-nci',
            title: 'Cadastro de Programas NCI',
            description: 'Gerenciamento de programas do NCI',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            )
        },
        {
            id: 'cadastro-populacao-rede',
            title: 'Cadastro de População/Região',
            description: 'Configurações de população e região de atendimento',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
        {
            id: 'meta-hias',
            title: 'Meta HIAS',
            description: 'Configurações de metas do HIAS',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            )
        },
        {
            id: 'cadastro-custo-hospitalar',
            title: 'Cadastro de Custo Hospitalar por Leito',
            description: 'Configurações de custos hospitalares por tipo de leito',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            )
        }
    ];

    const handleSectionClick = (sectionId: string) => {
        if (!onSelectPage) return;
        
        if (sectionId === 'cadastro-populacao-rede') {
            onSelectPage('Cadastro de População/Região');
        } else if (sectionId === 'sincronizacao-solus') {
            onSelectPage('Sincronização Solus');
        } else if (sectionId === 'cadastro-programas-nci') {
            onSelectPage('Cadastro de Programas NCI');
        } else {
            // Placeholder para outras seções
            console.log(`Seção clicada: ${sectionId}`);
        }
    };

    return (
        <div className="page-container">
            <AppHeader 
                title="Configurações/Cadastro"
                subtitle="Gerencie as configurações e parâmetros do sistema"
                onBack={onBack}
            />
            <div className="parametros-sections">
                {sections.map(section => (
                    <div 
                        key={section.id} 
                        className="parametro-section-card"
                        onClick={() => handleSectionClick(section.id)}
                    >
                        <div className="parametro-section-icon">
                            {section.icon}
                        </div>
                        <div className="parametro-section-content">
                            <h3>{section.title}</h3>
                            <p>{section.description}</p>
                        </div>
                        <div className="parametro-section-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CadastroParametros;

