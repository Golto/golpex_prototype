import matplotlib.pyplot as plt
#https://www.youtube.com/watch?v=OpaKpzMFOpg

def gcd(a, b):
    while b != 0:
        r = a % b
        a, b = b, r
    return a

def R(n):
	if n == 1:
		return 7
	return R(n - 1) + gcd(n, R(n - 1))

def Rlist(N):
	Rs = [0,7]
	GCDs = []
	for n in range(2,N):
		Rgcd = gcd(n, Rs[n - 1])
		
		Rs.append(Rs[n - 1] + Rgcd)
		if Rgcd != 1:
			GCDs.append([n, Rgcd])
		
	return Rs, GCDs

def splitGcdIndex(List):
	Indeces = list(map(lambda x: x[0] , List))
	GCDs = list(map(lambda x: x[1] , List))
	return Indeces, GCDs



N = 10000
x = range(0,N)
y, indecesGcd = Rlist(N)
Indeces, GCDs = splitGcdIndex(indecesGcd)

"""
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))


ax1.scatter(x, y)
ax1.set_title('Fonction R')




x = range(len(indecesGcd))

ax2.scatter(x, Indeces)
ax2.scatter(x, GCDs)
ax2.set_yscale('log')

plt.show()
"""



primes = set(GCDs)
primes.add(2)
primes = list(primes)
primes.sort()
print(primes)

input()