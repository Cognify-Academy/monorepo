# 🧪 Soulbound Certificate NFT - Testing Guide

This guide walks you through testing the complete certificate issuance flow from start to finish.

## Prerequisites Checklist

Before you start testing, ensure you have:

- [ ] Solana CLI installed (`solana --version`)
- [ ] Anchor CLI installed (`anchor --version`)
- [ ] Bun installed (`bun --version`)
- [ ] A Solana wallet/keypair
- [ ] Access to Solana devnet

---

## Step 1: Set Up Solana Wallet

### Option A: Create New Keypair (Recommended for Testing)

```bash
# Create a new keypair for the issuer
solana-keygen new -o ~/.config/solana/cognify-issuer.json --no-bip39-passphrase

# Set as default
solana config set --keypair ~/.config/solana/cognify-issuer.json

# Get the public key
solana address

# Get the private key in base58 format (for .env)
cat ~/.config/solana/cognify-issuer.json | jq -r '.[0:32] | map(tostring) | join(",")'
```

### Option B: Use Existing Keypair

```bash
# If you already have a keypair
solana config get

# Get the keypair path and use it
```

### Convert Keypair to Base58

You'll need the base58 encoded private key for the `.env` file:

```bash
# Create a helper script
cat > /tmp/keypair_to_base58.js << 'EOF'
const fs = require('fs');
const bs58 = require('bs58');

const keypairPath = process.argv[2] || `${process.env.HOME}/.config/solana/id.json`;
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
const secretKey = Uint8Array.from(keypairData.slice(0, 64));
const base58Key = bs58.encode(secretKey);

console.log('\n🔑 Base58 Private Key (for SOLANA_PRIVATE_KEY):');
console.log(base58Key);
console.log('\n📋 Copy this to your .env file');
EOF

# Run it
node /tmp/keypair_to_base58.js ~/.config/solana/cognify-issuer.json
```

---

## Step 2: Configure Environment

### 2.1 Set Solana CLI to Devnet

```bash
solana config set --url devnet
solana config get
```

### 2.2 Fund Your Wallet

```bash
# Get your public key
solana address

# Request airdrop (2 SOL)
solana airdrop 2

# Check balance
solana balance

# If airdrop fails, try:
solana airdrop 1
solana airdrop 1
```

### 2.3 Create .env Files

**API (`apps/api/.env`):**

```bash
cd apps/api

cat > .env << 'EOF'
# Database (your existing config)
DATABASE_URL=postgresql://user:password@localhost:5432/cognify_academy
JWT_SECRET=your-jwt-secret-here

# Solana Configuration (for transaction verification only)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=<paste_base58_key_from_step_1>  # Only for signing VCs
PROGRAM_ID=GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm

# Optional: Use a faster RPC for production
# SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
EOF
```

**UI (`apps/cognify-ui/.env.local`):**

```bash
cd apps/cognify-ui

cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm
EOF
```

**Important**: `SOLANA_PRIVATE_KEY` in the API is only used for signing Verifiable Credentials (VCs), not for minting NFTs. The API wallet does NOT need SOL because students mint NFTs from their browser wallets.

---

## Step 3: Deploy Smart Contract to Devnet

```bash
cd /Users/roppa/devrepos/cognify.academy/blockchain/certificate_nft

# Build the program
anchor build

# Deploy to devnet
anchor deploy

# IMPORTANT: Copy the "Program Id" from the output
# It should match: GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm
# If it's different, update your .env file

# Check program deployment
solana program show <PROGRAM_ID>
```

### If Program ID Changed

If you get a different Program ID, you need to:

1. Update `Anchor.toml`:

```toml
[programs.localnet]
certificate_nft = "YOUR_NEW_PROGRAM_ID"
```

2. Update `declare_id!` in `programs/certificate_nft/src/lib.rs`:

```rust
declare_id!("YOUR_NEW_PROGRAM_ID");
```

3. Rebuild and redeploy:

```bash
anchor build
anchor deploy
```

4. Copy new IDL to API:

```bash
bun run copy-idl
```

5. Update `.env` with new Program ID

---

## Step 4: Prepare Test Data

### 4.1 Create Test Student

You'll need:

- A test user account in your database
- A test course
- An enrollment marked as completed
- A Solana wallet address for the student

```sql
-- Connect to your database
psql $DATABASE_URL

-- Create or use existing student
SELECT id, email FROM "User" WHERE email LIKE '%test%';

-- Create or use existing course
SELECT id, title FROM "Course" LIMIT 5;

-- Check enrollments
SELECT * FROM "Enrollment"
WHERE "userId" = '<student_id>'
AND "courseId" = '<course_id>';

-- Mark enrollment as completed
UPDATE "Enrollment"
SET completed = true
WHERE "userId" = '<student_id>'
AND "courseId" = '<course_id>';
```

