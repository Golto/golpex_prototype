"""

#------------------------------------------------------
# test de réseau de neurones récurrents RNN : recurrent neural network


import tensorflow as tf
import numpy as np



input_size = 1
timesteps = 10
hidden_size = 64
learning_rate = 0.001
batch_size = 32
num_epochs = 100


#	input_size : la taille de chaque entrée.
#	timesteps : la taille de la séquence d'entrée.
#	hidden_size : la taille de la couche cachée.
#	learning_rate : le taux d'apprentissage pour l'optimiseur.
#	batch_size : la taille de chaque lot de données.
#	num_epochs : le nombre d'itérations à travers l'ensemble de données.


def generate_data(batch_size, timesteps, input_size):
	x = np.random.uniform(0, 1, size=(batch_size, timesteps, input_size))
	y = x[:, -1, :]
	return x, y

inputs = tf.keras.layers.Input(shape=(timesteps, input_size))
lstm_layer = tf.keras.layers.LSTM(hidden_size, activation='tanh')(inputs)
outputs = tf.keras.layers.Dense(input_size)(lstm_layer)

model = tf.keras.models.Model(inputs=inputs, outputs=outputs)
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate), loss='mse')

#training
for epoch in range(num_epochs):
    x, y = generate_data(batch_size, timesteps, input_size)
    model.train_on_batch(x, y)
"""



#------------------------------------------------------
# test de réseau de neurones MLP : multi-layer perceptron

import tensorflow as tf

# Chargement des données
(X_train, y_train), (X_test, y_test) = tf.keras.datasets.mnist.load_data()

# Normalisation des données
X_train = X_train / 255.0
X_test = X_test / 255.0

# Construction du modèle
model = tf.keras.models.Sequential([
    tf.keras.layers.Flatten(input_shape=(28, 28)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])

# Compilation du modèle
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Entraînement du modèle
model.fit(X_train, y_train, epochs=5, validation_data=(X_test, y_test))

# Évaluation du modèle
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=2)
print('\nTest accuracy:', test_acc)

input('end...')

"""
chatGPT :
Dans cet exemple, nous utilisons le jeu de données MNIST pour entraîner le modèle MLP à classer 
des images de chiffres manuscrits. Nous construisons un modèle à 2 couches cachées, avec une 
couche d'entrée qui est une couche Flatten pour aplatir l'image, une couche cachée de 128 neurones 
avec une fonction d'activation ReLU, et une couche de sortie de 10 neurones avec une fonction 
d'activation softmax pour produire une distribution de probabilité sur les 10 classes possibles. 
Nous utilisons l'optimiseur Adam et la perte d'entropie croisée catégorique éparse pour la rétropropagation. 
Ensuite, nous entraînons le modèle pendant 5 époques sur le jeu de données d'entraînement et évaluons 
la précision sur le jeu de données de test.

"""

import matplotlib.pyplot as plt
from tensorflow.keras.datasets import mnist

# Charger les données de MNIST
(train_images, train_labels), (test_images, test_labels) = mnist.load_data()

# Afficher les 25 premières images de la base de données
plt.figure(figsize=(10,10))
for i in range(25):
    plt.subplot(5,5,i+1)
    plt.xticks([])
    plt.yticks([])
    plt.grid(False)
    plt.imshow(train_images[i+25], cmap=plt.cm.binary)
    plt.xlabel(train_labels[i+25])
plt.show()