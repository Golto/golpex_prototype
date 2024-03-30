import numpy as np

# Maillage 
nodes = np.array([[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1]]) # positions [x : 0.0, y : 5.0]
elements = np.array([[0,1,4],[1,2,5],[2,3,6],[4,5,7], [1,5,4], [5,6,2], [6,7,3]])

# Fonction à approximer
def u_exact(x,y):
    return x**2 + y**2

# Assemblage de la matrice de rigidité et du vecteur force
K = np.zeros((len(nodes),len(nodes)))
F = np.zeros(len(nodes))


for e in elements:
    n1, n2, n3 = e
    print(e, elements)
    x1, y1 = nodes[n1]
    x2, y2 = nodes[n2] 
    x3, y3 = nodes[n3]

    k = np.array([[y2-y3, y3-y1, y1-y2], 
                  [x3-x2, x1-x3, x2-x1],
                  [x2*y3 - x3*y2, x3*y1 - x1*y3, x1*y2 - x2*y1]])
    
    ke = np.dot(k.T, k) 
    
    K[np.ix_(e,e)] += ke
    
    fy = u_exact(x1, y1)
    fz = u_exact(x2, y2)
    fw = u_exact(x3, y3)
    Fe = np.array([fy, fz, fw])
    F[e] += np.dot(k.T, Fe)
    
# Résolution   
u = np.linalg.solve(K, F)

# Post-traitement 
print(u)


# Visualisation 
import matplotlib.pyplot as plt

x = nodes[:,0]
y = nodes[:,1]

plt.tricontourf(x, y, elements, u)
plt.title('Solution éléments finis')
plt.colorbar()
plt.show()