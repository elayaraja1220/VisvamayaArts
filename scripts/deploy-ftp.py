"""Back up and deploy the static build (out/) to Hostinger over FTPS.

Optional helper — uploading out/ through hPanel File Manager works too.
It protects the files on the server that must never be overwritten
(see PROTECTED below) and always backs up before uploading.

Requirements: Python 3.9+ (standard library only).

Credentials come from environment variables, never from this file:
  FTP_USER      e.g. u306782036.deploy   (hPanel > Files > FTP Accounts)
  FTP_PASSWORD
  FTP_HOST      optional, default 217.21.91.37 (the FTP IP shown in hPanel)
  FTP_CERT_NAME optional, default ftp.hstgr.io

Hostinger's FTPS certificate is issued for *.hstgr.io, so the script connects
to the IP but verifies the certificate against FTP_CERT_NAME. Certificate
checking stays ON.

The FTP account's home folder must be public_html.

Usage (from the project root, after `npm run build`):
  python scripts/deploy-ftp.py backup              # download public_html (except admin/)
  python scripts/deploy-ftp.py upload --dry        # list what would be uploaded
  python scripts/deploy-ftp.py upload              # backup first, then upload out/
"""

import datetime
import ftplib
import os
import ssl
import sys
import time

HOST = os.environ.get("FTP_HOST", "217.21.91.37")
CERT_NAME = os.environ.get("FTP_CERT_NAME", "ftp.hstgr.io")
OUT_DIR = "out"

# Never uploaded over, and never backed up/touched:
PROTECTED_TOP = {"admin"}  # PHP CodeIgniter backend + API
# Server files the build must NOT overwrite:
PROTECTED_FILES = {"index.html"}  # "Under Construction" page (see README)


class Conn:
    """FTPS connection that reconnects and retries (Hostinger drops connections)."""

    def __init__(self):
        self.ftp = None

    def _open(self):
        user = os.environ.get("FTP_USER")
        password = os.environ.get("FTP_PASSWORD")
        if not user or not password:
            sys.exit("Set FTP_USER and FTP_PASSWORD environment variables first.")
        f = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=60)
        f.connect(HOST, 21)
        f.host = CERT_NAME  # used for TLS hostname verification
        f.login(user, password)
        f.prot_p()
        self.ftp = f

    def run(self, fn, what):
        for attempt in range(1, 6):
            try:
                if self.ftp is None:
                    self._open()
                return fn(self.ftp)
            except (EOFError, OSError, ftplib.error_temp) as e:
                print(f"  retry {attempt} ({what}): {type(e).__name__}", flush=True)
                try:
                    self.ftp.close()
                except Exception:
                    pass
                self.ftp = None
                time.sleep(2 * attempt)
        raise RuntimeError(f"gave up: {what}")

    def close(self):
        if self.ftp:
            try:
                self.ftp.quit()
            except Exception:
                pass


def listdir(c, path):
    return c.run(
        lambda f: [(n, x.get("type")) for n, x in f.mlsd(path or ".") if n not in (".", "..")],
        f"list {path or '/'}",
    )


def walk(c, path=""):
    for name, kind in listdir(c, path):
        if not path and name in PROTECTED_TOP:
            continue
        rel = f"{path}/{name}" if path else name
        if kind == "dir":
            yield rel, "dir"
            yield from walk(c, rel)
        elif kind == "file":
            yield rel, "file"


def backup():
    stamp = datetime.datetime.now().strftime("%Y-%m-%d_%H%M")
    local = os.path.join("..", f"hostinger-backup-{stamp}", "public_html")
    c = Conn()
    entries = list(walk(c))
    files = 0
    for rel, kind in entries:
        target = os.path.join(local, *rel.split("/"))
        if kind == "dir":
            os.makedirs(target, exist_ok=True)
            continue
        os.makedirs(os.path.dirname(target), exist_ok=True)

        def get(f, rel=rel, target=target):
            with open(target, "wb") as fh:
                f.retrbinary(f"RETR {rel}", fh.write)

        c.run(get, f"get {rel}")
        files += 1
    c.close()
    print(f"Backup done: {files} files -> {os.path.abspath(local)}")


def upload(dry):
    if not os.path.isfile(os.path.join(OUT_DIR, "products", "__fallback", "index.html")):
        sys.exit("out/ not found or incomplete. Run `npm run build` first.")
    if not os.path.isfile(os.path.join(OUT_DIR, ".htaccess")):
        sys.exit("out/.htaccess missing — product pages would 404. Check public/.htaccess.")

    todo = []
    for root, _dirs, names in os.walk(OUT_DIR):
        rr = os.path.relpath(root, OUT_DIR).replace("\\", "/")
        rr = "" if rr == "." else rr
        for n in sorted(names):
            rel = f"{rr}/{n}" if rr else n
            if rel in PROTECTED_FILES or rel.split("/")[0] in PROTECTED_TOP:
                continue
            todo.append((rel, os.path.join(root, n)))

    print(f"{len(todo)} files to upload (skipping {', '.join(sorted(PROTECTED_FILES))})")
    if dry:
        for rel, _ in todo:
            print("  ", rel)
        return

    backup()

    c = Conn()
    made = set()
    for i, (rel, src) in enumerate(todo, 1):
        parts = rel.split("/")[:-1]
        for k in range(1, len(parts) + 1):
            d = "/".join(parts[:k])
            if d in made:
                continue

            def mk(f, d=d):
                try:
                    f.mkd(d)
                except ftplib.error_perm:
                    pass  # already exists

            c.run(mk, f"mkdir {d}")
            made.add(d)

        def put(f, rel=rel, src=src):
            with open(src, "rb") as fh:
                f.storbinary(f"STOR {rel}", fh)

        c.run(put, f"put {rel}")
        if i % 50 == 0:
            print(f"  {i}/{len(todo)}", flush=True)
    c.close()
    print(f"Uploaded {len(todo)} files. Purge the CDN cache in hPanel, then test the site.")


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in {"backup", "upload"}:
        sys.exit(__doc__)
    if sys.argv[1] == "backup":
        backup()
    else:
        upload("--dry" in sys.argv)
