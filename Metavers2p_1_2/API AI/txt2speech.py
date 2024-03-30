import requests

API_URL = "https://api-inference.huggingface.co/models/openai/whisper-medium.en"
headers = {"Authorization": "Bearer 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"}

def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    return response.json()

output = query("sample1.flac")

print(output)
input()