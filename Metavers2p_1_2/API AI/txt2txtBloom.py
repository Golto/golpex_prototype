import requests

API_URL = "https://api-inference.huggingface.co/models/bigscience/bloom"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

"""
inputQuery = input('Completion...\n')
output = query({
	"inputs": inputQuery,
})
print(output)
print(output[0]['generated_text'])
input()
"""
# Text Completion

'A like Alpaca, B like Baby, C like Couch, D like dinosaur, E like'
'1,2,3,4,5,6,'
'2,3,5,7,11,13,17,19,'

context = '3+2i = complex, 5X^2+X+3 = polynom, 17-2i = complex, 5/7 = fraction, X^3+1 = polynom, '
requestedObject = 'i'
inputQuery = context + requestedObject + '='

output = query({
	"inputs": inputQuery,
})
result = output[0]['generated_text']
print(result)
input()