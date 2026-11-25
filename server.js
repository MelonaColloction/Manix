"""
MANIX AI — backend محلی
راه‌اندازی:
  python -m pip install -r requirements.txt
  ollama pull qwen2.5-coder:7b
  python server.py
سپس http://127.0.0.1:8000 را باز کن.
این برنامه API خارجی استفاده نمی‌کند؛ به Ollama روی همین دستگاه متصل می‌شود.
"""
from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
import json, os, re, requests

BASE = Path(__file__).resolve().parent
WORKSPACE = BASE / "workspace"
WORKSPACE.mkdir(exist_ok=True)
CONFIG = BASE / "manix_config.json"
DEFAULTS = {"ollama_url": "http://127.0.0.1:11434", "model": "qwen2.5-coder:7b"}
SYSTEM_PROMPT = """You are MANIX, a senior software engineer and autonomous coding assistant.
Respond in the user's language (Persian when the user writes Persian).
You can design and implement complete web apps, APIs, databases, backend systems, tests, and explain code.
Be accurate. Never claim you ran code or inspected files unless you actually did through available context.
When asked to build a project, give a coherent implementation, explain filenames, dependencies, and run commands.
Prefer secure defaults, input validation, parameterized SQL, password hashing (Argon2id/bcrypt), environment variables for secrets, and never hardcode credentials.
If the user asks for code, provide complete code blocks with filenames. Do not omit essential parts or use unexplained placeholders.
If the user asks to debug, request the error and relevant code if absent. Identify assumptions explicitly.
You run locally through Ollama. You cannot access the internet or execute arbitrary code from this chat.
"""
def load_config():
    try:
        data = json.loads(CONFIG.read_text(encoding="utf-8"))
        return {**DEFAULTS, **data}
    except Exception:
        return DEFAULTS.copy()
def save_config(data):
    CONFIG.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

@app.get("/")
def index():
    return send_from_directory(BASE, "index.html")

@app.get("/api/settings")
def settings_get():
    return jsonify(load_config())

@app.post("/api/settings")
def settings_post():
    data = request.get_json(force=True)
    old = load_config()
    url = str(data.get("ollama_url", old["ollama_url"])).strip().rstrip("/")
    model = str(data.get("model", old["model"])).strip()
    if not re.match(r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$", url):
        return jsonify(error="برای حفظ حریم خصوصی، آدرس Ollama باید localhost باشد."), 400
    if not model or len(model) > 100:
        return jsonify(error="نام مدل معتبر نیست."), 400
    cfg = {"ollama_url": url, "model": model}
    save_config(cfg)
    return jsonify(ok=True)

@app.get("/api/status")
def status():
    cfg = load_config()
    base = request.args.get("base", cfg["ollama_url"]).rstrip("/")
    model = request.args.get("model", cfg["model"])
    if not re.match(r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$", base):
        return jsonify(error="فقط آدرس محلی localhost مجاز است."), 400
    try:
        r = requests.get(base + "/api/tags", timeout=3)
        r.raise_for_status()
        names = [x.get("name", "") for x in r.json().get("models", [])]
        exists = any(n == model or n.split(":")[0] == model.split(":")[0] for n in names)
        return jsonify(ready=exists, model=model,
                       message=("اتصال برقرار است و مدل نصب شده." if exists else "Ollama روشن است، اما این مدل نصب نیست. دستور ollama pull را اجرا کن."),
                       installed=names)
    except requests.RequestException as e:
        return jsonify(ready=False, model=model, message="Ollama در دسترس نیست. ابتدا برنامه Ollama را اجرا کن.")

@app.post("/api/chat")
def chat():
    data = request.get_json(force=True)
    message = str(data.get("message", "")).strip()
    if not message:
        return jsonify(error="پیام خالی است."), 400
    if len(message) > 30000:
        return jsonify(error="پیام بیش از حد طولانی است."), 413
    cfg = load_config()
    payload = {
        "model": cfg["model"],
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ],
        "stream": False,
        "options": {"temperature": 0.25, "num_ctx": 8192}
    }
    try:
        r = requests.post(cfg["ollama_url"] + "/api/chat", json=payload, timeout=600)
        if r.status_code == 404:
            return jsonify(error="مدل پیدا نشد. نام مدل را بررسی و با ollama pull دریافت کن."), 503
        r.raise_for_status()
        answer = r.json().get("message", {}).get("content", "").strip()
        if not answer:
            return jsonify(error="مدل پاسخ خالی برگرداند."), 502
        return jsonify(response=answer, model=cfg["model"])
    except requests.Timeout:
        return jsonify(error="مدل بیش از حد زمان برد. مدل سبک‌تری انتخاب کن یا دوباره تلاش کن."), 504
    except requests.ConnectionError:
        return jsonify(error="اتصال به Ollama برقرار نشد. آیا Ollama اجراست؟"), 503
    except requests.RequestException as e:
        return jsonify(error="خطا در ارتباط با Ollama: " + str(e)[:300]), 502

def safe_path(name):
    name = str(name or "").replace("\\", "/").strip()
    p = Path(name)
    if not name or p.is_absolute() or ".." in p.parts or len(name) > 180:
        raise ValueError("نام یا مسیر فایل نامعتبر است.")
    target = (WORKSPACE / p).resolve()
    if WORKSPACE.resolve() not in target.parents:
        raise ValueError("دسترسی به خارج از workspace مجاز نیست.")
    return target

@app.get("/api/files")
def files_list():
    files = [p.relative_to(WORKSPACE).as_posix() for p in WORKSPACE.rglob("*") if p.is_file()]
    return jsonify(files=sorted(files))

@app.get("/api/file")
def file_get():
    try:
        p = safe_path(request.args.get("name"))
        if not p.is_file():
            return jsonify(error="فایل پیدا نشد."), 404
        if p.stat().st_size > 2_000_000:
            return jsonify(error="فایل برای نمایش بیش از حد بزرگ است."), 413
        return jsonify(name=p.name, content=p.read_text(encoding="utf-8"))
    except (ValueError, UnicodeDecodeError) as e:
        return jsonify(error=str(e)), 400

@app.post("/api/file")
def file_save():
    data = request.get_json(force=True)
    try:
        p = safe_path(data.get("name"))
        content = str(data.get("content", ""))
        if len(content.encode("utf-8")) > 2_000_000:
            return jsonify(error="فایل بیش از حد بزرگ است."), 413
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return jsonify(ok=True, name=p.relative_to(WORKSPACE).as_posix())
    except ValueError as e:
        return jsonify(error=str(e)), 400

@app.delete("/api/file")
def file_delete():
    try:
        p = safe_path(request.args.get("name"))
        if not p.is_file():
            return jsonify(error="فایل پیدا نشد."), 404
        p.unlink()
        return jsonify(ok=True)
    except ValueError as e:
        return jsonify(error=str(e)), 400

if __name__ == "__main__":
    print("\\nMANIX AI is running at http://127.0.0.1:8000")
    print("Make sure Ollama is running and the selected model is installed.\\n")
    app.run(host="127.0.0.1", port=8000, debug=False)
