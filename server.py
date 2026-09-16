from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import sys

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8085
    server = ThreadingHTTPServer(('127.0.0.1', port), CustomHandler)
    print(f'Multi-threaded server running on http://127.0.0.1:{port}')
    server.serve_forever()
