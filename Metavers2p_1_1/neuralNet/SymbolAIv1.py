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

#reseau (4,100,5)

w0 = np.random.normal(size=(100, 4))
w1 = np.random.normal(size=(5, 100))

b0 = np.zeros((100, 1))
b1 = np.zeros((5, 1))

w = [w0, w1]
b = [b0, b1]

activation_functions = [relu, sigmoid]
learning_rate = 0.0003

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

"""
#training
for i in range(50000):
	X = np.random.random((2,1))
	y = f(X)
	backward_propagation(X, y, w, b, activation_functions, learning_rate)
	ypred = forward_propagation(X, w, b, activation_functions)
	#print('\n\nmodel :\n',y,'\npredicted :\n', ypred)
"""

def char_to_vector(char):
	if char.isalpha():
		return np.array([1, 0, 0, 0]).reshape((4, 1))
	elif char.isdigit():
		return np.array([0, 1, 0, 0]).reshape((4, 1))
	elif char in "+-*/×⋅^":
		return np.array([0, 0, 1, 0]).reshape((4, 1))
	elif char in "{}()[],;":
		return np.array([0, 0, 0, 1]).reshape((4, 1))
	else:
		return np.array([0, 0, 0, 0]).reshape((4, 1))

def string_to_vector_sum(s):
	sum_vector = np.zeros((4, 1))
	for char in s:
		sum_vector = sum_vector + char_to_vector(char)
	return sum_vector




#générateurs de string d'objets mathématiques

def random_polynomial():
    # Coefficients aléatoires
    a = [np.random.randint(-10, 10) for i in range(5)]
    # Exposants
    e = [4, 3, 2, 1, 0]
    # Assemblage de la chaîne
    poly = []
    for i in range(5):
        if a[i] != 0:
            if a[i] > 0:
                poly.append(f'+{a[i]}X^{e[i]}')
            else:
                poly.append(f'-{-a[i]}X^{e[i]}')
    return ''.join(poly).lstrip('+')


def random_math_expression():
    variables = ['X', 'Y', 'Z']
    operations = ['+', '-', '*', '/']
    expression = ''
    n = np.random.randint(2, 12)
    for i in range(n):
        # Ajout d'une variable
        expression += np.random.choice(variables)
        # Ajout de parenthèse
        if np.random.random() < 0.5 :
            expression = '(' + expression + ')'
        # Ajout d'une opération aléatoire
        if i < n - 1:
            expression += np.random.choice(operations)
        # Ajout de parenthèses aléatoires
        
    return expression

def random_matrix_string(separator=','):
    # Générer un nombre aléatoire de lignes et de colonnes
    n_rows = np.random.randint(1, 6)
    n_cols = np.random.randint(1, 6)

    # Générer les coefficients aléatoires
    coeffs = np.random.randint(1, 10, size=(n_rows, n_cols))

    # Convertir les coefficients en chaîne de caractères
    coeffs_str = []
    for i in range(n_rows):
        row_str = ' '.join([str(x) for x in coeffs[i]])
        coeffs_str.append(row_str)

    # Assembler la chaîne de caractères finale
    matrix_str = separator.join(coeffs_str)
    matrix_str = '(' + matrix_str + ')'

    return matrix_str

def random_fraction():
    numerator = np.random.randint(-100, 10)
    denominator = np.random.randint(1, 100)
    return f"{numerator}/{denominator}"

"""
p = random_polynomial()
pn = string_to_vector_sum(p)
print(p,'\n',pn)
p = random_math_expression()
pn = string_to_vector_sum(p)
print(p,'\n',pn)
p = random_matrix_string(separator = ',')
pn = string_to_vector_sum(p)
print(p,'\n',pn)
p = random_fraction()
pn = string_to_vector_sum(p)
print(p,'\n',pn)
"""

"""
entrée :

Variables : 'x', 'y', 'z'					np.array([1, 0, 0, 0]).reshape((4, 1))
Chiffres : '0', '1', '2', '3'  				np.array([0, 1, 0, 0]).reshape((4, 1))
Opérations : '+', '*', '/', '-', '×', '⋅'	np.array([0, 0, 1, 0]).reshape((4, 1))
Formatages : '(', ')', '[', ']', '{', ','	np.array([0, 0, 0, 1]).reshape((4, 1))

sortie :

integer 			np.array([1, 0, 0, 0, 0]).reshape((5, 1))
polynom 			np.array([0, 1, 0, 0, 0]).reshape((5, 1))
literalExpression 	np.array([0, 0, 1, 0, 0]).reshape((5, 1))
matrix 				np.array([0, 0, 0, 1, 0]).reshape((5, 1))
rational			np.array([0, 0, 0, 0, 1]).reshape((5, 1))
"""

