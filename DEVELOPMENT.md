# Developer Guide & Best Practices

To ensure this project remains stable and compatible across different environments (including Python 3.9), follow these guidelines.

## 1. Python Compatibility (3.9+)

While modern Python (3.10+) supports the `|` union operator (e.g., `dict | None`), this project maintains compatibility with Python 3.9.

### ✅ Always Use `from __future__ import annotations`
Add this to the very top of every new `.py` file. It allows using 3.10+ type hinting syntax without runtime errors on older versions.

```python
from __future__ import annotations
import json
# ... rest of imports
```

### ✅ Prefer `typing` Module for Complex Types
If a file doesn't have the future import, use `Optional[dict]` instead of `dict | None`.

## 2. Environment Variables

- **Vite Prefix**: Variables used in the frontend MUST start with `VITE_` (e.g., `VITE_SUPABASE_URL`).
- **Backend Access**: The backend can read `VITE_` variables, but critical secrets (like `SUPABASE_SERVICE_ROLE_KEY`) must NOT have the `VITE_` prefix to prevent accidental exposure to the browser.
- **Fallbacks**: When adding new Supabase-related code in the backend, always use the fallback pattern:
  ```python
  _URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
  ```

## 3. Backend Routes & Imports

- **Run Command**: Always use `PYTHONPATH=. python3 -m uvicorn main:app`. This ensures that `api` and `utils` packages are found correctly.
- **JSON Imports**: Always verify that `import json` is present if you use `json.dumps()` or `json.loads()`.

## 4. Port Configuration

- **Vite Proxy**: If you change the backend port (default 8000), you must also update `frontend/vite.config.ts`.
- **Uvicorn**: Use `--port 8000` to match the default frontend configuration.

## 5. Deployment

- Use `build.sh` for production builds.
- Ensure `tectonic` (LaTeX engine) is available in the production environment for PDF generation.
