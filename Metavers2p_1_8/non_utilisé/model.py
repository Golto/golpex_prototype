#C:\Users\Propriétaire\.cache\huggingface\hub
from transformers import pipeline

"""
classifier = pipeline('sentiment-analysis')

res = classifier("I'm super happy to do this")
"""
"""
generator = pipeline('text-generation', model="distilgpt2")

res = generator(
	"Il était une fois",
	max_length=30,
	num_return_sequences=2,
)
"""
classifier = pipeline('zero-shot-classification')

res = classifier(
	"Ce vecteur est normalisé",
	candidate_labels=['mathematics', 'litterature'],
)

print(res)
input()