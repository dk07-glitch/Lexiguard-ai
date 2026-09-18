import http.server
import socketserver
import os
import sys
import webbrowser
import gzip

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        path = os.path.abspath(self.translate_path(self.path))
        # Directory traversal defense: ensure resolved path is strictly within DIRECTORY
        if not path.startswith(DIRECTORY):
            self.send_error(403, "Access Denied: Forbidden path traversal.")
            return

        if os.path.isfile(path):
            ext = os.path.splitext(path)[1].lower()
            accept_encoding = self.headers.get('Accept-Encoding', '').lower()
            if ext in ('.html', '.js', '.css', '.json', '.svg', '.md') and 'gzip' in accept_encoding:
                ctype = self.guess_type(path)
                try:
                    with open(path, 'rb') as f:
                        raw_bytes = f.read()
                    compressed = gzip.compress(raw_bytes, compresslevel=6)
                    self.send_response(200)
                    self.send_header('Content-Type', ctype)
                    self.send_header('Content-Length', str(len(compressed)))
                    self.send_header('Content-Encoding', 'gzip')
                    self.end_headers()
                    self.wfile.write(compressed)
                    return
                except Exception:
                    pass
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # Defense-in-Depth Security Headers
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://generativelanguage.googleapis.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';")
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
        self.send_header('X-Permitted-Cross-Domain-Policies', 'none')
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
