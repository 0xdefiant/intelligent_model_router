import os

D = "C:/Users/Apgar/Dev/ramp/server/src/providers"

def wf(name, lines):
    p = os.path.join(D, name)
    with open(p, "w", newline=chr(10)) as out:
        out.write(chr(10).join(lines) + chr(10))
    print(f"Written {name}")

BT = chr(96)
DQ = chr(34)
DL = chr(36)
SQ = chr(39)
BS = chr(92)

