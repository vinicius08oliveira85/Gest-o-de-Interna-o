import React, { useState, useEffect, useMemo } from 'react';
import { PopulacaoRegistro } from '../types/index.ts';
import { REGIOES } from '../data/regioes.ts';

const CadastroPopulacaoRede = ({ onBack }: { onBack: () => void }) => {
    const [registros, setRegistros] = useState<PopulacaoRegistro[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingRegistro, setEditingRegistro] = useState<PopulacaoRegistro | null>(null);
    const [viewingRegistro, setViewingRegistro] = useState<PopulacaoRegistro | null>(null);
    const [formData, setFormData] = useState({ 
        data: '', 
        regioes: REGIOES.map(regiao => ({ regiao, beneficiariosAtivos: '' }))
    });
    const [errors, setErrors] = useState({ data: '', regioes: '' });

    // Carregar dados do localStorage ao montar
    useEffect(() => {
        const saved = localStorage.getItem('populacaoRegistros');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migrar dados antigos se necessário
                const migrated = parsed.map((r: any) => {
                    if (r.beneficiariosAtivos !== undefined && !r.regioes) {
                        // Formato antigo - converter para novo
                        return {
                            ...r,
                            regioes: REGIOES.map(regiao => ({
                                regiao,
                                beneficiariosAtivos: regiao === 'RIO DE JANEIRO' ? r.beneficiariosAtivos : 0
                            })),
                            totalBeneficiariosAtivos: r.beneficiariosAtivos
                        };
                    }
                    return r;
                });
                setRegistros(migrated);
            } catch (e) {
                console.error('Erro ao carregar registros:', e);
            }
        }
    }, []);

    // Salvar no localStorage sempre que houver mudança
    useEffect(() => {
        if (registros.length > 0 || localStorage.getItem('populacaoRegistros')) {
            localStorage.setItem('populacaoRegistros', JSON.stringify(registros));
        }
    }, [registros]);

    // Calcular total automaticamente
    const totalCalculado = useMemo(() => {
        return formData.regioes.reduce((sum, reg) => {
            const valor = Number(reg.beneficiariosAtivos) || 0;
            return sum + valor;
        }, 0);
    }, [formData.regioes]);

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString('pt-BR');
    };

    const formatRegioes = (regioes: { regiao: string; beneficiariosAtivos: number }[]): string => {
        return regioes
            .filter(r => r.beneficiariosAtivos > 0)
            .map(r => `${r.regiao}: ${formatNumber(r.beneficiariosAtivos)}`)
            .join(', ') || 'Nenhuma região cadastrada';
    };

    const validateForm = (): boolean => {
        const newErrors = { data: '', regioes: '' };
        let isValid = true;

        if (!formData.data) {
            newErrors.data = 'Data é obrigatória';
            isValid = false;
        }

        const hasAtLeastOneRegiao = formData.regioes.some(r => {
            const valor = Number(r.beneficiariosAtivos);
            return !isNaN(valor) && valor > 0;
        });

        if (!hasAtLeastOneRegiao) {
            newErrors.regioes = 'Pelo menos uma região deve ter quantidade maior que zero';
            isValid = false;
        }

        // Validar cada região
        for (const reg of formData.regioes) {
            if (reg.beneficiariosAtivos && (isNaN(Number(reg.beneficiariosAtivos)) || Number(reg.beneficiariosAtivos) < 0)) {
                newErrors.regioes = 'Quantidades devem ser números positivos';
                isValid = false;
                break;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleOpenNewModal = () => {
        setEditingRegistro(null);
        setFormData({ 
            data: '', 
            regioes: REGIOES.map(regiao => ({ regiao, beneficiariosAtivos: '' }))
        });
        setErrors({ data: '', regioes: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (registro: PopulacaoRegistro) => {
        setEditingRegistro(registro);
        setFormData({
            data: registro.data,
            regioes: REGIOES.map(regiao => {
                const reg = registro.regioes.find(r => r.regiao === regiao);
                return { regiao, beneficiariosAtivos: reg ? reg.beneficiariosAtivos.toString() : '' };
            })
        });
        setErrors({ data: '', regioes: '' });
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (registro: PopulacaoRegistro) => {
        setViewingRegistro(registro);
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRegistro(null);
        setFormData({ 
            data: '', 
            regioes: REGIOES.map(regiao => ({ regiao, beneficiariosAtivos: '' }))
        });
        setErrors({ data: '', regioes: '' });
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingRegistro(null);
    };

    const handleRegiaoChange = (regiao: string, value: string) => {
        setFormData({
            ...formData,
            regioes: formData.regioes.map(r =>
                r.regiao === regiao ? { ...r, beneficiariosAtivos: value } : r
            )
        });
        if (errors.regioes) {
            setErrors({ ...errors, regioes: '' });
        }
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const hoje = new Date().toISOString().split('T')[0];
        const regioesComValores = formData.regioes.map(r => ({
            regiao: r.regiao,
            beneficiariosAtivos: Number(r.beneficiariosAtivos) || 0
        }));

        if (editingRegistro) {
            // Editar registro existente
            setRegistros(prev => prev.map(r =>
                r.id === editingRegistro.id
                    ? { 
                        ...r, 
                        data: formData.data, 
                        regioes: regioesComValores,
                        totalBeneficiariosAtivos: totalCalculado,
                        atualizadoEm: hoje 
                    }
                    : r
            ));
        } else {
            // Criar novo registro
            const novoRegistro: PopulacaoRegistro = {
                id: Date.now(),
                data: formData.data,
                regioes: regioesComValores,
                totalBeneficiariosAtivos: totalCalculado,
                atualizadoEm: hoje
            };
            setRegistros(prev => [novoRegistro, ...prev]);
        }

        handleCloseModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            setRegistros(prev => prev.filter(r => r.id !== id));
        }
    };

    // Ordenar por data (mais recente primeiro)
    const registrosOrdenados = [...registros].sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
    });

    return (
        <div className="page-container">
            <div className="populacao-header">
                <div className="populacao-header-left">
                    <div className="populacao-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h1>Cadastro de População/Região</h1>
                    </div>
                    <p className="populacao-subtitle">registre a quantidade de beneficiários ativos por data e região</p>
                </div>
                <div className="populacao-header-right">
                    <button onClick={onBack} className="back-button">← Voltar</button>
                    <button onClick={handleOpenNewModal} className="novo-registro-button">
                        + Novo Registro
                    </button>
                </div>
            </div>

            <div className="populacao-info-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span className="populacao-info-label">Informação</span>
                <p>Os dados cadastrados aqui são utilizados no Painel de Internação para calcular os indicadores Resultado e CTI.</p>
            </div>

            <div className="table-container">
                <table className="populacao-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Total de Beneficiários Ativos</th>
                            <th>Região</th>
                            <th>Atualizado em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrosOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--light-text-color)' }}>
                                    Nenhum registro cadastrado. Clique em "+ Novo Registro" para começar.
                                </td>
                            </tr>
                        ) : (
                            registrosOrdenados.map(registro => (
                                <tr key={registro.id}>
                                    <td>{formatDate(registro.data)}</td>
                                    <td>{formatNumber(registro.totalBeneficiariosAtivos)}</td>
                                    <td>{formatRegioes(registro.regioes)}</td>
                                    <td>{formatDate(registro.atualizadoEm)}</td>
                                    <td>
                                        <div className="populacao-actions">
                                            <button
                                                onClick={() => handleOpenViewModal(registro)}
                                                className="action-button view-button"
                                                title="Visualizar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleOpenEditModal(registro)}
                                                className="action-button edit-button"
                                                title="Editar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(registro.id)}
                                                className="action-button delete-button"
                                                title="Excluir"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="populacao-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="populacao-modal-header">
                            <h3>{editingRegistro ? 'Editar Registro' : 'Novo Registro'}</h3>
                            <button onClick={handleCloseModal} className="populacao-modal-close-btn">&times;</button>
                        </div>
                        <div className="populacao-modal-body">
                            <p className="populacao-modal-subtitle">
                                {editingRegistro 
                                    ? 'edite a quantidade de beneficiários ativos para uma data específica'
                                    : 'cadastre a quantidade de beneficiários ativos para uma data específica'
                                }
                            </p>
                            <div className="populacao-form-group">
                                <label>Data</label>
                                <div className="populacao-input-wrapper">
                                    <input
                                        type="date"
                                        value={formData.data}
                                        onChange={(e) => {
                                            setFormData({ ...formData, data: e.target.value });
                                            setErrors({ ...errors, data: '' });
                                        }}
                                        className={errors.data ? 'error' : ''}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="populacao-calendar-icon">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </div>
                                {errors.data && <span className="error-message">{errors.data}</span>}
                            </div>
                            <div className="populacao-regioes-group">
                                <label>Quantidade de Beneficiários Ativos por Região</label>
                                {REGIOES.map(regiao => (
                                    <div key={regiao} className="populacao-regiao-input">
                                        <label className="populacao-regiao-label">{regiao}</label>
                                        <input
                                            type="number"
                                            value={formData.regioes.find(r => r.regiao === regiao)?.beneficiariosAtivos || ''}
                                            onChange={(e) => handleRegiaoChange(regiao, e.target.value)}
                                            placeholder="Ex: 90000"
                                            min="0"
                                        />
                                    </div>
                                ))}
                                {errors.regioes && <span className="error-message">{errors.regioes}</span>}
                            </div>
                            <div className="populacao-total-group">
                                <label>Total de Beneficiários Ativos</label>
                                <div className="populacao-total-display">
                                    {formatNumber(totalCalculado)}
                                </div>
                            </div>
                        </div>
                        <div className="populacao-modal-actions">
                            <button onClick={handleCloseModal} className="modal-button cancel">Cancelar</button>
                            <button onClick={handleSave} className="modal-button confirm">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {isViewModalOpen && viewingRegistro && (
                <div className="modal-overlay" onClick={handleCloseViewModal}>
                    <div className="populacao-modal-content populacao-view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="populacao-modal-header">
                            <h3>Visualizar Registro</h3>
                            <button onClick={handleCloseViewModal} className="populacao-modal-close-btn">&times;</button>
                        </div>
                        <div className="populacao-modal-body">
                            <div className="populacao-view-group">
                                <label>Data</label>
                                <div className="populacao-view-value">{formatDate(viewingRegistro.data)}</div>
                            </div>
                            <div className="populacao-view-group">
                                <label>Regiões</label>
                                <div className="populacao-view-regioes">
                                    {viewingRegistro.regioes
                                        .filter(r => r.beneficiariosAtivos > 0)
                                        .map(r => (
                                            <div key={r.regiao} className="populacao-view-regiao-item">
                                                <span className="populacao-view-regiao-name">{r.regiao}:</span>
                                                <span className="populacao-view-regiao-value">{formatNumber(r.beneficiariosAtivos)}</span>
                                            </div>
                                        ))}
                                    {viewingRegistro.regioes.filter(r => r.beneficiariosAtivos > 0).length === 0 && (
                                        <div className="populacao-view-value">Nenhuma região cadastrada</div>
                                    )}
                                </div>
                            </div>
                            <div className="populacao-view-group">
                                <label>Total de Beneficiários Ativos</label>
                                <div className="populacao-view-value populacao-view-total">{formatNumber(viewingRegistro.totalBeneficiariosAtivos)}</div>
                            </div>
                            <div className="populacao-view-group">
                                <label>Atualizado em</label>
                                <div className="populacao-view-value">{formatDate(viewingRegistro.atualizadoEm)}</div>
                            </div>
                        </div>
                        <div className="populacao-modal-actions">
                            <button onClick={handleCloseViewModal} className="modal-button confirm">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CadastroPopulacaoRede;
