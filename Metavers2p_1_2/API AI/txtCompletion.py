import requests

API_URL = "https://api-inference.huggingface.co/models/EleutherAI/gpt-neox-20b"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()
	


output = query({
	"inputs": "In a sandbox game, with 3 wooden stick and 3 irons we can craft :",
})
print(output[0]['generated_text'])



output = query({
	"inputs": "In a sandbox game, with 8 wooden planks we can craft :",
})
print(output[0]['generated_text'])




inputQuery = input('prompt...\n')
output = query({
	"inputs": inputQuery,
})

input(output[0]['generated_text'])