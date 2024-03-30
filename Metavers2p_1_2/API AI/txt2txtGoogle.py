import requests

API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-xxl"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

inputQuery = input('prompt...\n')
output = query({
	"inputs": inputQuery,
})

import io
input(output[0]['generated_text'])