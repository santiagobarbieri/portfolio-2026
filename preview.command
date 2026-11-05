#!/usr/bin/env python3
"""Serve this buildless ES-module site locally. Double-click on macOS to preview."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import webbrowser

parser = argparse.ArgumentParser(description="Vista local del portfolio")
parser.add_argument("--port", type=int, default=4173)
parser.add_argument("--no-open", action="store_true")
args = parser.parse_args()
root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
try:
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
except OSError:
    print(f"El puerto {args.port} está ocupado. Usá --port 4174 o la vista que ya está abierta.")
    raise SystemExit(1)
url = f"http://127.0.0.1:{args.port}/"
print(f"Portfolio: {url}\nMantené esta ventana abierta. Control+C para cerrar.", flush=True)
if not args.no_open:
    webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
