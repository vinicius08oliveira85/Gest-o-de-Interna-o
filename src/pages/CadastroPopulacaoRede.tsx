import React, { useState, useEffect } from 'react';
import { PopulacaoRegistro } from '../types/index.ts';

const CadastroPopulacaoRede = ({ onBack }: { onBack: () => void }) => {
    const [registros, setRegistros] = useState<PopulacaoRegistro[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegistro, setEditingRegistro] = useState<PopulacaoRegistro | null>(null);
    const [formData, setFormData] = useState({ data: '', beneficiariosAtivos: '' });
    const [errors, setErrors] = useState({ data: '', beneficiariosAtivos: '' });

    // Carregar dados do localStorage ao montar
    useEffect(() => {
        const saved = localStorage.getItem('populacaoRegistros');
        if (saved) {
            try {
                setRegistros(JSON.parse(saved));
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

    const validateForm = (): boolean => {
        const newErrors = { data: '', beneficiariosAtivos: '' };
        let isValid = true;

        if (!formData.data) {
            newErrors.data = 'Data é obrigatória';
            isValid = false;
        }

        if (!formData.beneficiariosAtivos) {
            newErrors.beneficiariosAtivos = 'Quantidade é obrigatória';
            isValid = false;
        } else {
            const quantidade = Number(formData.beneficiariosAtivos);
            if (isNaN(quantidade) || quantidade <= 0) {
                newErrors.beneficiariosAtivos = 'Quantidade deve ser um número positivo';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleOpenNewModal = () => {
        setEditingRegistro(null);
        setFormData({ data: '', beneficiariosAtivos: '' });
        setErrors({ data: '', beneficiariosAtivos: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (registro: PopulacaoRegistro) => {
        setEditingRegistro(registro);
        setFormData({
            data: registro.data,
            beneficiariosAtivos: registro.beneficiariosAtivos.toString()
        });
        setErrors({ data: '', beneficiariosAtivos: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRegistro(null);
        setFormData({ data: '', beneficiariosAtivos: '' });
        setErrors({ data: '', beneficiariosAtivos: '' });
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const quantidade = Number(formData.beneficiariosAtivos);
        const hoje = new Date().toISOString().split('T')[0];

        if (editingRegistro) {
            // Editar registro existente
            setRegistros(prev => prev.map(r =>
                r.id === editingRegistro.id
                    ? { ...r, data: formData.data, beneficiariosAtivos: quantidade, atualizadoEm: hoje }
                    : r
            ));
        } else {
            // Criar novo registro
            const novoRegistro: PopulacaoRegistro = {
                id: Date.now(),
                data: formData.data,
                beneficiariosAtivos: quantidade,
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
                        <h1>Cadastro de População</h1>
                    </div>
                    <p className="populacao-subtitle">registre a quantidade de beneficiários ativos por data</p>
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
                            <th>Beneficiários Ativos</th>
                            <th>Atualizado em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrosOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--light-text-color)' }}>
                                    Nenhum registro cadastrado. Clique em "+ Novo Registro" para começar.
                                </td>
                            </tr>
                        ) : (
                            registrosOrdenados.map(registro => (
                                <tr key={registro.id}>
                                    <td>{formatDate(registro.data)}</td>
                                    <td>{formatNumber(registro.beneficiariosAtivos)}</td>
                                    <td>{formatDate(registro.atualizadoEm)}</td>
                                    <td>
                                        <div className="populacao-actions">
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
                            <div className="populacao-form-group">
                                <label>Quantidade de Beneficiários Ativos</label>
                                <input
                                    type="number"
                                    value={formData.beneficiariosAtivos}
                                    onChange={(e) => {
                                        setFormData({ ...formData, beneficiariosAtivos: e.target.value });
                                        setErrors({ ...errors, beneficiariosAtivos: '' });
                                    }}
                                    placeholder="Ex: 90000"
                                    className={errors.beneficiariosAtivos ? 'error' : ''}
                                    min="1"
                                />
                                {errors.beneficiariosAtivos && <span className="error-message">{errors.beneficiariosAtivos}</span>}
                            </div>
                        </div>
                        <div className="populacao-modal-actions">
                            <button onClick={handleCloseModal} className="modal-button cancel">Cancelar</button>
                            <button onClick={handleSave} className="modal-button confirm">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CadastroPopulacaoRede;

