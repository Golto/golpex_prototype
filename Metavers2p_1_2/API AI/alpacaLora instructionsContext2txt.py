import requests

API_URL = "https://api-inference.huggingface.co/models/declare-lab/flan-alpaca-xl"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

inputQuery = input('prompt...\n')
output = query({
	"inputs": inputQuery,
})

input(output)# Erreur si la requête n'est pas revenu

input(output[0]['generated_text'])



#-------------------------------------------------------------
# CRAFTING TABLE
"""
INSTRUCTIONS = 'In a sandbox game, we want to craft new items with a certain quantity of each materials. Complete by giving the resulted crafted item from the following materials : '
CONTEXT = '3 woods, 2 iron bars : '
#https://www.minecraft-crafting.net/


# In a sandbox game, we want to craft new items with a certain quantity of each materials. List every item that can be crafted without saying anything else. 
inputQuery = INSTRUCTIONS + input('crafting prompt...\n')

output = query({
	"inputs": inputQuery,
})

input(output)# Erreur si la requête n'est pas revenu

input(output[0]['generated_text'])
"""

#-------------------------------------------------------------
# CODE ASSISTANT
"""
INSTRUCTIONS = 'We are expert developpers in python, you are the assistant that document functions and methods we are searching for. '
CONTEXT = ' '


inputQuery = INSTRUCTIONS + input('code prompt...\n')

output = query({
	"inputs": inputQuery,
})

input(output)# Erreur si la requête n'est pas revenu

input(output[0]['generated_text'])
"""



"""
# JS

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/declare-lab/flan-alpaca-xl",
		{
			headers: { Authorization: "Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();

"""