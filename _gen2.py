import os
D = "C:/Users/Apgar/Dev/ramp/server/src/providers"
def w(n, c):
    with open(os.path.join(D, n), "w", newline=chr(10)) as f:
        f.write(c)
    print(f"Written {n}: {len(c)} chars")

import base64
test = base64.b64decode("aGVsbG8gd29ybGQ=").decode()
print(test)
