import requests

API_URL = "https://api-inference.huggingface.co/models/gpt2"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()
	

inputQuery = input('prompt...\n')
output = query({
	"inputs": inputQuery,
})

input(output[0]['generated_text'])