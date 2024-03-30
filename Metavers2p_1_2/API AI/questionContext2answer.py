import requests

API_URL = "https://api-inference.huggingface.co/models/distilbert-base-cased-distilled-squad"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()


inputQuestion = input('Question...\n')
inputContext = input('Context...\n')

output = query({
	"inputs": {
		"question": inputQuestion,
		"context": inputContext
	},
})

print(output['answer'],'  ',output['score'])
input()