import numpy as np


def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def softmax(z):
    exp_z = np.exp(z)
    return exp_z / np.sum(exp_z, axis=0)

def relu(z):
    return np.maximum(0, z)

"""
# réseau à couche (2, 20, 2) avec activation sigmoid

# Initialiser les poids de la première couche
w1 = np.random.normal(size=(20, 2))

# Initialiser les poids de la deuxième couche
w2 = np.random.normal(size=(2, 20))

# Initialiser les biais de la première couche
b1 = np.zeros((20, 1))

# Initialiser les biais de la deuxième couche
b2 = np.zeros((2, 1))

def forward_propagation(X, w1, w2, b1, b2):
    # Propagation avant de la première couche
    z1 = np.dot(w1, X) + b1
    a1 = sigmoid(z1)

    # Propagation avant de la deuxième couche
    z2 = np.dot(w2, a1) + b2
    a2 = softmax(z2)

    return a2


def backward_propagation(X, y, w1, w2, b1, b2, learning_rate):
    # Propagation avant
    z1 = np.dot(w1, X) + b1
    a1 = sigmoid(z1)
    z2 = np.dot(w2, a1) + b2
    a2 = softmax(z2)

    # Calcul de l'erreur de la couche de sortie
    delta2 = a2 - y

    # Calcul de l'erreur de la première couche cachée
    delta1 = np.dot(w2.T, delta2) * (a1 * (1 - a1))

    # Calcul des gradients des poids et des biais
    dw2 = np.dot(delta2, a1.T)
    db2 = np.sum(delta2, axis=1, keepdims=True)
    dw1 = np.dot(delta1, X.T)
    db1 = np.sum(delta1, axis=1, keepdims=True)

    # Mise à jour des poids et des biais
    w2 -= learning_rate * dw2
    b2 -= learning_rate * db2
    w1 -= learning_rate * dw1

"""

# Initialiser les poids de la première couche
w1 = np.random.normal(size=(10, 2))

# Initialiser les poids de la deuxième couche
w2 = np.random.normal(size=(10, 10))

# Initialiser les poids de la troisième couche
w3 = np.random.normal(size=(2, 10))

# Initialiser les biais de la première couche
b1 = np.zeros((10, 1))

# Initialiser les biais de la deuxième couche
b2 = np.zeros((10, 1))

# Initialiser les biais de la troisième couche
b3 = np.zeros((2, 1))

def forward_propagationReLU(X, w1, w2, w3, b1, b2, b3):
    # Propagation avant de la première couche
    z1 = np.dot(w1, X) + b1
    a1 = relu(z1)

    # Propagation avant de la deuxième couche
    z2 = np.dot(w2, a1) + b2
    a2 = relu(z2)

    # Propagation avant de la troisième couche
    z3 = np.dot(w3, a2) + b3
    #a3 = sigmoid(z3)
    a3 = relu(z3)

    return a3

def backward_propagationReLU(X, y, w1, w2, w3, b1, b2, b3, learning_rate):
    # Propagation avant
    z1 = np.dot(w1, X) + b1
    a1 = relu(z1)
    z2 = np.dot(w2, a1) + b2
    a2 = relu(z2)
    z3 = np.dot(w3, a2) + b3
    #a3 = sigmoid(z3)
    a3 = relu(z3)

    # Calcul de l'erreur de la couche de sortie
    delta3 = a3 - y

    # Calcul de l'erreur de la deuxième couche cachée
    delta2 = np.dot(w3.T, delta3) * (z2 > 0)

    # Calcul de l'erreur de la première couche cachée
    delta1 = np.dot(w2.T, delta2) * (z1 > 0)

    # Calcul des gradients des poids et des biais
    dw3 = np.dot(delta3, a2.T)
    db3 = np.sum(delta3, axis=1, keepdims=True)
    dw2 = np.dot(delta2, a1.T)
    db2 = np.sum(delta2, axis=1, keepdims=True)
    dw1 = np.dot(delta1, X.T)
    db1 = np.sum(delta1, axis=1, keepdims=True)

    # Mise à jour des poids et des biais
    w3 -= learning_rate * dw3
    b3 -= learning_rate * db3
    w2 -= learning_rate * dw2
    b2 -= learning_rate * db2
    w1 -= learning_rate * dw1
    b1 -= learning_rate * db1


"""
print('\n w1 ',w1,'\n b1 ',b1,'\n w2 ',w2,'\n b2 ',b2)
#---------------------------------------------------------------------
# Exemple d'utilisation de backward_propagation
X = np.array([[0.1], [0.7]])
y = np.array([[0], [1]])
learning_rate = 0.1

output = forward_propagation(X, w1, w2, b1, b2)
print('\n output : ',output)
backward_propagation(output, y, w1, w2, b1, b2, learning_rate)

print('\n w1 ',w1,'\n b1 ',b1,'\n w2 ',w2,'\n b2 ',b2)
#---------------------------------------------------------------------
# Exemple d'utilisation de backward_propagation
X = np.array([[0.1], [0.7]])
y = np.array([[0], [1]])
learning_rate = 0.1

output = forward_propagation(X, w1, w2, b1, b2)
print('\n output : ',output)
backward_propagation(output, y, w1, w2, b1, b2, learning_rate)

print('\n w1 ',w1,'\n b1 ',b1,'\n w2 ',w2,'\n b2 ',b2)
#---------------------------------------------------------------------
# Exemple d'utilisation de backward_propagation
X = np.array([[0.1], [0.7]])
y = np.array([[0], [1]])
learning_rate = 0.1

output = forward_propagation(X, w1, w2, b1, b2)
print('\n output : ',output)
backward_propagation(output, y, w1, w2, b1, b2, learning_rate)

print('\n w1 ',w1,'\n b1 ',b1,'\n w2 ',w2,'\n b2 ',b2)
#---------------------------------------------------------------------
"""

def cost(X,Y):
	d0 = X[0,0] - Y[0,0]
	d1 = X[1,0] - Y[1,0]
	return d0*d0 + d1*d1


learning_rate = 0.1

"""
entrée : (x,y) un point dans un plan
expérience : on veut approximer f(x,y)
sortie : f(x,y) = (a,b)
"""

"""
# erreur à la fin : 0.00037861373267107504
def f(X):
	x = X[0,0]
	y = X[1,0]
	return np.array([[x], [y/2]])



for i in range(1000):
	X = np.random.random((2,1))
	y = f(X)
	backward_propagationReLU(X, y, w1, w2, w3, b1, b2, b3, learning_rate)
	ypred = forward_propagationReLU(X, w1, w2, w3, b1, b2, b3)
	print('\n\nmodel :\n',y,'\npredicted :\n', ypred)
	print('\n erreur :',cost(y,ypred))
"""

def f(X):
	x = X[0,0]
	y = X[1,0]
	return np.array([[x*x + y], [y*x + 1]])



for i in range(1000):
	X = np.random.random((2,1))
	y = f(X)
	backward_propagationReLU(X, y, w1, w2, w3, b1, b2, b3, learning_rate)
	ypred = forward_propagationReLU(X, w1, w2, w3, b1, b2, b3)
	print('\n\nmodel :\n',y,'\npredicted :\n', ypred)
	print('\n erreur :',cost(y,ypred))

X = np.random.random((2,1))
y = f(X)
ypred = forward_propagationReLU(X, w1, w2, w3, b1, b2, b3)
print('\n\ntest :', '\nentrée : \n',X,'\nsortie model : \n',y,'\nsortie predicted : \n',ypred)
print('\n erreur :',cost(y,ypred))

print(w1)
print(w2)
print(w3)

print(b1)
print(b2)
print(b3)
input()