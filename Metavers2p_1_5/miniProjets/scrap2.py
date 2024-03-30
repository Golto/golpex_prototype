import requests

url = 'https://www.google.com/search?q=python+tutorial'
headers = {'User-Agent': 'Mozilla/5.0'}

response = requests.get(url, headers=headers)


input(response.text)