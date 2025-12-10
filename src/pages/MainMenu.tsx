import React from 'react';
import { User, MenuItem } from '../types/index.ts';
import AppHeader from '../components/AppHeader.tsx';

const MainMenu = ({ onSelectPage, user, onLogout, menuItems }: { onSelectPage: (page: string) => void, user: User, onLogout: () => void, menuItems: MenuItem[] }) => {
    
    return (
        <div className="main-menu-page">
            <div className="main-menu-top-bar">
                <span>Bem-vindo, {user.name}</span>
                <button onClick={() => onSelectPage('Cadastro de Parâmetros')} className="settings-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                    </svg>
                    Cadastro de Parâmetros
                </button>
                <button onClick={onLogout} className="logout-button">Sair</button>
            </div>
             <AppHeader
                title="Selecione um Painel"
                subtitle="Escolha o painel que deseja acessar."
             />

            <div className="menu-grid">
                {menuItems.map(item => (
                     <div key={item.id} className="menu-card">
                        <div className="card-icon">{item.icon}</div>
                        <div className="card-content">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                        <button className="card-button" onClick={() => onSelectPage(item.page)}>
                           Acessar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MainMenu;