### 4.2 Generate Student Wallet

For testing, create a temporary wallet for the student:

```bash
# Create student wallet
solana-keygen new -o /tmp/student-wallet.json --no-bip39-passphrase

# Get the public key
solana-keygen pubkey /tmp/student-wallet.json

# Copy this address - you'll need it for the API call
```

---

## Step 5: Start API Server

```bash
cd /Users/roppa/devrepos/cognify.academy/apps/api

# Install dependencies (if not done)
bun install

# Start the server
bun run dev

# Server should start on http://localhost:3000
# Check logs for any errors
```

---

## Step 6: Test Certificate Issuance

### 6.1 Start UI Server

```bash
cd apps/cognify-ui
bun install  # If not already done
bun run dev
```

UI should be running on `http://localhost:3001` (or 3000 if API is on different port)

### 6.2 Test in Browser (Recommended)

1. **Login to UI** at `http://localhost:3001`
2. **Navigate to "My Courses"**
3. **Find completed course**
4. **Connect wallet** (Phantom or Solflare)
5. **Click "Mint Certificate NFT (~$0.20)"**
6. **Approve transaction** in wallet (student pays ~$0.20)
7. **Wait for confirmation** - NFT is minted and certificate is stored

### 6.3 Test via API (Alternative)

If you need to test the API endpoint directly:

```bash
# 1. Login and get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "your_password"
  }'

# Copy the JWT token from response
export JWT_TOKEN="<your_jwt_token>"

# 2. Student must mint NFT first (from browser or manually)
# 3. Then call API with transaction signature

curl -X POST http://localhost:3000/certificates/issue \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user_id>",
    "courseId": "<course_id>",
    "studentDid": "did:example:student123",
    "studentWallet": "<student_wallet_address>",
    "txSignature": "<transaction_signature_from_student_minting>",
    "nftAddress": "<mint_address_from_nft>"
  }'
```

**Note**: The API endpoint verifies transactions that students have already minted. In normal flow, students mint through the UI, and the UI automatically calls this endpoint with the transaction signature.

### Expected Response

```json
{
  "success": true,
  "certificate": {
    "id": "cert-uuid",
    "userId": "user-uuid",
    "courseId": "course-uuid",
    "studentDid": "did:example:student123",
    "issuerDid": "did:sol:...",
    "vcJson": { ... },
    "vcHash": "hash...",
    "nftAddress": "MINT_ADDRESS",
    "createdAt": "2025-11-03T..."
  }
}
```

---

## Step 7: Verify Certificate NFT

### 7.1 Check On-Chain

```bash
# Check the NFT mint account
solana account <MINT_ADDRESS_FROM_RESPONSE>

# Check student's token account
spl-token accounts <STUDENT_WALLET_ADDRESS>

# You should see 1 token with the mint address
```

### 7.2 Verify Soulbound (Frozen)

```bash
# Get detailed token info
spl-token account-info <TOKEN_ACCOUNT_ADDRESS>

# Look for:
# State: Frozen ✓
# Owner: <STUDENT_WALLET>
# Amount: 1
```

### 7.3 Verify Metadata

Use Solana Explorer:

```
https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet
```

Or use Metaplex CLI:

```bash
# Install if needed
npm install -g @metaplex-foundation/js

# View metadata
metaplex nfts find-by-mint <MINT_ADDRESS> -u devnet
```

### 7.4 View in Wallet

Import the student wallet into Phantom or Solflare:

1. **Phantom Wallet**:
   - Settings → Add/Import Wallet → Import Private Key
   - Paste the private key from `/tmp/student-wallet.json`
   - Switch to Devnet (Settings → Developer Settings → Change Network)
   - View NFTs tab

2. **Solflare**:
   - Import Wallet → Private Key
   - Switch to Devnet
   - View Collectibles

You should see the certificate NFT with:

- Name: `[Course Title] - Certificate`
- Symbol: `COGCERT`
- Frozen status indicator

---

## Step 8: Test Verification Endpoint

```bash
# Get all certificates for student
curl -X GET http://localhost:3000/certificates/student/<USER_ID> \
  -H "Authorization: Bearer $JWT_TOKEN"

# Verify certificate by VC hash (public endpoint)
curl -X GET http://localhost:3000/certificates/verify/<VC_HASH>
```

---

## Step 9: Test Transfer Prevention

Try to transfer the NFT (should fail):

