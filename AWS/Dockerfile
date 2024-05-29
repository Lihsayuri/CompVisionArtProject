FROM public.ecr.aws/lambda/python:3.10

# Copy requirements file
COPY AWS/requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copy function code
COPY AWS/predict_function.py ${LAMBDA_TASK_ROOT}

# Copy model directory
COPY AWS/model/ ${LAMBDA_TASK_ROOT}/model/

# Command to run your Lambda function
CMD ["predict_function.predict"]
