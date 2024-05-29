import React from 'react';
import './ImagePreview.css';

function ImagePreview({ image, onChange }) {
  const imageUrl = image ? URL.createObjectURL(image) : null;

  return (
    <div className="image-preview-container">
      <div className="image-preview">
      {imageUrl && (
          <img src={imageUrl} alt="Uploaded" className="uploaded-image" />
        )}
        {/* <img src={image} alt="Uploaded" className="uploaded-image" /> */}
        <button className="change-image-button" onClick={onChange}>
          Trocar Imagem
        </button>
      </div>
    </div>
  );
}

export default ImagePreview;