```bash
# This should fail with "frozen account" error
spl-token transfer <MINT_ADDRESS> 1 <ANOTHER_WALLET> \
  --from /tmp/student-wallet.json \
  --fee-payer ~/.config/solana/cognify-issuer.json

# Expected error:
# Error: Account is frozen
```

This confirms the certificate is truly soulbound! 🎉

---

## Troubleshooting

### Issue: "Account not found" or "Insufficient funds"

**Cause**: Student wallet has insufficient SOL (not API wallet)

**Fix**:

```bash
# Student needs to fund their wallet
# Use Solana faucet or wallet's built-in airdrop feature
# API wallet does NOT need SOL for minting
```

### Issue: "Transaction simulation failed"

**Cause**: Program not deployed or wrong Program ID

**Fix**:

```bash
# Check program exists
solana program show <PROGRAM_ID>

# Redeploy if needed
cd blockchain/certificate_nft
anchor deploy
```

### Issue: "Invalid signature" or "Transaction not found"

**Cause**: Transaction signature is invalid or transaction doesn't exist on-chain

**Fix**:

- Ensure student minted NFT before calling API endpoint
- Verify transaction exists on Solana Explorer
- Check that `txSignature` matches the actual transaction

### Issue: "Invalid SOLANA_PRIVATE_KEY"

**Cause**: Wrong private key format (for VC signing)

**Fix**:

- Ensure SOLANA_PRIVATE_KEY is base58 encoded
- Use the helper script from Step 1 to get correct format
- **Note**: This key is only for signing VCs, not for minting NFTs

### Issue: "Course not completed"

**Cause**: Enrollment not marked as completed

**Fix**:

```sql
UPDATE "Enrollment"
SET completed = true
WHERE "userId" = '<user_id>' AND "courseId" = '<course_id>';
```

### Issue: "RPC timeout"

**Cause**: Slow or rate-limited RPC

**Fix**:

- Use a premium RPC provider (Helius, QuickNode)
- Update SOLANA_RPC_URL in .env

---

## Success Criteria

Your implementation is working correctly if:

- ✅ Certificate issued without errors
- ✅ NFT appears in student's wallet
- ✅ NFT is frozen (non-transferable)
- ✅ Metadata shows course name
- ✅ Certificate record in database
- ✅ Verification endpoint returns certificate
- ✅ Transfer attempt fails with "frozen" error

---

## Next Steps After Testing

Once all tests pass:

1. **Clean up test data** (optional):
   - Remove test certificates from database
   - Close test wallets

2. **Prepare for production**:
   - Generate production keypair (for VC signing only)
   - Deploy to mainnet
   - Update RPC to mainnet URL
   - **Students** will need SOL in their wallets (not API wallet)

3. **Add monitoring**:
   - Log all certificate issuances
   - Track costs
   - Monitor wallet balance

4. **Optional enhancements**:
   - Add IPFS metadata storage
   - Create verification portal
   - Generate QR codes

---

## Quick Test Script

For convenience, here's a complete test script:

```bash
#!/bin/bash
# test-certificate.sh

set -e

echo "🧪 Testing Certificate NFT System"
echo "================================"

# Configuration
API_URL="http://localhost:3000"
STUDENT_EMAIL="student@example.com"
STUDENT_PASSWORD="password123"

# Step 1: Login
echo "1️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "✅ Logged in successfully"

# Step 2: Get student info
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id')
echo "👤 User ID: $USER_ID"

# Step 3: Issue certificate
echo "2️⃣  Issuing certificate..."
CERT_RESPONSE=$(curl -s -X POST $API_URL/certificates/issue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "courseId": "YOUR_COURSE_ID",
    "studentDid": "did:example:test",
    "studentWallet": "YOUR_STUDENT_WALLET",
    "txSignature": "test-sig"
  }')

echo "✅ Certificate issued!"
echo $CERT_RESPONSE | jq .

NFT_ADDRESS=$(echo $CERT_RESPONSE | jq -r '.certificate.nftAddress')
echo "🎫 NFT Address: $NFT_ADDRESS"

# Step 4: Verify
echo "3️⃣  Verifying certificate..."
VERIFY_RESPONSE=$(curl -s -X GET $API_URL/certificates/student/$USER_ID \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Verification complete!"
echo $VERIFY_RESPONSE | jq .

echo ""
echo "🎉 Test completed successfully!"
```

Save this as `test-certificate.sh`, update the values, and run:

```bash
chmod +x test-certificate.sh
./test-certificate.sh
```

---

**Ready to test!** Follow this guide step by step and you'll have a fully verified soulbound certificate NFT system. 🚀
