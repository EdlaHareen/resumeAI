#!/usr/bin/env python3
import os
import subprocess
import sys
import shutil

def print_banner():
    print("\n" + "="*50)
    print("   ResumeAI Universal Setup Wizard")
    print("="*50 + "\n")

def check_requirement(cmd, name):
    print(f"Checking for {name}...")
    if shutil.which(cmd):
        print(f"  [OK] found {name}")
        return True
    else:
        print(f"  [MISSING] {name} not found in PATH.")
        return False

def setup_env():
    if os.path.exists(".env"):
        print("\n[SKIP] .env file already exists.")
        return

    print("\n[CONFIG] Creating .env file. Please provide your Supabase and API credentials.")
    print("You can find these in your Supabase project settings and Anthropic dashboard.\n")

    url = input("VITE_SUPABASE_URL: ").strip()
    anon_key = input("VITE_SUPABASE_ANON_KEY: ").strip()
    service_key = input("SUPABASE_SERVICE_ROLE_KEY: ").strip()
    anthropic = input("ANTHROPIC_API_KEY: ").strip()

    with open(".env", "w") as f:
        f.write(f"VITE_SUPABASE_URL={url}\n")
        f.write(f"VITE_SUPABASE_ANON_KEY={anon_key}\n")
        f.write(f"SUPABASE_SERVICE_ROLE_KEY={service_key}\n")
        f.write(f"ANTHROPIC_API_KEY={anthropic}\n")
        f.write("ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173\n")
    
    print("\n[OK] .env file created successfully.")

def setup_backend():
    print("\n[SETUP] Setting up backend...")
    os.chdir("backend")
    
    # Create venv
    if not os.path.exists("venv"):
        print("  Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Install deps
    print("  Installing backend dependencies...")
    pip_cmd = os.path.join("venv", "bin" if os.name != "nt" else "Scripts", "pip")
    subprocess.run([pip_cmd, "install", "-r", "requirements.txt"])
    
    os.chdir("..")
    print("[OK] Backend setup complete.")

def setup_frontend():
    print("\n[SETUP] Setting up frontend...")
    os.chdir("frontend")
    
    print("  Installing frontend dependencies (npm install)...")
    subprocess.run(["npm", "install"])
    
    os.chdir("..")
    print("[OK] Frontend setup complete.")

def main():
    print_banner()
    
    py_ok = check_requirement("python3", "Python 3")
    node_ok = check_requirement("npm", "Node.js (npm)")
    docker_ok = check_requirement("docker", "Docker")

    if not py_ok:
        print("\nERROR: Python 3 is required to run this script and the backend.")
        sys.exit(1)

    setup_env()

    print("\n" + "-"*30)
    print("How would you like to run the project?")
    print("1) Docker (Recommended - ensures everything works perfectly)")
    print("2) Standard local run (Requires manual start of backend & frontend)")
    print("-"*30)
    
    choice = input("Enter choice (1/2): ").strip()

    if choice == "1":
        if not docker_ok:
            print("\nERROR: Docker is not installed. Please install Docker or choose option 2.")
            return
        print("\n[RUN] Starting Docker Compose...")
        print("Command: docker-compose up --build")
        try:
            subprocess.run(["docker-compose", "up", "--build"])
        except KeyboardInterrupt:
            print("\nShutting down...")
    else:
        setup_backend()
        setup_frontend()
        print("\n" + "="*50)
        print("   Setup Complete!")
        print("="*50)
        print("\nTo start the project locally, run these in two terminals:")
        print("\nTerminal 1 (Backend):")
        print("  cd backend && PYTHONPATH=. venv/bin/python -m uvicorn main:app --reload")
        print("\nTerminal 2 (Frontend):")
        print("  cd frontend && npm run dev")
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()
