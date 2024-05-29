import React, { useState } from 'react';

function ImageUploader({ onUpload }) {
  const [image, setImage] = useState(null);

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Define a imagem como um URL temporário
      onUpload(file); // Passa o arquivo para a função onUpload
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
      {/* {image && <img src={image} alt="Uploaded" style={{ maxWidth: '100%', marginTop: 20 }} />} */}
    </div>
  );
}

export default ImageUploader;