def max_index(vect):
    return np.argmax(vect)

labels = {0: 'integer', 1: 'polynom', 2: 'literalExpression', 3: 'matrix', 4: 'rational'}

def vect2label(vect):
	return labels[max_index(vect)]


#training
for i in range(1000):

	obj = str(np.random.randint(-100,100))
	X = string_to_vector_sum(obj)
	y = np.array([1, 0, 0, 0, 0]).reshape((5, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	
	#ypred = forward_propagation(X, w, b, activation_functions)
	#print('\n\nmodel :\n',y,'\n',obj,'\npredicted :\n', ypred)

	obj = random_polynomial()
	X = string_to_vector_sum(obj)
	y = np.array([0, 1, 0, 0, 0]).reshape((5, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	
	#ypred = forward_propagation(X, w, b, activation_functions)
	#print('\n\nmodel :\n',y,'\n',obj,'\npredicted :\n', ypred)

	obj = random_math_expression()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 1, 0, 0]).reshape((5, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	#ypred = forward_propagation(X, w, b, activation_functions)
	#print('\n\nmodel :\n',y,'\n',obj,'\npredicted :\n', vect2label(ypred))

	obj = random_matrix_string()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 0, 1, 0]).reshape((5, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	#ypred = forward_propagation(X, w, b, activation_functions)
	#print('\n\nmodel :\n',y,'\n',obj,'\npredicted :\n', vect2label(ypred))

	obj = random_fraction()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 0, 0, 1]).reshape((5, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	#ypred = forward_propagation(X, w, b, activation_functions)
	#print('\n\nmodel :\n',y,'\n',obj,'\npredicted :\n', vect2label(ypred))
	


#testing
testSize = 20
for i in range(testSize):
	#integer
	obj = str(np.random.randint(-100,100))
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

for i in range(testSize):
	#polynoms
	obj = random_polynomial()
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

for i in range(testSize):
	#expression
	obj = random_math_expression()
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

for i in range(testSize):
	#matrices
	obj = random_matrix_string()
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

for i in range(testSize):
	#rationals
	obj = random_fraction()
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

obj = 'π^π^π^π'
X = string_to_vector_sum(obj)
ypred = forward_propagation(X, w, b, activation_functions)
print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

obj = '3485545'
X = string_to_vector_sum(obj)
ypred = forward_propagation(X, w, b, activation_functions)
print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

input()


"""
futures versions :

réseau (7, 100, 7)

entrée :

Variables : 'a-zA-Z' alpha beta theta			np.array([1, 0, 0, 0, 0, 0, 0]).reshape((7, 1))
Chiffres : '0-9'			  					np.array([0, 1, 0, 0, 0, 0, 0]).reshape((7, 1))
Opérations : '+', '*', '-', '×', '⋅', '^'		np.array([0, 0, 1, 0, 0, 0, 0]).reshape((7, 1))
Formatages : '(', ')', '[', ']', '{', ','		np.array([0, 0, 0, 1, 0, 0, 0]).reshape((7, 1))
Fraction : '/'									np.array([0, 0, 0, 0, 1, 0, 0]).reshape((7, 1))
constants : pi phi e gamma 						np.array([0, 0, 0, 0, 0, 1, 0]).reshape((7, 1))
imaginaire : 'i'								np.array([0, 0, 0, 0, 0, 0, 1]).reshape((7, 1))

fonctions : 'sqrt', 'cos', 'sin', 'tan', 'ln', 'log' 
=> Plus compliqué : à faire plus tard, car implique d'observer des groupes de caractères (réseau convolutionnel ?)

sortie :

integer 			np.array([1, 0, 0, 0, 0, 0, 0]).reshape((7, 1))
rational			np.array([0, 1, 0, 0, 0, 0, 0]).reshape((7, 1))
real				np.array([0, 0, 1, 0, 0, 0, 0]).reshape((7, 1))
complex				np.array([0, 0, 0, 1, 0, 0, 0]).reshape((7, 1))
polynom 			np.array([0, 0, 0, 0, 1, 0, 0]).reshape((7, 1))
literalExpression 	np.array([0, 0, 0, 0, 0, 1, 0]).reshape((7, 1))
matrix 				np.array([0, 0, 0, 0, 0, 0, 1]).reshape((7, 1))



"""