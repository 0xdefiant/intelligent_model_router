
import os

D = r'C:\Users\Apgar\Dev\ramp\server\src\providers'
BT = chr(96)
DS = chr(36)

def t(s):
    return BT + s + BT

def v(name):
    return DS + '{' + name + '}'

extraction_prompt = (
    'You are an expense data extraction assistant. Extract structured expense data from the following input.\n'
    'Return ONLY valid JSON with this exact shape:\n'
    '{\n'
    '  "expenses": [{ "vendor": "...", "amount": 0, "currency": "USD", "category": "...", "description": "...", "date": "...", "lineItems": [] }],\n'
    '  "confidence": 0.95\n'
    '}\n'
    'Do not include any text outside the JSON object.'
)

anomaly_prompt = (
    'You are an expense anomaly detection assistant. Analyze the given expense in the context of historical expenses and identify any anomalies.\n'
    'Return ONLY valid JSON with this exact shape:\n'
    '{\n'
    '  "explanation": "...",\n'
    '  "confidence": 0.0\n'
    '}\n'
    'Do not include any text outside the JSON object.'
)

policy_prompt = (
    'You are an expense policy compliance evaluator. Evaluate the given expense against the provided policy.\n'
    'Return ONLY valid JSON with this exact shape:\n'
    '{\n'
    '  "status": "pass" | "fail" | "warning",\n'
    '  "rulesEvaluated": [{ "ruleId": "...", "ruleName": "...", "passed": true, "reason": "..." }],\n'
    '  "summary": "..."\n'
    '}\n'
    'Do not include any text outside the JSON object.'
)

print('Script loaded, writing files...')
