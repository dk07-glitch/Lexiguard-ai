import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    # Check port availability or find next open port
    for p in range(PORT, PORT + 10):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                print(f"LexiGuard AI server running at: http://localhost:{p}")
                print("Press Ctrl+C to stop.")
                webbrowser.open(f"http://localhost:{p}")
                httpd.serve_forever()
                break
        except OSError:
            continue
