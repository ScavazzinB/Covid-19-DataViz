import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found-container">
        <div className="not-found-animation">
          <div className="error-code">404</div>
          <div className="error-emoji">🔍</div>
        </div>

        <h1 className="not-found-title">Page Introuvable</h1>
        <p className="not-found-message">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="not-found-suggestions">
          <h3>Suggestions :</h3>
          <ul>
            <li>Vérifiez l'URL dans la barre d'adresse</li>
            <li>Retournez à la page d'accueil</li>
            <li>Utilisez le menu de navigation</li>
          </ul>
        </div>

        <div className="not-found-actions">
          <button
            onClick={() => navigate('/')}
            className="not-found-button primary"
          >
            🏠 Retour à l'accueil
          </button>
          <button
            onClick={() => navigate(-1)}
            className="not-found-button secondary"
          >
            ← Page précédente
          </button>
        </div>

        <div className="not-found-help">
          <p>
            Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous le signaler.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
