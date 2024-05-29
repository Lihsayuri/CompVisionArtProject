import React, { useState } from 'react';
import './App.css';
import ImageUploader from './ImageUploader';
import ImagePreview from './ImagePreview';
import ResultsChart from './ResultsChart';
import { marked } from 'marked';

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
const genAI = new GoogleGenerativeAI(apiKey);

const styleMapping = {
  "Abstractionism": "Abstracionismo",
  "Baroque": "Barroco",
  "Cubism": "Cubismo",
  "Renaissance": "Renascimento",
  "Post_Impressionism": "Pós-Impressionismo",
  "Surrealism": "Surrealismo",
  "Symbolism": "Simbolismo"
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const translateStyle = (style) => {
  return styleMapping[style] || style;
};

function App() {
  const [uploadedImage, setUploadedImage] = useState();
  const [results, setResults] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [chatHistories, setChatHistories] = useState({});

  const handleUpload = async (imageData) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
      const event = { file: base64String };

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(event)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok' + response.statusText);
        }

        const data = await response.json();
        const resizedImage = await resizeImage(imageData, 300);
        setUploadedImage(resizedImage);
        setResults(data.results);

        const styles = data.results.map((result) => result.style);

        if (data.results.length > 0) {
          const descriptions = await fetchDescriptions(styles);
          setDescriptions(descriptions.map(desc => marked(desc)));
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    reader.readAsDataURL(imageData);
  };

  async function fetchDescriptions(styles) {
    const descriptions = await Promise.all(styles.map(async (style) => {
      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [{ text: "Descreva sucintamente o estilo artístico previsto com no máximo 7 linhas, falando sobre as características das pinturas desse estilo: " + translateStyle(style) + ".\n" }],
          },
        ],
      });
  
      const response = await chatSession.sendMessage("");
      return response.response.text();
    }));
  
    return descriptions;
  }

  const handleImageChange = () => {
    setUploadedImage(null);
    setResults([]);
    setDescriptions([]);
    setSelectedStyle(null);
    setChatHistories({});
  };

  const resizeImage = (imageData, size) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageData);
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        const aspectRatio = img.width / img.height;
  
        if (aspectRatio > 1) {
          // Landscape orientation
          canvas.width = size;
          canvas.height = size / aspectRatio;
        } else {
          // Portrait or square orientation
          canvas.width = size * aspectRatio;
          canvas.height = size;
        }
  
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        canvas.toBlob((blob) => {
          resolve(new File([blob], imageData.name, { type: imageData.type }));
        }, imageData.type);
      };
    });
  };

  const handleStyleClick = async (style) => {
    setSelectedStyle(style === selectedStyle ? null : style);
    setUserInput("");
  };

  const handleUserInput = async () => {
    const currentHistory = chatHistories[selectedStyle] || [];
    const chatHistoryWithParts = currentHistory.map(item => ({
      role: item.role,
      parts: [{ text: item.text }]
    }));
  
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        ...chatHistoryWithParts,
        {
          role: "user",
          parts: [{ text: userInput + " (em relação ao " + translateStyle(selectedStyle) + ")" }], // Adicionando o texto ao final do user input
        },
      ],
    });
  
    const response = await chatSession.sendMessage("");
    const newHistory = [
      ...currentHistory,
      { role: "user", text: userInput },
      { role: "model", text: marked(response.response.text()) }
    ];
  
    setChatHistories({
      ...chatHistories,
      [selectedStyle]: newHistory
    });
  
    setUserInput("");
  };
  

  return (
    <div className="App">
      <header>
        <h1>Artistic Vision</h1>
        <p>
          Bem-vindo ao Artistic Vision! Este projeto permite que você faça upload de uma imagem e receba uma
          previsão do estilo artístico da obra. É uma maneira interativa de estudar e estar em contato cultural constante.
        </p>
      </header>
      <main>
        {!uploadedImage ? (
          <div className="uploader-container">
            <ImageUploader onUpload={handleUpload} />
          </div>
        ) : (
          <>
            <div className="content-container">
              <div className="row">
                <div className="chart-container">
                  <ResultsChart results={results} />
                </div>
                <div className="image-preview-container">
                  <ImagePreview image={uploadedImage} onChange={handleImageChange} />
                </div>
              </div>
              <div className="descriptions-container">
                {results.map((result, index) => (
                  <div key={index} className="description-item">
                    <h3 onClick={() => handleStyleClick(result.style)}>Estilo: {translateStyle(result.style)}</h3>
                    {selectedStyle === result.style && (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: descriptions[index] }}></div>
                        <div className="chat-container">
                          <h4>Faça mais perguntas sobre {translateStyle(result.style)}:</h4>
                          <div className="chat-history">
                            {chatHistories[selectedStyle]?.map((message, idx) => (
                              <div key={idx} className={message.role === 'user' ? 'user' : message.role} dangerouslySetInnerHTML={{ __html: message.text }}></div>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Digite sua pergunta"
                            className="chat-input" // adicione esta classe ao input
                          />
                          <button onClick={handleUserInput} className="chat-input-btn">Enviar</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <footer>
        <p>Desenvolvido por [Fabricio Neri, Jean Silas, Livia Sayuri] - 2024</p>
      </footer>
    </div>
  );
}

export default App;
