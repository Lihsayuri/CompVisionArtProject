import requests
import base64
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Change the endpoint to your API Gateway URL
api_gateway_endpoint = os.getenv("API_GATEWAY_ENDPOINT")

# Endpoint for prediction
predict_endpoint = f"{api_gateway_endpoint}/predict"

# Carregar o conteúdo do arquivo de imagem
image_path = os.path.abspath('symbolism.jpg')

with open(image_path, 'rb') as f:
    image_bytes = f.read()

# Codificar os bytes em base64
image_base64 = base64.b64encode(image_bytes).decode('utf-8')

# Montar o evento como um dicionário
event = {
    "file": image_base64
}

# Make the POST request to the prediction endpoint
headers = {'Content-Type': 'application/json'}
response = requests.post(predict_endpoint, json=event, headers=headers)

# Print the status code and response text
print(response.json())
print(f"Status code: {response.status_code}")
print(f"Response text: {response.text}")