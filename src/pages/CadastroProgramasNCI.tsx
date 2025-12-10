import React, { useState, useEffect, useMemo } from 'react';
import { VinculoBeneficiarioPrograma } from '../types/index.ts';
import { PROGRAMAS_NCI } from '../data/programasNCI.ts';

const CadastroProgramasNCI = ({ onBack }: { onBack: () => void }) => {
    const [vinculos, setVinculos] = useState<VinculoBeneficiarioPrograma[]>([]);
    const [searchCpf, setSearchCpf] = useState('');
    const [filterPrograma, setFilterPrograma] = useState<string>('Todos os Programas');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingVinculo, setEditingVinculo] = useState<VinculoBeneficiarioPrograma | null>(null);
    const [viewingVinculo, setViewingVinculo] = useState<VinculoBeneficiarioPrograma | null>(null);
    const [formData, setFormData] = useState({ cpf: '', programas: [] as string[] });
    const [importData, setImportData] = useState('');
    const [errors, setErrors] = useState({ cpf: '', programas: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Carregar dados do localStorage
    useEffect(() => {
        const saved = localStorage.getItem('vinculosNCI');
        if (saved) {
            try {
                setVinculos(JSON.parse(saved));
            } catch (e) {
                console.error('Erro ao carregar vínculos:', e);
            }
        }
    }, []);

    // Salvar no localStorage
    useEffect(() => {
        if (vinculos.length > 0 || localStorage.getItem('vinculosNCI')) {
            localStorage.setItem('vinculosNCI', JSON.stringify(vinculos));
        }
    }, [vinculos]);

    // Calcular indicadores
    const indicadores = useMemo(() => {
        const beneficiariosUnicos = new Set(vinculos.map(v => v.cpf));
        const programasUnicos = new Set(vinculos.flatMap(v => v.programas));
        return {
            totalBeneficiarios: beneficiariosUnicos.size,
            totalVinculos: vinculos.length,
            programasAtivos: programasUnicos.size
        };
    }, [vinculos]);

    // Filtrar e buscar vínculos
    const vinculosFiltrados = useMemo(() => {
        let filtered = [...vinculos];

        // Busca por CPF
        if (searchCpf) {
            const cpfNormalized = searchCpf.replace(/\D/g, '');
            filtered = filtered.filter(v => 
                v.cpf.replace(/\D/g, '').includes(cpfNormalized)
            );
        }

        // Filtro por programa
        if (filterPrograma !== 'Todos os Programas') {
            filtered = filtered.filter(v => 
                v.programas.includes(filterPrograma)
            );
        }

        return filtered;
    }, [vinculos, searchCpf, filterPrograma]);

    // Paginação
    const totalPages = Math.ceil(vinculosFiltrados.length / itemsPerPage);
    const vinculosPaginados = vinculosFiltrados.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Distribuição por programa
    const distribuicaoPorPrograma = useMemo(() => {
        const distribuicao: { [key: string]: number } = {};
        vinculos.forEach(vinculo => {
            vinculo.programas.forEach(programa => {
                distribuicao[programa] = (distribuicao[programa] || 0) + 1;
            });
        });
        return Object.entries(distribuicao)
            .map(([programa, quantidade]) => ({ programa, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade);
    }, [vinculos]);

    const formatCPF = (cpf: string): string => {
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length <= 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cpf;
    };

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

    const validateCPF = (cpf: string): boolean => {
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.length === 11;
    };

    const handleCPFChange = (value: string) => {
        const formatted = formatCPF(value);
        setFormData({ ...formData, cpf: formatted });
        if (errors.cpf) {
            setErrors({ ...errors, cpf: '' });
        }
    };

    const handleProgramaToggle = (programa: string) => {
        setFormData(prev => {
            const programas = prev.programas.includes(programa)
                ? prev.programas.filter(p => p !== programa)
                : [...prev.programas, programa];
            return { ...prev, programas };
        });
        if (errors.programas) {
            setErrors({ ...errors, programas: '' });
        }
    };

    const validateForm = (): boolean => {
        const newErrors = { cpf: '', programas: '' };
        let isValid = true;

        if (!formData.cpf || !validateCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido';
            isValid = false;
        }

        if (formData.programas.length === 0) {
            newErrors.programas = 'Selecione pelo menos um programa';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleOpenNewModal = () => {
        setFormData({ cpf: '', programas: [] });
        setErrors({ cpf: '', programas: '' });
        setIsNewModalOpen(true);
    };

    const handleOpenEditModal = (vinculo: VinculoBeneficiarioPrograma) => {
        setEditingVinculo(vinculo);
        setFormData({ cpf: vinculo.cpf, programas: [...vinculo.programas] });
        setErrors({ cpf: '', programas: '' });
        setIsEditModalOpen(true);
    };

    const handleOpenViewModal = (vinculo: VinculoBeneficiarioPrograma) => {
        setViewingVinculo(vinculo);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsNewModalOpen(false);
        setIsEditModalOpen(false);
        setIsViewModalOpen(false);
        setIsImportModalOpen(false);
        setEditingVinculo(null);
        setViewingVinculo(null);
        setFormData({ cpf: '', programas: [] });
        setErrors({ cpf: '', programas: '' });
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const hoje = new Date().toISOString().split('T')[0];
        const cpfCleaned = formData.cpf.replace(/\D/g, '');

        if (editingVinculo) {
            // Editar: remover vínculos antigos e criar novos
            setVinculos(prev => {
                // Remover vínculos antigos deste CPF
                const semAntigos = prev.filter(v => 
                    !(v.cpf === editingVinculo.cpf && v.id === editingVinculo.id)
                );
                // Adicionar novos vínculos
                const novos = formData.programas.map(programa => ({
                    id: editingVinculo.id,
                    cpf: formatCPF(cpfCleaned),
                    programas: [programa],
                    dataCadastro: editingVinculo.dataCadastro
                }));
                return [...semAntigos, ...novos];
            });
        } else {
            // Criar novos vínculos (um por programa)
            const novosVinculos: VinculoBeneficiarioPrograma[] = formData.programas.map(programa => ({
                id: Date.now() + Math.random(),
                cpf: formatCPF(cpfCleaned),
                programas: [programa],
                dataCadastro: hoje
            }));
            setVinculos(prev => [...novosVinculos, ...prev]);
        }

        handleCloseModals();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este vínculo?')) {
            setVinculos(prev => prev.filter(v => v.id !== id));
        }
    };

    const handleImport = () => {
        if (!importData.trim()) {
            alert('Por favor, cole os dados para importação');
            return;
        }

        const lines = importData.split('\n').filter(line => line.trim());
        const novosVinculos: VinculoBeneficiarioPrograma[] = [];
        const erros: string[] = [];

        lines.forEach((line, index) => {
            const parts = line.split(';').map(p => p.trim());
            if (parts.length !== 2) {
                erros.push(`Linha ${index + 1}: Formato inválido`);
                return;
            }

            const [cpf, programa] = parts;
            const cpfCleaned = cpf.replace(/\D/g, '');

            if (!validateCPF(cpf)) {
                erros.push(`Linha ${index + 1}: CPF inválido (${cpf})`);
                return;
            }

            if (!PROGRAMAS_NCI.includes(programa as any)) {
                erros.push(`Linha ${index + 1}: Programa inválido (${programa})`);
                return;
            }

            novosVinculos.push({
                id: Date.now() + Math.random() + index,
                cpf: formatCPF(cpfCleaned),
                programas: [programa],
                dataCadastro: new Date().toISOString().split('T')[0]
            });
        });

        if (erros.length > 0) {
            alert(`Erros encontrados:\n${erros.join('\n')}\n\n${novosVinculos.length} vínculos serão importados.`);
        }

        if (novosVinculos.length > 0) {
            setVinculos(prev => [...novosVinculos, ...prev]);
            setImportData('');
            setIsImportModalOpen(false);
        }
    };

    // Expandir vínculos para mostrar um por linha na tabela
    const vinculosExpandidos = useMemo(() => {
        return vinculosPaginados.flatMap(vinculo => 
            vinculo.programas.map(programa => ({
                ...vinculo,
                programaUnico: programa
            }))
        );
    }, [vinculosPaginados]);

    return (
        <div className="page-container">
            {/* Cards de Indicadores */}
            <div className="nci-indicators">
                <div className="nci-indicator-card">
                    <h3>Total de Beneficiários</h3>
                    <div className="nci-indicator-value nci-value-blue">
                        {formatNumber(indicadores.totalBeneficiarios)}
                    </div>
                </div>
                <div className="nci-indicator-card">
                    <h3>Total de Vínculos</h3>
                    <div className="nci-indicator-value nci-value-green">
                        {formatNumber(indicadores.totalVinculos)}
                    </div>
                </div>
                <div className="nci-indicator-card">
                    <h3>Programas Ativos</h3>
                    <div className="nci-indicator-value nci-value-purple">
                        {formatNumber(indicadores.programasAtivos)}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="nci-header">
                <div className="nci-header-left">
                    <div className="nci-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <h1>Cadastro de Programas NCI</h1>
                    </div>
                    <p className="nci-subtitle">vincule beneficiários aos programas de atenção integrada</p>
                </div>
            </div>

            {/* Barra de Ações */}
            <div className="nci-actions-bar">
                <div className="nci-search-group">
                    <div className="nci-search-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nci-search-icon">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por CPF..."
                            value={searchCpf}
                            onChange={(e) => setSearchCpf(e.target.value)}
                            className="nci-search-input"
                        />
                    </div>
                    <button className="nci-search-button">Buscar</button>
                </div>
                <div className="nci-actions-right">
                    <button onClick={() => setIsImportModalOpen(true)} className="nci-import-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Importar
                    </button>
                    <button onClick={handleOpenNewModal} className="nci-new-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        + Novo Vínculo
                    </button>
                    <div className="nci-filter-dropdown">
                        <button 
                            className="nci-filter-button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {filterPrograma}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="nci-dropdown-menu">
                                <div 
                                    className={`nci-dropdown-item ${filterPrograma === 'Todos os Programas' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFilterPrograma('Todos os Programas');
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                Todos os Programas
                                {filterPrograma === 'Todos os Programas' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            {PROGRAMAS_NCI.map(programa => (
                                <div
                                    key={programa}
                                    className={`nci-dropdown-item ${filterPrograma === programa ? 'active' : ''}`}
                                    onClick={() => {
                                        setFilterPrograma(programa);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {programa}
                                    {filterPrograma === programa && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Banner de Informação */}
            <div className="nci-info-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="nci-info-label">Informação</span>
                <p>Cada beneficiário pode estar vinculado a múltiplos programas. Os dados cadastrados aqui são utilizados no Painel NCI para identificar pacientes em programas específicos.</p>
            </div>

            {/* Tabela */}
            <div className="table-container">
                <table className="nci-table">
                    <thead>
                        <tr>
                            <th>CPF</th>
                            <th>Programa</th>
                            <th>Data de Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vinculosExpandidos.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--light-text-color)' }}>
                                    Nenhum vínculo encontrado.
                                </td>
                            </tr>
                        ) : (
                            vinculosExpandidos.map((item, index) => (
                                <tr key={`${item.id}-${item.programaUnico}-${index}`}>
                                    <td>{item.cpf}</td>
                                    <td>
                                        <span className="nci-program-tag">{item.programaUnico}</span>
                                    </td>
                                    <td>{formatDate(item.dataCadastro)}</td>
                                    <td>
                                        <div className="nci-actions">
                                            <button
                                                onClick={() => handleOpenViewModal(vinculos.find(v => v.id === item.id)!)}
                                                className="nci-action-button nci-view-button"
                                                title="Visualizar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleOpenEditModal(vinculos.find(v => v.id === item.id)!)}
                                                className="nci-action-button nci-edit-button"
                                                title="Editar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="nci-action-button nci-delete-button"
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

            {/* Paginação */}
            {vinculosFiltrados.length > itemsPerPage && (
                <div className="nci-pagination">
                    <span>Mostrando {vinculosExpandidos.length} de {vinculosFiltrados.length} vínculos</span>
                    <div className="nci-pagination-controls">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}

            {/* Distribuição por Programa */}
            {distribuicaoPorPrograma.length > 0 && (
                <div className="nci-distribuicao">
                    <h2>Distribuição por Programa</h2>
                    <div className="nci-distribuicao-cards">
                        {distribuicaoPorPrograma.slice(0, 10).map(item => (
                            <div key={item.programa} className="nci-distribuicao-card">
                                <div className="nci-distribuicao-programa">{item.programa}</div>
                                <div className="nci-distribuicao-quantidade">{formatNumber(item.quantidade)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Botão Voltar */}
            <div className="nci-back-button-container">
                <button onClick={onBack} className="back-button">← Voltar</button>
            </div>

            {/* Modal Novo/Editar Vínculo */}
            {(isNewModalOpen || isEditModalOpen) && (
                <div className="modal-overlay" onClick={handleCloseModals}>
                    <div className="nci-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="nci-modal-header">
                            <h3>{editingVinculo ? 'Editar Vínculo Beneficiário-Programa' : 'Novo Vínculo Beneficiário-Programa'}</h3>
                            <button onClick={handleCloseModals} className="nci-modal-close-btn">&times;</button>
                        </div>
                        <div className="nci-modal-body">
                            <p className="nci-modal-subtitle">
                                Vincule um beneficiário a um programa NCI informando o CPF e selecionando o programa
                            </p>
                            <div className="nci-form-group">
                                <label>CPF do Beneficiário</label>
                                <input
                                    type="text"
                                    value={formData.cpf}
                                    onChange={(e) => handleCPFChange(e.target.value)}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className={errors.cpf ? 'error' : ''}
                                />
                                {errors.cpf && <span className="error-message">{errors.cpf}</span>}
                            </div>
                            <div className="nci-form-group">
                                <label>Programa</label>
                                <div className="nci-programas-select">
                                    {PROGRAMAS_NCI.map(programa => (
                                        <label key={programa} className="nci-programa-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.programas.includes(programa)}
                                                onChange={() => handleProgramaToggle(programa)}
                                            />
                                            <span>{programa}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.programas && <span className="error-message">{errors.programas}</span>}
                            </div>
                        </div>
                        <div className="nci-modal-actions">
                            <button onClick={handleCloseModals} className="modal-button cancel">Cancelar</button>
                            <button onClick={handleSave} className="modal-button confirm">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Visualizar */}
            {isViewModalOpen && viewingVinculo && (
                <div className="modal-overlay" onClick={handleCloseModals}>
                    <div className="nci-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="nci-modal-header">
                            <h3>Visualizar Vínculo</h3>
                            <button onClick={handleCloseModals} className="nci-modal-close-btn">&times;</button>
                        </div>
                        <div className="nci-modal-body">
                            <div className="nci-view-group">
                                <label>CPF</label>
                                <div className="nci-view-value">{viewingVinculo.cpf}</div>
                            </div>
                            <div className="nci-view-group">
                                <label>Programas</label>
                                <div className="nci-view-programas">
                                    {viewingVinculo.programas.map(programa => (
                                        <span key={programa} className="nci-program-tag">{programa}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="nci-view-group">
                                <label>Data de Cadastro</label>
                                <div className="nci-view-value">{formatDate(viewingVinculo.dataCadastro)}</div>
                            </div>
                        </div>
                        <div className="nci-modal-actions">
                            <button onClick={handleCloseModals} className="modal-button confirm">Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Importar */}
            {isImportModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModals}>
                    <div className="nci-modal-content nci-import-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="nci-modal-header">
                            <h3>Importar Vínculos em Lote</h3>
                            <button onClick={handleCloseModals} className="nci-modal-close-btn">&times;</button>
                        </div>
                        <div className="nci-modal-body">
                            <p className="nci-import-instructions">
                                Cole os dados no formato CPF;PROGRAMA (um por linha). Exemplo:
                            </p>
                            <div className="nci-import-examples">
                                <code>123.456.789-00; APS</code>
                                <code>987.654.321-00; Home Care</code>
                            </div>
                            <div className="nci-form-group">
                                <label>Dados para Importação</label>
                                <textarea
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    placeholder="Cole os dados aqui..."
                                    className="nci-import-textarea"
                                    rows={10}
                                />
                            </div>
                        </div>
                        <div className="nci-modal-actions">
                            <button onClick={handleCloseModals} className="modal-button cancel">Fechar</button>
                            <button onClick={handleImport} className="modal-button confirm">Importar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CadastroProgramasNCI;

