// Real LLM API integration calling the FastAPI backend

const API_URL = "http://localhost:8000/generate";

export const generateContract = async (prompt) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to generate contract");
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Perform vulnerability checks on the AI-generated code
    const warnings = checkVulnerabilities(data.code || "");
    
    return { 
      code: data.code, 
      warnings: warnings 
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const checkVulnerabilities = (code) => {
  const warnings = [];
  if (!code) return warnings;
  
  // Basic Regex checks (client-side safety layer)
  if (code.includes('.call{value:')) {
    if (!code.includes('nonReentrant') && !code.includes('ReentrancyGuard')) {
      warnings.push("Potential Reentrancy vulnerability detected. Consider using OpenZeppelin's ReentrancyGuard.");
    }
  }
  
  if (code.includes('tx.origin')) {
    warnings.push("Using tx.origin for authorization is insecure. Use msg.sender instead.");
  }
  
  if (code.includes('suicide(') || code.includes('selfdestruct(')) {
    warnings.push("Selfdestruct is deprecated and dangerous. Consider an upgradeable architecture instead.");
  }
  
  if (code.match(/0x[a-fA-F0-9]{40}/)) {
    warnings.push("Hardcoded addresses detected. Use constructor parameters or setters for flexibility.");
  }

  return warnings;
};
