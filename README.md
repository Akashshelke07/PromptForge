# Solidity AI Backend

## What is this project & What problem does it solve?

Writing secure and efficient Solidity smart contracts requires specialized knowledge and can be highly time-consuming. This project provides a **GenAI-powered, local code-generation backend** specifically fine-tuned for building Solidity smart contracts. 

By leveraging a highly optimized, quantized small language model (`unsloth/Llama-3.2-1B-Instruct-bnb-4bit`), this backend allows developers to rapidly generate secure Solidity code from natural language prompts **completely locally**. This solves the problem of relying on expensive, cloud-hosted AI APIs, ensuring your proprietary ideas strictly maintain **data privacy**, experience **low-latency inference**, and incur **zero API costs**. It seamlessly translates natural language descriptions into deployable smart contracts, making Web3 development drastically more accessible while running effortlessly on consumer-grade hardware.

## Tech Stack & Fine-Tuned Agent Integration

This backend leverages state-of-the-art Web3 AI tooling strictly hosted on local hardware:
- **FastAPI & Uvicorn**: A lightning-fast ASGI framework and server handling the API requests that bridge the frontend platform to the LLM agent.
- **PyTorch & HuggingFace Transformers**: The foundational ML frameworks for executing deep learning inferences via the device's GPU (CUDA enabled).
- **Unsloth**: A powerful optimization library utilized alongside BitsAndBytes (BNB) 4-bit quantization. This drastically minimizes the model's VRAM requirements, achieving much higher token/sec generation speeds on smaller consumer GPUs.
- **PEFT (LoRA)**: Parameter-Efficient Fine-Tuning framework. We load our uniquely trained **Solidity LoRA Adapters** over the underlying Base LLM natively.
- **Agent Base Model**: `unsloth/Llama-3.2-1B-Instruct-bnb-4bit` (A heavily compressed, robust instructions-following model).

**How the AI Agent works:**
When the backend receives a description, the prompt is injected into our custom **Fine-Tuned LoRA Agent**, which has been trained solely on Solidity smart contract design, Web3 semantics, modern OpenZeppelin frameworks, and blockchain security standards. Because the agent's parameters are natively fused via PEFT, the output bypasses general Llama chat habits and instantly commits to generating production-ready smart contract code.

---

## Setup

1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Server**:
   We recommend using the provided `start.bat` script on Windows to automatically activate the environment and start the server correctly:
   ```bash
   .\start.bat
   ```
   Or manually via the python module:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

## API

- `GET /health`: Check if model is loaded.
- `POST /generate`: Send `{"prompt": "Describe your contract"}` to get Solidity code.

## Troubleshooting

### `ModuleNotFoundError: No module named 'peft'`
**The Problem:**
When starting the backend with `uvicorn main:app --reload`, you may encounter an error where it fails to find dependencies (like `peft`) that are already installed in your virtual environment. The reason for this is that Uvicorn's `--reload` feature spawns a new subprocess. If you call `uvicorn` directly, Windows may default to your global Python environment, causing the new subprocess to also execute from the global Python path (where dependencies aren't installed).

**The Solution / Proper Implementation:**
To guarantee that Uvicorn strictly utilizes your local virtual environment for both the main process and its subprocesses, always execute it using the Python module syntax:
```bash
python -m uvicorn main:app --reload --port 8000
```
This ensures the active `python` executable (from your current `venv`) orchestrates the background reloading. 

Alternatively, use the provided `start.bat` script on Windows, which automatically guarantees the correct environment activation.
