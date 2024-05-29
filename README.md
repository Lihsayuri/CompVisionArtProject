# CompVisionProject: Artistic Vision

### Feito por :sassy_man: :sassy_man: :sassy_woman:

- Fabricio Neri Lima.
- Jean Silas Ferreira Sanandrez.
- Lívia Sayuri Makuta.


## Descrição do Projeto :clipboard:	

O objetivo do projeto era desenvolver um software que fosse capaz de prever estilos artísticos para obras de arte não muito conhecidas. Sendo assim, seria possível identificar influências de pós-impressionistas de Van Gogh em obras de arte como na obra Sunflora:

<img src="https://github.com/Lihsayuri/CompVisionProject/assets/62647438/cab61e33-c89e-42a4-9ccb-ee1acdaae9d9" alt="post_impressionism_sunflore" width="300" height="300">


## Estruturação do Projeto :open_file_folder:

### Base de Dados :card_index:

- Para a construção de um modelo de Computer Vision que fosse capaz de prever entre os seguintes gêneros artísticos: Abstractionism, Baroque, Cubism, Renaissance, Post_Impressionism, Surrealism e Symbolism - foi utilizada uma base de dados com artistas e imagens de pinturas retirada do Kaggle (Best Artworks of All Time: https://www.kaggle.com/datasets/ikarus777/best-artworks-of-all-time). Porém essas imagens foram divididas em *patches* no modelo construído. Além disso, também foram transformadas com algumas rotações e modificações para diversificar um pouco mais a base de dados.

### Descrição do Modelo :black_nib::bar_chart:

- O modelo utilizado é uma rede neural convolucional (CNN) implementada usando o Keras, que foi treinado para classificar as imagens de arte nos sete estilos artísticos mencionados, usando técnicas de normalização, dropout e regularização para melhorar a performance e generalização do modelo. Ele possui as seguintes camadas:
  - Camada de Entrada: Recebe os *patches* de tamanho 125x125 pixels com 3 canais de cor (RGB).
  - Batch Normalization: Normaliza os valores da entrada para estabilizar e acelerar o treinamento.
  - Conv2D e MaxPooling:
    - Primeira combinação: 32 filtros, kernel de 3x3, ativação ReLU, seguida de uma camada de max-pooling 2x2 e dropout de 25%.
    - Segunda combinação: 64 filtros, kernel de 3x3, ativação ReLU, seguida de uma camada de max-pooling 2x2 e dropout de 25%.
    - Terceira combinação: 128 filtros, kernel de 3x3, ativação ReLU, seguida de uma camada de max-pooling 2x2 e dropout de 25%.
  - Flatten: Transforma os dados da camada convolucional em um vetor unidimensional.
  - Dense Layers:
      Primeira camada totalmente conectada (Dense) com 128 neurônios, ativação ReLU, e regularização L2.
      Dropout de 25% para prevenir overfitting.
      Segunda camada totalmente conectada (Dense) com 7 neurônios (número de classes) e ativação softmax para previsão das probabilidades das classes.

Feito isso, para identificar os estilos artísticos em uma imagem, primeiro ela é dividida em *patches* de 125x125 que são classificados um a um pelo modelo. Por fim, é feita uma média simples com os resultados obtidos nos *patches*, sendo retornados os 3 estilos artísticos mais influentes detectados pelo modelo naquela imagem. 

### Integração com Gemini (Google) :computer:

Por sua vez, para gerar descrições dos estilos artísticos previstos, foi utilizada a a API Gemini do serviço da Google Generative AI.

Para que isso fosse bem integrado ao projeto, foi necessário:
- Configurar a API com chaves e endpoints específicos, além de definir parâmetros como temperatura, topP, topK e número máximo de tokens.
- Criar sessões de chat para enviar solicitações e receber descrições concisas e informativas sobre os estilos artísticos.

### Infraestrutura :wrench:

Para a construção de uma aplicação web, a seguinte infraestrutura foi utilizada:

- Docker: uma imagem no Docker contendo a função de predição de estilos artísticos e suas dependências foi criada.
- Amazon Elastic Container Registry (ECR): em seguida, também foi criado um repositório no ECR para armazenar a imagem Docker. E a imagem do Docker criada anteriormente foi enviada para esse repositório ECR (push).
- AWS Lambda: depois, uma função Lambda foi criada com a imagem Docker armazenada no ECR.
- API Gateway: por fim, um API Gateway foi criado para expor a função Lambda como um endpoint HTTP.

### Automatização para Atualização de Modelo :outbox_tray:

Para automatizar o processo de deploy na infraestrutura do projeto, foi utilizado o `GitHub Actions`. O fluxo de atualização é o seguinte:

- O novo modelo é adicionado na pasta AWS/model com o nome `model_v0.h5`.

E depois o `GitHub Actions` automaticamente:

- Constrói a nova imagem Docker com o modelo atualizado.
- Envia (push) a imagem para o repositório ECR da AWS.
- Atualiza a função Lambda com a nova imagem.

Com a função Lambda e a imagem do repositório ECR atualizadas, o API Gateway, que utiliza esse modelo para fazer as predições na aplicação web, é automaticamente atualizado.

## Exemplo de teste :bulb: 

Um exemplo de uso da aplicação pode ser visto abaixo, com a classificação de estilos para a imagem Sunflora. Percebe-se que o modelo conseguiu encontrar traços pós-impressionistas na obra de arte:

![image](https://github.com/Lihsayuri/CompVisionProject/assets/62647438/acb68481-ad64-4c61-a41a-beb40dad077c)

![image](https://github.com/Lihsayuri/CompVisionProject/assets/62647438/226f18a3-945a-42b6-9b72-05a37ec02822)

## Vídeos :movie_camera:

- Vídeo que mostra o funcionamento da aplicação: :white_check_mark:                      
- Vídeo que mostra o deploy/atualização do modelo: https://www.youtube.com/watch?v=PcT29DIJ28w :white_check_mark:

## Link do deploy da aplicação web:

- http://art-style-website.s3-website-us-east-1.amazonaws.com/ :white_check_mark:

## Referências:

- https://www.kaggle.com/datasets/ikarus777/best-artworks-of-all-time
- https://github.com/Camillelib/Art_Classifying_Project
- https://ai.google.dev/gemini-api/docs/api-key?hl=pt-br
- https://insper.github.io/mlops/modules/07-lambda/lambda_and_docker/
- https://insper.github.io/mlops/modules/12-ci-cd/auto_deploy/

:copyright: [A fim de utilizar o projeto, dar créditos aos autores do projeto | 2024]
