"""
Render tests for templates/template-scorecard.html.

Verifies the "templates, not modes" behaviour on the server-side (Jinja) render:
a rugby card can still render bowlers / a stat column when that data is present,
and custom falls back to neutral headings when its labels are left blank.

Run with:  pytest server/liveblog/themes/themes_assets/default/py-test/test_scorecard_template.py
"""
import os
import jinja2

ROOT_DIR = os.path.realpath(os.path.join(os.path.dirname(__file__), ".."))
TEMPLATE_DIR = os.path.join(ROOT_DIR, "templates")


def render(data):
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(TEMPLATE_DIR))
    template = env.get_template("template-scorecard.html")
    return template.render({"ref": {"item": {"meta": {"data": data}}}})


def test_rugby_template_is_not_locked():
    html = render(
        {
            "home": {
                "name": "Bulls",
                "score": "24",
                "scorers": [{"name": "Pollard", "time": "40", "stat": "3"}],
                "bowlers": [{"name": "Smith", "figures": "MOTM"}],
            },
            "away": {"name": "Sharks", "score": "17"},
            "match": {"variant": "rugby"},
        }
    )
    assert 'lb-scorecard-card__scorer-stat">3</span>' in html
    assert "scorers-panel--bowlers" in html
    assert "Smith" in html


def test_plain_rugby_stays_clean():
    html = render(
        {
            "home": {"name": "Bulls", "score": "24", "scorers": [{"name": "Pollard", "time": "40"}]},
            "away": {"name": "Sharks", "score": "17"},
            "match": {"variant": "rugby"},
        }
    )
    assert "40&#39;" in html or "40'" in html  # minute suffix
    assert "lb-scorecard-card__scorer-stat" not in html
    assert "scorers-panel--bowlers" not in html


def test_custom_blank_labels_fall_back():
    html = render(
        {
            "home": {"name": "A", "score": "1", "scorers": [{"name": "Player", "stat": "9"}]},
            "away": {"name": "B", "score": "2"},
            "match": {"variant": "custom", "scorers_label": "", "bowlers_label": ""},
        }
    )
    assert "Spelers" in html


if __name__ == "__main__":
    import sys

    failures = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("  ok -", name)
            except AssertionError as exc:
                failures += 1
                print("  FAIL -", name, "->", exc)
    print("\n{} passed, {} failed".format(3 - failures, failures))
    sys.exit(1 if failures else 0)
