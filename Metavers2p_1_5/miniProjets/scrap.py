import requests


url = 'https://fr.wikipedia.org/wiki/Chaussure'

response = requests.get(url)

if response.ok:
	print(response.text)
else :
	print(response)

input()