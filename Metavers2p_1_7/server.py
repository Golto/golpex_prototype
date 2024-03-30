import socketserver
import http.server
import ssl


IP = '127.0.0.1'#Inaccessible de l'extérieur
PORT = 10000
httpd = socketserver.TCPServer((IP, PORT), http.server.SimpleHTTPRequestHandler)
#http -> https
"""
httpd.socket = ssl.wrap_socket(httpd.socket,
	#certifile="",#server.pem
	#keyfile="",#server.key
	#server_side=True
	)
"""
httpd.serve_forever()


"""
import http.server
import socketserver

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

IP = '127.0.0.1'
PORT = 10003
httpd = socketserver.TCPServer((IP, PORT), MyHandler)
httpd.serve_forever()
"""


"""
from http.server import BaseHTTPRequestHandler, HTTPServer
import time

hostName = "localhost"
serverPort = 10003

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>https://pythonbasics.org</title></head>", "utf-8"))
        self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        self.wfile.write(bytes("<body>", "utf-8"))
        self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        self.wfile.write(bytes("</body></html>", "utf-8"))
        
if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
"""