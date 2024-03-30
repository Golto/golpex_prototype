import numpy as np

def sigmoid(x, derivative=False):
	if derivative:
		return sigmoid(x) * (1 - sigmoid(x))
	return 1 / (1 + np.exp(-x))

def relu(x, derivative=False):
	if derivative:
		return np.greater(x, 0).astype(int) # = indicatrice(x > 0)
	return np.maximum(0, x)

#np.random.seed(77259)

#reseau (2,100,2)

w0 = np.random.normal(size=(100, 2))
w1 = np.random.normal(size=(2, 100))
w2 = np.random.normal(size=(2, 100))
w3 = np.random.normal(size=(2, 4))

b0 = np.zeros((100, 1))
b1 = np.zeros((2, 1))
b2 = np.zeros((2, 1))
b3 = np.zeros((2, 1))
"""
w = [w0, w1, w2, w3]
b = [b0, b1, b2, b3]

activation_functions = [relu, relu, relu, relu]
"""
w = [w0, w1]
b = [b0, b1]

activation_functions = [relu, relu]
learning_rate = 0.1

def forward_propagation(X, w, b, activation_functions):
	
	# Initialisation de la variable z avec les entrées X
	a = X

	# Propagation avant à travers chaque couche
	NBiter = len(w)
	for i in range(NBiter):
		z = np.dot(w[i], a) + b[i]
		a = activation_functions[i](z)
	
	return a

def backward_propagation(X, y, w, b, activation_functions, learning_rate):
	# Propagation avant
	a = [X]
	z = []
	NBiter = len(w)

	for i in range(NBiter):
		z.append(np.dot(w[i], a[i]) + b[i])
		a.append(activation_functions[i](z[i]))

	# Calcul de l'erreur de la couche de sortie
	delta = [a[-1] - y]
	

	# Calcul de l'erreur de chaque couche cachée
	for i in reversed(range(NBiter - 1)):
		delta.insert(0, np.dot(w[i+1].T, delta[0]) * activation_functions[i](z[i], derivative=True))
	
	# Calcul des gradients des poids et des biais
	dw = []
	db = []
	for i in range(NBiter):
		dw.append(np.dot(delta[i], a[i].T))
		db.append(np.sum(delta[i], axis=1, keepdims=True))


	# Mise à jour des poids et des biais
	for i in range(NBiter):
		w[i] -= learning_rate * dw[i]
		b[i] -= learning_rate * db[i]


def least_square_cost(y_true, y_pred, derivative=False):
	m = y_true.shape[1] # nombre d'exemples

	if derivative:
		return 1/m * np.sum(y_pred - y_true)
	
	cost = 1/(2*m) * np.sum(np.square(y_pred - y_true))
	return cost


def f(X):
	x = X[0,0]
	y = X[1,0]
	#return np.array([[x*x+y], [x*y+1]])
	return np.array([[x*x+y*y], [x*y+1]])


#np.random.seed(77259)

#training
for i in range(30000):
	X = np.random.random((2,1))
	y = f(X)
	backward_propagation(X, y, w, b, activation_functions, learning_rate)
	ypred = forward_propagation(X, w, b, activation_functions)
	#print('\n\nmodel :\n',y,'\npredicted :\n', ypred)
	#print('\n erreur :',least_square_cost(y,ypred))



X = np.random.random((2,1))
y = f(X)
backward_propagation(X, y, w, b, activation_functions, learning_rate)
ypred = forward_propagation(X, w, b, activation_functions)
print('\n\nmodel :\n',y,'\npredicted :\n', ypred)












input('graph?')



import matplotlib.pyplot as plt

		
# Générer des valeurs de X pour visualiser les fonctions

x_vals = np.linspace(-1, 1, 100)
y_vals = np.linspace(-1, 1, 100)
X = np.zeros((2, 1))

# Calculer les sorties des deux fonctions pour chaque valeur de X
f_vals = np.zeros((len(x_vals), len(y_vals)))
nn_vals = np.zeros((len(x_vals), len(y_vals)))
for i in range(len(x_vals)):
	for j in range(len(y_vals)):
		X[0,0] = x_vals[i]
		X[1,0] = y_vals[j]
		f_vals[j,i] = f(X)[0,0]
		nn_vals[j,i] = forward_propagation(X, w, b, activation_functions)[0,0]

# Visualiser les résultats
fig, axs = plt.subplots(1, 2, figsize=(10, 5))

axs[0].set_title('f(X)')
axs[0].set_xlabel('x')
axs[0].set_ylabel('y')
axs[0].contourf(x_vals, y_vals, f_vals, cmap='coolwarm')

axs[1].set_title('forward_propagation(X, ...)\ntrained on [0,1]x[0,1]')
axs[1].set_xlabel('x')
axs[1].set_ylabel('y')
axs[1].contourf(x_vals, y_vals, nn_vals, cmap='coolwarm')

plt.show()
