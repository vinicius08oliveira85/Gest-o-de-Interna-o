import React, { useState } from 'react';
import { SolusStatus, SyncStatus } from '../types/index.ts';

const SincronizacaoSolus = ({ onBack }: { onBack: () => void }) => {
    const [activeTab, setActiveTab] = useState<'sincronizacao' | 'logs' | 'conflitos' | 'historico'>('sincronizacao');
    const [status, setStatus] = useState<SolusStatus>('Desconhecido');
    const [syncData, setSyncData] = useState({
        status: 'Inativo' as SolusStatus,
        ultimaSync: {
            status: 'Falha' as SyncStatus,
            processados: 10000,
            duracao: null as string | null,
            dataHora: '2025-11-20T03:42:58'
        },
        conflitos: 0
    });
    const [syncForm, setSyncForm] = useState({
        dataInicial: '2025-11-10',
        dataFinal: '2025-12-10',
        dryRun: true
    });
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [isRunningSync, setIsRunningSync] = useState(false);

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    };

    const getRelativeTime = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return '1d atrás';
        return `${diffDays}d atrás`;
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString('pt-BR');
    };

    const handleTestConnection = async () => {
        setIsTestingConnection(true);
        // Simular teste de conexão
        setTimeout(() => {
            setIsTestingConnection(false);
            // Aqui seria a integração real com a API
        }, 2000);
    };

    const handleRunSync = () => {
        if (!syncForm.dataInicial || !syncForm.dataFinal) {
            alert('Por favor, preencha as datas inicial e final');
            return;
        }

        if (new Date(syncForm.dataFinal) < new Date(syncForm.dataInicial)) {
            alert('A data final deve ser maior ou igual à data inicial');
            return;
        }

        setIsRunningSync(true);
        // Simular execução de sincronização
        setTimeout(() => {
            setIsRunningSync(false);
            // Aqui seria a integração real com a API
        }, 3000);
    };

    const handleRefresh = () => {
        // Simular refresh dos dados
        // Aqui seria a integração real com a API
    };

    const tabs = [
        { id: 'sincronizacao', label: 'Sincronização' },
        { id: 'logs', label: 'Logs' },
        { id: 'conflitos', label: 'Conflitos' },
        { id: 'historico', label: 'Histórico' }
    ];

    return (
        <div className="page-container">
            <div className="solus-header">
                <div className="solus-header-left">
                    <h1>Status da Conexão com Solus API</h1>
                    <p className="solus-subtitle">Monitoramento automático a cada 5 minutos</p>
                </div>
                <div className="solus-header-right">
                    <div className="solus-status-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {status}
                    </div>
                    <button onClick={handleRefresh} className="solus-refresh-button" title="Atualizar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.7L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="solus-status-cards">
                <div className="solus-status-card">
                    <div className="solus-card-icon solus-icon-clock">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div className="solus-card-content">
                        <h3>STATUS</h3>
                        <div className="solus-status-pill solus-status-inativo">
                            {syncData.status}
                        </div>
                        <div className="solus-card-details">
                            <span className="solus-time-ago">{getRelativeTime(syncData.ultimaSync.dataHora)}</span>
                            <span className="solus-datetime">{formatDateTime(syncData.ultimaSync.dataHora)}</span>
                        </div>
                    </div>
                </div>

                <div className="solus-status-card">
                    <div className="solus-card-icon solus-icon-error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div className="solus-card-content">
                        <h3>ÚLTIMA SYNC</h3>
                        <div className="solus-status-pill solus-status-falha">
                            {syncData.ultimaSync.status}
                        </div>
                        <div className="solus-card-details">
                            <span>Processados: {formatNumber(syncData.ultimaSync.processados)}</span>
                            <span>Duração: {syncData.ultimaSync.duracao || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="solus-status-card">
                    <div className="solus-card-icon solus-icon-performance">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    </div>
                    <div className="solus-card-content">
                        <h3>PERFORMANCE</h3>
                        <div className="solus-card-details">
                            <span className="solus-no-data">Sem dados ainda</span>
                        </div>
                    </div>
                </div>

                <div className="solus-status-card">
                    <div className="solus-card-icon solus-icon-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div className="solus-card-content">
                        <h3>CONFLITOS</h3>
                        <div className="solus-conflicts-count">{syncData.conflitos} conflitos</div>
                        <div className="solus-card-details">
                            <span className="solus-no-conflicts">Nenhum conflito detectado</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="solus-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`solus-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'sincronizacao' && (
                <div className="solus-tab-content">
                    <div className="solus-action-section">
                        <div className="solus-section-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                            </svg>
                            <h2>Testar Conexão com Solus API</h2>
                        </div>
                        <p className="solus-section-description">
                            Verificar se a conexão com o Sistema Solus está funcionando
                        </p>
                        <button 
                            onClick={handleTestConnection} 
                            className="solus-action-button"
                            disabled={isTestingConnection}
                        >
                            {isTestingConnection ? (
                                <>
                                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <polyline points="1 20 1 14 7 14"></polyline>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.7L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                    </svg>
                                    Testando...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                    Testar Conexão
                                </>
                            )}
                        </button>
                    </div>

                    <div className="solus-action-section">
                        <div className="solus-section-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.7L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            <h2>Executar Sincronização</h2>
                        </div>
                        <p className="solus-section-description">
                            Sincronizar dados do Solus para o Supabase
                        </p>
                        <div className="solus-sync-form">
                            <div className="solus-form-row">
                                <div className="solus-form-group">
                                    <label>Data Inicial</label>
                                    <div className="solus-input-wrapper">
                                        <input
                                            type="date"
                                            value={syncForm.dataInicial}
                                            onChange={(e) => setSyncForm({ ...syncForm, dataInicial: e.target.value })}
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="solus-calendar-icon">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </div>
                                </div>
                                <div className="solus-form-group">
                                    <label>Data Final</label>
                                    <div className="solus-input-wrapper">
                                        <input
                                            type="date"
                                            value={syncForm.dataFinal}
                                            onChange={(e) => setSyncForm({ ...syncForm, dataFinal: e.target.value })}
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="solus-calendar-icon">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="solus-checkbox-group">
                                <input
                                    type="checkbox"
                                    id="dryRun"
                                    checked={syncForm.dryRun}
                                    onChange={(e) => setSyncForm({ ...syncForm, dryRun: e.target.checked })}
                                />
                                <label htmlFor="dryRun">
                                    Modo de teste (Dry Run) - Não modifica o banco de dados
                                </label>
                            </div>
                            <button 
                                onClick={handleRunSync} 
                                className="solus-sync-button"
                                disabled={isRunningSync}
                            >
                                {isRunningSync ? (
                                    <>
                                        <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 4 23 10 17 10"></polyline>
                                            <polyline points="1 20 1 14 7 14"></polyline>
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.7L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                        </svg>
                                        Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                        Testar Sincronização
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab !== 'sincronizacao' && (
                <div className="solus-tab-content">
                    <div className="solus-placeholder">
                        <p>Conteúdo da aba "{tabs.find(t => t.id === activeTab)?.label}" será implementado em breve.</p>
                    </div>
                </div>
            )}

            <div className="solus-back-button-container">
                <button onClick={onBack} className="back-button">← Voltar</button>
            </div>
        </div>
    );
};

export default SincronizacaoSolus;

