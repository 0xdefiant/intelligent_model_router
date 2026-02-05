import sys, base64, os
data = sys.stdin.read().strip()
decoded = base64.b64decode(data).decode("utf-8")
outpath = sys.argv[1]
with open(outpath, "w", newline=chr(10)) as f:
    f.write(decoded)
print(f"Written: {outpath}")
