import socketserver
import http.server
import ssl


IP = '127.0.0.1'#Inaccessible de l'extérieur
PORT = 12000
httpd = socketserver.TCPServer((IP, PORT), http.server.SimpleHTTPRequestHandler)
"""
#http -> https
httpd.socket = ssl.wrap_socket(httpd.socket,
	#certifile="",#server.pem
	#keyfile="",#server.key
	#server_side=True
	)
"""
httpd.serve_forever()