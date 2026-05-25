#!/usr/bin/env python3
from wsgi import app

rules = sorted(r.rule for r in app.url_map.iter_rules() if "auth" in r.rule.lower())
for rule in rules:
    print(rule)
