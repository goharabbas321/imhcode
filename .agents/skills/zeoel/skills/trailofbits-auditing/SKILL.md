---
name: trailofbits-auditing
description: "Smart contract auditing and secure cryptography implementation skill. Covers Solidity reentrancy, access control, cryptographic key management, and zero-knowledge heuristics."
---

# /trailofbits-auditing — Smart Contract & Cryptography Audits

**Trailofbits-Auditing** implements highly rigorous static analysis, cryptographic verification, and smart contract auditing practices.

---

## 🔐 Audit Domains

### 1. Smart Contract Auditing (Solidity/Rust)
- **Reentrancy Guards**: Verify use of the Checks-Effects-Interactions pattern and `nonReentrant` modifiers.
- **Access Control**: Audit ownership parameters (`Ownable`, `AccessControl`). Ensure no public setters lack guards.
- **Gas Optimization**: Detect gas-sinks, unnecessary storage writes, and unoptimized loops.
- **Math Overflow**: Enforce Solidity 0.8+ checked arithmetic or SafeMath libraries where applicable.

### 2. Cryptographic Key Management & Verification
- **Entropy & Randomness**: Prevent using chain variables (e.g., `block.timestamp`) for randomness; enforce Chainlink VRF.
- **Encryption Standards**: Check that AES-GCM or ChaCha20-Poly1305 are used for symmetric encryption, and Argon2id for password hashing.
- **Signatures**: Enforce ERC-20 EIP-712 typed signature verifications and prevent replay attacks.

---

## 🚫 Audit Red Flags
- **Access Flaws**: Internal functions exposed as external/public.
- **State Coupling**: State variables updated *after* transferring ether/tokens.
- **Roll-Your-Own Crypto**: Always reject custom cryptographic implementations. Enforce OpenZeppelin and standard libraries.
