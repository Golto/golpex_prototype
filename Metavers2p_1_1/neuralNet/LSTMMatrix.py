import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Définir le vocabulaire
vocab = ['Bonjour', 'au', 'revoir', 'merci', 's\'il', 'vous', 'plaît']

# Créer un dictionnaire de correspondance entre chaque mot et son index
word_to_index = {word: i for i, word in enumerate(vocab)}
index_to_word = {i: word for word, i in word_to_index.items()}



# Définir la taille de la séquence maximale
max_sequence_length = 10

# Définir le modèle
model = keras.Sequential()
# Add an Embedding layer expecting input vocab of size 1000, and
# output embedding dimension of size 64.
model.add(layers.Embedding(input_dim=1000, output_dim=64))

# Add a LSTM layer with 128 internal units.
model.add(layers.LSTM(128))

# Add a Dense layer with 10 units.
model.add(layers.Dense(10))

model.summary()


# Compiler le modèle
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# Entraîner le modèle sur un exemple d'entrée/sortie
"""
history = model.fit(x_train, y_train,
                    batch_size=32,
                    epochs=10,
                    validation_data=(x_val, y_val))
"""
"""
# Utiliser le modèle pour compléter une phrase
input_phrase = 'Bonjour s\'il vous plaît'
input_sequence = [word_to_index[word] for word in input_phrase.split()]
input_sequence += [0] * (max_sequence_length - len(input_sequence))
input_sequence = tf.one_hot([input_sequence], len(vocab))
predicted_sequence = model.predict(input_sequence)[0]
predicted_indices = tf.argmax(predicted_sequence, axis=1)
predicted_words = [index_to_word[index.numpy()] for index in predicted_indices if index != 0]
output_phrase = ' '.join(predicted_words)
print('Output phrase:', output_phrase)
"""
input()