import boto3
import os
import io
from dotenv import load_dotenv
import json
import base64

load_dotenv()

# Create a Boto3 client for AWS Lambda service
lambda_client = boto3.client(
    "lambda",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

# Lambda function name
function_name = "predictArtStyle"

try:
    # Ler o conteúdo do arquivo de imagem
    image_path = os.path.abspath('symbolism.jpg')

    with open(image_path, 'rb') as f:
        image_bytes = f.read()

    # Codificar os bytes em base64
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')

    # Montar o evento como um dicionário
    event = {
        "file": image_base64
    }

    # Converter o evento em JSON
    event_json = json.dumps(event)

    # Invoke the function
    response = lambda_client.invoke(
        FunctionName=function_name,
        InvocationType="RequestResponse",
        Payload=event_json  # Envie o evento como uma string JSON
    )

    # Decodificar a resposta
    response_payload = response["Payload"].read().decode("utf-8")

    print(f"Response:\n{response_payload}")

except Exception as e:
    print(e)
