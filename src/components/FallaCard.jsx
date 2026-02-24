import React, { useState } from 'react';
import './FallaCard.css';

const FallaCard = ({ falla, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Determinar si es URL de video de YouTube o Vimeo
  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  return (
    <div 
      className={`falla-card ${isExpanded ? 'expanded' : ''}`} 
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="card-glow"></div>
      <div className="card-corner"></div>
      
      <div className="card-header">
        <span className="device-tag">{falla.DISPOSITIVO || 'Sin dispositivo'}</span>
        <span className="card-badge">{isExpanded ? '🔽' : '▶'}</span>
      </div>
      
      <h3 className="falla-title">{falla.FALLA || 'Falla sin descripción'}</h3>
      
      {isExpanded && (
        <div className="card-details">
          <div className="detail-section diagnosis">
            <span className="detail-label">
              <span className="detail-icon">🔍</span> Diagnóstico
            </span>
            <p>{falla.DIAGNOSTICO || 'No especificado'}</p>
          </div>
          
          <div className="detail-section solution">
            <span className="detail-label">
              <span className="detail-icon">✅</span> Solución
            </span>
            <p>{falla.SOLUCION || 'No especificada'}</p>
          </div>
          
          {falla.IMAGEN && !imageError && (
            <div className="media-section image-section">
              <span className="detail-label">
                <span className="detail-icon">📷</span> Referencia visual
              </span>
              <img 
                src={falla.IMAGEN} 
                alt="Referencia de la falla" 
                onError={handleImageError}
                loading="lazy"
              />
            </div>
          )}
          
          {falla.VIDEO && (
            <div className="media-section video-section">
              <span className="detail-label">
                <span className="detail-icon">🎥</span> Video tutorial
              </span>
              <div className="video-container">
                <iframe
                  src={getVideoEmbedUrl(falla.VIDEO)}
                  title="Video tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="card-footer">
        <span className="expand-hint">
          {isExpanded ? '▼ Mostrar menos' : '▶ Ver diagnóstico completo'}
        </span>
        <span className="card-date">
          {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default FallaCard;