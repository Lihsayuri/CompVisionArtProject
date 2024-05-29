import numpy as np
import json
import tensorflow as tf
from keras.models import load_model
import base64
import logging
from PIL import Image
import io

# Configurar logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Carregar o modelo e configurar a probabilidade
model = tf.keras.models.load_model('model/model_v0.h5')
probability_model = tf.keras.Sequential([model,
                                         tf.keras.layers.Softmax()])

genre = [
    "Abstractionism",
    "Baroque",
    "Cubism",
    "Renaissance",
    "Post_Impressionism",
    "Surrealism",
    "Symbolism"
]

# Função para transformar a imagem
def transform_image(img):
    img = img.resize((125, 125))
    img_array = np.array(img)
    web_image = img_array / 255.0
    web_image = np.expand_dims(web_image, axis=0)
    return web_image

# Função para dividir a imagem em patches
def patches(image):
    patches_list = []
    img_resized = image.resize((250, 250))

    patch_size = 125
    step = 125

    for i in range(0, img_resized.height - patch_size + 1, step):
        for j in range(0, img_resized.width - patch_size + 1, step):
            patch = img_resized.crop((j, i, j + patch_size, i + patch_size))
            patches_list.append(patch)

    return patches_list

def predict(event, context):
    logger.info("Evento recebido: %s", json.dumps(event))
    print(event)

    try:
        # Decodificar a imagem base64
        if 'body' in event:
            file_data = json.loads(event['body'])['file']
        else:
            file_data = event['file']
        img_data = base64.b64decode(file_data)
        img = Image.open(io.BytesIO(img_data))

        # Dividir a imagem em patches
        patches_list = patches(img)

        # Fazer previsões para cada patch
        indexes = []
        for patch in patches_list:
            web_image = transform_image(patch)
            prediction = probability_model.predict(web_image)
            indexes.append(prediction)

        # Calcular a média das previsões
        mean_prediction = np.mean(indexes, axis=0)

        # Obter os principais estilos previstos
        top_indices = np.argsort(mean_prediction[0])[-3:][::-1]
        top_styles = [genre[idx] for idx in top_indices]
        top_probabilities = [mean_prediction[0][idx] for idx in top_indices]

        # Retorna os resultados
        results = [{'style': style, 'probability': round(prob * 100, 2)} for style, prob in zip(top_styles, top_probabilities)]

        logger.info("Resultado da previsão: %s", json.dumps(results))

        return {
            'statusCode': 200,
            'body': json.dumps({'results': results})
        }
    except Exception as e:
        logger.error("Erro ao processar a imagem: %s", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

# Simulação de evento
# if __name__ == "__main__":
#     with open('teste.jpeg', 'rb') as image_file:
#         encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

#     event = {'file': encoded_image}

#     # Testar a função de previsão com o evento simulado
#     prediction_results = predict(event, None)

#     # Exibir resultados
#     print(prediction_results)


