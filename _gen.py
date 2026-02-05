import os

D = "C:/Users/Apgar/Dev/ramp/server/src/providers"

def w(name, content):
    with open(os.path.join(D, name), "w", newline=chr(10)) as f:
        f.write(content)
    print(f"Written {name}: {len(content)} bytes")

BT = chr(96)
DL = chr(36)
BS = chr(92)
DQ = chr(34)

# Will add file content generation next
print("Gen script loaded")
# ---- anthropic.ts ----
def gen_anthropic():
    L = []
    L.append("import Anthropic from " + chr(39) + "@anthropic-ai/sdk" + chr(39) + ";")
    L.append("import type { Expense, ExtractionResult, TaskType } from " + chr(39) + "@ramp/shared" + chr(39) + ";")
    L.append("import { config } from " + chr(39) + "../config" + chr(39) + ";")
    L.append("import { AIProvider, type AnomalyExplanation, type ComplianceEvaluation } from " + chr(39) + "./base" + chr(39) + ";")
    L.append("")
    return chr(10).join(L)

print(gen_anthropic()[:50])