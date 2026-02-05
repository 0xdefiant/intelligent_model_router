import os

base_dir = "C:/Users/Apgar/Dev/ramp/server/src/providers"

# ---- anthropic.ts ----
with open(os.path.join(base_dir, "anthropic.ts"), "w", newline="
") as f:
    f.write(open(os.path.join(base_dir, "_anthro_content.txt")).read())
    print("anthropic.ts written")