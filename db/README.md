# 🔐 At-Rest Data Encryption

This section demonstrates how to **implement and document at-rest protection** for sensitive database fields — specifically, encrypting phone request data.  
The implementation uses **AES-256-CBC symmetric encryption**, and the encryption key is securely stored using **Docker secrets**.

---

## 🎯 Objective

To ensure that sensitive data (e.g. requester phone numbers or identifiers) stored in the database remains unreadable if the database is compromised, while still allowing controlled decryption through the backend service.

At-rest protection means data is **encrypted before being written to disk** and **decrypted only when retrieved by authorized processes**.

---

## 🧩 Components Overview

- **Encryption Algorithm:** AES-256-CBC (256-bit key, 16-byte IV)  
- **Key Management:** Docker Secret (`enc_key.txt`)
- **Use Case:** Protecting `phone_requests` data at rest  
- **Node.js Module Used:** `crypto`  

---

## 🧠 How It Works

When a phone request is created, the sensitive field (e.g., `phone_number`) is encrypted before insertion into MySQL.  
Only the backend has access to the decryption key.  
Thus, even if the database is accessed directly, the stored content appears as ciphertext.

**Create an Encryption Key**
- Generate a 32-byte base64-encoded key (suitable for AES-256-CBC):
```bash
openssl rand -base64 32 > db/enc_key.txt
```

---

## 🔐 Key Rotation & Backup Policy
### 🔁 Key Rotation

- Regularly generate new encryption keys using openssl rand -base64 32.
- Maintain key versioning, e.g., `enc_key_v1`, `enc_key_v2`.
- Implement transitional re-encryption for existing rows (decrypt with old key, re-encrypt with new one).

### 💾 Backup

- Always store encryption keys securely and separately from database backups.
- Use tools like HashiCorp Vault, AWS KMS, or Docker Swarm Secrets for production.
- Periodically verify that backups are encrypted and recoverable.