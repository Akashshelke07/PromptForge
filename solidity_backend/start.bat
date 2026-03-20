@echo off
echo Starting Solidity AI Backend...
call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --port 8000
