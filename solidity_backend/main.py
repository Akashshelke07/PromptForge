import os
import logging
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
from huggingface_hub import login

# Login with HF token from environment variable (set via: set HF_TOKEN=hf_...)
_hf_token = os.environ.get("HF_TOKEN")
if _hf_token:
    login(token=_hf_token)
    logging.getLogger(__name__).info("Logged in to HuggingFace Hub.")
else:
    logging.getLogger(__name__).warning("HF_TOKEN not set — may fail on gated models.")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Solidity Generator API")

# Enable CORS for the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
# Must match adapter's training base — unsloth 4-bit quantized Llama 3.2 1B
BASE_MODEL_ID = "unsloth/Llama-3.2-1B-Instruct-bnb-4bit"
# Local path to your fine-tuned LoRA adapter
ADAPTER_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "solidity_llm_1b"))

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# Use float16 on GPU for speed, float32 on CPU for compatibility
DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32

logger.info(f"Running on device: {DEVICE} | dtype: {DTYPE}")

# --- Global model/tokenizer ---
model = None
tokenizer = None


@app.on_event("startup")
async def load_model():
    global model, tokenizer
    try:
        logger.info(f"Loading tokenizer from {BASE_MODEL_ID}...")
        tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        logger.info(f"Loading base model ({BASE_MODEL_ID}) on {DEVICE}...")
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            device_map="auto",
            torch_dtype=DTYPE,
            # No load_in_4bit — fully compatible with CPU and GPU
        )

        logger.info(f"Applying LoRA adapter from: {ADAPTER_PATH}")
        model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
        model.eval()

        logger.info("✅ Model and adapter loaded successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise RuntimeError(f"Could not load model. Reason: {e}")


class GenerateRequest(BaseModel):
    prompt: str


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "device": DEVICE,
        "cuda_available": torch.cuda.is_available(),
    }


@app.post("/generate")
async def generate_code(request: GenerateRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet.")

    try:
        logger.info(f"Generating for prompt: {request.prompt[:60]}...")

        # --- Strong system prompt ---
        system_prompt = (
            "You are a senior Solidity developer with 10 years experience.\n"
            "You ONLY write secure, audited-style code.\n"
            "Strict rules:\n"
            "- Use pragma solidity ^0.8.20;\n"
            "- Import ONLY from @openzeppelin/contracts/... (never wrong paths)\n"
            "- Use ERC20, Ownable, ReentrancyGuard, Pausable when needed\n"
            "- Follow Checks-Effects-Interactions pattern ALWAYS\n"
            "- Use custom errors (error ZeroAmount();)\n"
            "- No tx.origin, no selfdestruct unless explicitly asked\n"
            "- Add events for all state changes\n"
            "- No inline assembly unless necessary\n"
            "- Return ONLY the full Solidity code — no markdown, no explanations, no ```solidity\n"
            "- Ensure the code is syntactically correct and NOT truncated.\n"
            "- Use SPDX-License-Identifier: MIT at top\n\n"
            "Examples:\n"
            "User: Create ERC20 token\n"
            "Output:\n"
            "// SPDX-License-Identifier: MIT\n"
            "pragma solidity ^0.8.20;\n"
            'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n'
            "contract MyToken is ERC20 {\n"
            '    constructor() ERC20("MyToken", "MTK") {\n'
            "        _mint(msg.sender, 1000000 * 10**18);\n"
            "    }\n"
            "}\n"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.prompt}
        ]


        inputs = tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        ).to(DEVICE)

        attention_mask = (inputs != tokenizer.pad_token_id).long()

        # --- Tuned generation parameters ---
        with torch.no_grad():
            outputs = model.generate(
                input_ids=inputs,
                attention_mask=attention_mask,
                max_new_tokens=768,
                temperature=0.55,
                do_sample=True,
                top_p=0.85,
                repetition_penalty=1.15,
                use_cache=True,
                pad_token_id=tokenizer.eos_token_id,
            )

        generated_text = tokenizer.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True).strip()

        # --- Post-processing cleanup ---
        # Remove common junk tiny models add
        if "### Response:" in generated_text:
            generated_text = generated_text.split("### Response:")[-1].strip()

        # Clean markdown fences
        for tag in ["```solidity", "```"]:
            if generated_text.startswith(tag):
                generated_text = generated_text.replace(tag, "", 1)
        if generated_text.endswith("```"):
            generated_text = generated_text.rsplit("```", 1)[0]

        generated_text = generated_text.strip()

        # --- Security warnings ---
        warnings = []
        if "tx.origin" in generated_text:
            warnings.append("tx.origin detected — high security risk, use msg.sender instead.")
        if "selfdestruct" in generated_text and "onlyOwner" not in generated_text:
            warnings.append("selfdestruct without access control — dangerous.")
        if ".call{value:" in generated_text and "nonReentrant" not in generated_text:
            warnings.append("Potential reentrancy — consider using ReentrancyGuard.")

        return {"code": generated_text, "error": None, "warnings": warnings}

    except Exception as e:
        logger.error(f"Generation error: {e}")
        return {"code": None, "error": str(e), "warnings": []}

