
"""
import numpy as np
import matplotlib.pyplot as plt

# Définition de la fonction z = f(x, y) = x^2 + y^2
def f(x, y):
    return x**2 + y**2

# Génération des données
x = np.linspace(-5, 5, 10)
y = np.linspace(-5, 5, 10)
X, Y = np.meshgrid(x, y)
Z = f(X, Y)

# Affichage en 3D
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.plot_surface(X, Y, Z)

ax.set_xlabel('x')
ax.set_ylabel('y')
ax.set_zlabel('z')

plt.show()
"""

import matplotlib.pyplot as plt

def solve(equation, initial_guess, x_range):
    x_values = []
    y_values = []

    for x in x_range:
        # Initial guess
        y = initial_guess

        # Maximum number of iterations
        max_iterations = 100

        # Tolerance for convergence
        tolerance = 1e-6

        # Newton-Raphson iteration
        for _ in range(max_iterations):
            f = equation(y, x)
            f_prime = (equation(y + tolerance, x) - equation(y - tolerance, x)) / (2 * tolerance)

            y -= f / f_prime

            # Check convergence
            if abs(f) < tolerance:
                break

        x_values.append(x)
        y_values.append(y)

    plt.plot(x_values, y_values)
    plt.xlabel('x')
    plt.ylabel('y')
    plt.grid(True)
    plt.show()


# Exemple d'utilisation

def equation(y, x):
    return y - 1/(1+x**2)

initial_guess = 0.5
x_range = range(-10, 11)

solve(equation, initial_guess, x_range)

"""
import matplotlib.pyplot as pl
"""
