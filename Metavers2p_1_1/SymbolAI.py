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

w0 = np.random.normal(size=(100, 7))
w1 = np.random.normal(size=(7, 100))

b0 = np.zeros((100, 1))
b1 = np.zeros((7, 1))

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




def char_to_vector(char):
	if char.isalpha() or char in "𝛼𝛽𝛿𝜃𝜔𝜆𝜎𝜄𝜁𝜂𝜅𝜉𝜓𝜒𝜖𝜐𝜌𝜇𝜈𝜏ℵ":#les symboles ne sont pas dans le bon format
		return np.array([1, 0, 0, 0, 0, 0, 0]).reshape((7, 1))
	elif char.isdigit():
		return np.array([0, 1, 0, 0, 0, 0, 0]).reshape((7, 1))
	elif char in "+-×⋅^":
		return np.array([0, 0, 1, 0, 0, 0, 0]).reshape((7, 1))
	elif char in "{}()[],;.":
		return np.array([0, 0, 0, 1, 0, 0, 0]).reshape((7, 1))
	elif char in "/":
		return np.array([0, 0, 0, 0, 1, 0, 0]).reshape((7, 1))
	elif char in "πe":#𝛾𝜙 ne sont pas le bon format
		return np.array([0, 0, 0, 0, 0, 1, 0]).reshape((7, 1))
	elif char in "i":
		return np.array([0, 0, 0, 0, 0, 0, 1]).reshape((7, 1))
	else:
		return np.array([0, 0, 0, 0, 0, 0, 0]).reshape((7, 1))	

def string_to_vector_sum(s):
	sum_vector = np.zeros((7, 1))
	for char in s:
		sum_vector = sum_vector + char_to_vector(char)
	return sum_vector





#générateurs de string d'objets mathématiques

def random_integer():
	return str(np.random.randint(-100,100))

def random_fraction():
	numerator = np.random.randint(-100, 10)
	denominator = np.random.randint(1, 100)
	return f"{numerator}/{denominator}"

def random_real():
	# Liste des fonctions mathématiques
	functions = ['exp', 'log', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt', 'ln']
	# Liste des opérateurs mathématiques
	operators = ['+', '-', '×', '/', '^']
	# Liste des constantes mathématiques
	constants = ['e', 'π']

	constant = ''
	function = ''
	number = ''
	# Nombre aléatoire ou constante mathématique
	if np.random.random() < 0.5:
		constant = np.random.choice(constants)
	else:
		constant = str(round(np.random.uniform(-10, 10), 4))
	
	# Ajoute une expression mathématique avec une probabilité de 0.5
	
	function = np.random.choice(functions) + '(' + constant + ')'


	# Ajoute un opérateur mathématique et une autre expression mathématique avec une probabilité de 0.5
	operator = np.random.choice(operators)
	p = np.random.random()
	if p < 0.5:
		return f'{constant}'
	elif p < 0.8 :
		return f'{constant}{operator}{random_real()}'

	return f'{function}{operator}{random_real()}'

	

def random_complex():
	p = np.random.random()
	if p < 0.1:
		return random_real() + '+(' + random_real() + ')i'
	elif p < 0.6 :
		return random_integer() + '+' + random_integer() + 'i'
	elif p < 0.8 :
		return random_fraction() + '+' + random_fraction() + 'i'
	return random_real() + 'i'

def random_polynomial():
	# Coefficients aléatoires
	a = [np.random.randint(-20, 20) for i in range(5)]
	# Exposants
	e = [0, 1, 2, 3, 4]
	# Assemblage de la chaîne
	poly = []
	for i in range(np.random.randint(2, 6)):
		if a[i] != 0:
			if a[i] > 0:
				if e[i] == 0:
					poly.append(f'+{a[i]}')
				elif e[i] == 1:
					poly.append(f'+{a[i]}X')
				else :
					poly.append(f'+{a[i]}X^{e[i]}')
			else:
				if e[i] == 0:
					poly.append(f'+{a[i]}')
				elif e[i] == 1:
					poly.append(f'+{a[i]}X')
				else :
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






def max_index(vect):
	return np.argmax(vect)

labels = {0: 'integer', 1: 'rational', 2: 'real', 3: 'complex', 4: 'polynom', 5: 'literalExpression', 6: 'matrix'}

def vect2label(vect):
	return labels[max_index(vect)]


#training

print('training...')
trainIter = 1000
for i in range(trainIter):

	if i == round(trainIter * 0.2):
		print('20%')
	if i == round(trainIter * 0.4):
		print('40%')
	if i == round(trainIter * 0.6):
		print('60%')
	if i == round(trainIter * 0.8):
		print('80%')

	obj = random_integer()
	X = string_to_vector_sum(obj)
	y = np.array([1, 0, 0, 0, 0, 0, 0]).reshape((7, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	obj = random_fraction()
	X = string_to_vector_sum(obj)
	y = np.array([0, 1, 0, 0, 0, 0, 0]).reshape((7, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	obj = random_real()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 1, 0, 0, 0, 0]).reshape((7, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	obj = random_complex()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 0, 1, 0, 0, 0]).reshape((7, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	obj = random_polynomial()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 0, 0, 1, 0, 0]).reshape((7, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	obj = random_math_expression()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 0, 0, 0, 1, 0]).reshape((7, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)

	obj = random_matrix_string()
	X = string_to_vector_sum(obj)
	y = np.array([0, 0, 0, 0, 0, 0, 1]).reshape((7, 1))
	backward_propagation(X, y, w, b, activation_functions, learning_rate)
print('100%')

#testing
testSize = 20
"""
for i in range(testSize):
	#integer
	obj = str(np.random.randint(-100,100))
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

for i in range(testSize):
	#real
	obj = random_real()
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

for i in range(testSize):
	#complex
	obj = random_complex()
	X = string_to_vector_sum(obj)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))
"""
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
"""
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
"""



"""
obj = 'π^π^π^π'
X = string_to_vector_sum(obj)
ypred = forward_propagation(X, w, b, activation_functions)
print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))

obj = '3/4'
X = string_to_vector_sum(obj)
ypred = forward_propagation(X, w, b, activation_functions)
print('\n\nmodel :\n',obj,'\npredicted :\n', vect2label(ypred))
"""


def inputTesting():
	request = input('stop pour arrêter, tout autre expression va être testé\n')
	if request == 'stop':
		return 0
	X = string_to_vector_sum(request)
	ypred = forward_propagation(X, w, b, activation_functions)
	print('\n\nmodel :\n',request,'\npredicted :\n', vect2label(ypred),'\n')
	inputTesting()

inputTesting()
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