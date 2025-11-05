# Certificate NFT UI Testing Guide

This guide walks you through testing the complete certificate issuance flow with wallet integration in the browser.

## 🎯 Overview

Students who complete a course can request a certificate by:

1. Connecting their Solana wallet (Phantom/Solflare)
2. Signing a transaction as proof
3. Receiving a soulbound NFT certificate on Solana blockchain

---

## 📋 Prerequisites

### 1. Install Dependencies

```bash
# Install UI dependencies (includes Solana Wallet Adapter)
cd apps/cognify-ui
bun install

# Install API dependencies (already done in Phase 2)
cd ../api
bun install
```

### 2. Setup Solana Wallet (Browser Extension)

Install one of these wallet extensions:

- **Phantom** (Recommended): https://phantom.app/
- **Solflare**: https://solflare.com/

After installation:

1. Create a new wallet or import existing
2. Switch network to **Devnet** in wallet settings

### 3. Get Devnet SOL (Free Test Tokens)

In your wallet:

- Click "Settings" → "Developer Settings"
- Enable "Testnet Mode"
- Click "Airdrop" to get free devnet SOL

Or use CLI:

```bash
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

### 4. Configure Environment Variables

**apps/cognify-ui/.env.local:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**apps/api/.env:**

```env
DATABASE_URL=postgresql://...
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=<your_base58_private_key>
PROGRAM_ID=<your_deployed_program_id>

# JWT secrets (existing)
JWT_SECRET=...
JWT_REFRESH_SECRET=...
```

---

## 🚀 Step-by-Step Testing

### Step 1: Deploy Smart Contract to Devnet

```bash
# From project root
cd blockchain/certificate_nft

# Setup devnet environment (if not already done)
solana config set --url devnet

# Build and deploy
anchor build
anchor deploy --provider.cluster devnet

# Copy the Program ID from output and update .env
# Example: Program Id: GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm
```

Update `apps/api/.env`:

```env
PROGRAM_ID=<your_program_id_from_deploy>
```

### Step 2: Start the API Server

```bash
cd apps/api
bun run dev
```

API should be running on `http://localhost:3000`

### Step 3: Start the UI Development Server

```bash
cd apps/cognify-ui
bun run dev
```

UI should be running on `http://localhost:3001` (or 3000 if API is on different port)

### Step 4: Create Test Data

You need:

1. A registered student account
2. An enrolled course
3. **Mark the enrollment as completed**

#### Option A: Use Database Directly (Quick)

```sql
-- Connect to your PostgreSQL database
-- Find an enrollment
SELECT * FROM enrollments LIMIT 5;

-- Mark it as completed
UPDATE enrollments
SET completed = true
WHERE id = '<enrollment_id>';
```

#### Option B: Use API (Proper Way)

```bash
# 1. Register a student
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "username": "testStudent",
    "name": "Test Student",
    "password": "password123",
    "role": "STUDENT"
  }'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testStudent",
    "password": "password123"
  }'
# Save the token from response

# 3. Enroll in a course
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "courseId": "<existing_course_id>"
  }'

# 4. Mark as completed (requires direct DB access or completing all lessons)
```

### Step 5: Test the Certificate Flow

1. **Login to the UI**
   - Go to `http://localhost:3001`
   - Login with your test student account

2. **Navigate to Enrolled Courses**
   - Click "My Courses" or go to `/courses/enrolled`
   - You should see your completed course with 100% progress

3. **Connect Wallet**
   - Look for the "Request Your Certificate" section
   - Click "Connect Wallet" button
   - Select Phantom or Solflare from the modal
   - Approve the connection in your wallet

4. **Request Certificate**
   - Once wallet is connected, you'll see:
     - Your wallet address (truncated)
     - "Request Certificate NFT" button
   - Click the button

5. **Sign Transaction**
   - Your wallet will prompt you to approve a transaction
   - This is a zero-lamport self-transfer (only paying network fee ~0.000005 SOL)
   - Click "Approve" in your wallet

6. **Wait for Certificate Minting**
   - The UI will show "Processing..." status
   - Backend will:
     1. Verify the transaction signature
     2. Create a verifiable credential (VC)
     3. Mint a soulbound NFT
     4. Store certificate in database
   - This takes 5-10 seconds

7. **Success!**
   - You'll see a success message
   - Certificate details are displayed
   - Check your wallet - you should see the NFT!

---

## 🔍 Verification

### Verify NFT in Wallet

1. Open your Phantom/Solflare wallet
2. Go to "Collectibles" or "NFTs" tab
3. You should see: `<Course Name> - Certificate`
4. Click on it to view metadata

### Verify NFT is Soulbound

Try to transfer the NFT:

1. In wallet, click on the certificate NFT
2. Try to "Send" or "Transfer"
3. **It should fail** - proving it's soulbound (non-transferable)

### Verify on Solana Explorer

1. Get your wallet address from the wallet
2. Go to: https://explorer.solana.com/?cluster=devnet
3. Search for your wallet address
4. Look for recent transactions and NFT holdings
5. Click on the NFT to see metadata

### Verify via API

```bash
# Get all certificates for a student
curl http://localhost:3000/certificates/student/<user_id> \
  -H "Authorization: Bearer <your_token>"

# Verify a specific certificate
curl http://localhost:3000/certificates/verify/<vcHash>
```

---

## 🐛 Troubleshooting

### "Please connect your wallet first"

- Install Phantom or Solflare browser extension
- Make sure wallet is unlocked
- Refresh the page and try again

### "Insufficient funds"

- Get devnet SOL: https://solfaucet.com/
- Or use wallet's built-in airdrop feature

### "Transaction failed"

- Check console for error details
- Verify PROGRAM_ID is correct in .env
- Ensure smart contract is deployed to devnet
- Check API logs for backend errors

### "Failed to issue certificate"

- Verify enrollment.completed = true in database
- Check API logs: `cd apps/api && bun run dev`
- Ensure SOLANA_PRIVATE_KEY is set correctly
- Verify wallet has enough SOL for transaction fees

### Wallet not connecting

- Clear browser cache and cookies
- Disable other wallet extensions temporarily
- Try a different browser
- Check browser console for errors

### NFT not showing in wallet

- Wait a few minutes (blockchain can be slow)
- Refresh wallet
- Check Solana Explorer to confirm minting
- Some wallets cache - try viewing in explorer

---

## 📊 Expected Console Output

### UI Console (Browser DevTools)

```
Transaction confirmed: <signature>
Certificate issued: { id: '...', vcHash: '...', nftAddress: '...' }
```

### API Console

```
Issuing certificate NFT:
  Mint: <mint_public_key>
  Recipient: <student_wallet>
  Token Account: <token_account>
  Metadata PDA: <metadata_pda>
  VC Hash: <vc_hash>
Certificate NFT issued successfully!
  Transaction: <tx_signature>
  NFT Address: <nft_mint_address>
```

---

## ✅ Test Checklist

Before considering testing complete, verify:

- [ ] Dependencies installed in both UI and API
- [ ] Wallet extension installed and configured for devnet
- [ ] Smart contract deployed to devnet
- [ ] Environment variables set correctly
- [ ] Student account exists and is logged in
- [ ] Course enrollment exists with `completed = true`
- [ ] Wallet connects successfully in UI
- [ ] Transaction signs successfully
- [ ] Certificate mints successfully
- [ ] NFT appears in wallet
- [ ] NFT is non-transferable (soulbound)
- [ ] Certificate appears in database
- [ ] API verification endpoint returns valid certificate

---

## 🎉 Success Criteria

You've successfully completed testing when:

1. ✅ Student can connect wallet in browser
2. ✅ Student can sign transaction
3. ✅ Certificate NFT mints on Solana devnet
4. ✅ NFT appears in student's wallet
5. ✅ NFT is non-transferable (soulbound)
6. ✅ Certificate is stored in database
7. ✅ API returns certificate data
8. ✅ No errors in console or logs

---

## 🚀 Next Steps

After successful testing:

1. **Production Deployment**
   - Switch to mainnet-beta
   - Deploy smart contract to mainnet
   - Update environment variables
   - Get production RPC endpoint (Helius/QuickNode)

2. **UI Enhancements**
   - Add certificate gallery page
   - Show certificate metadata (image, description)
   - Add social sharing features
   - Create certificate verification page

3. **Advanced Features**
   - IPFS metadata storage
   - Custom certificate artwork
   - Batch certificate issuance
   - Email notifications
   - QR code generation

---

## 📚 Additional Resources

- [Solana Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)
- [Phantom Wallet](https://phantom.app/)
- [Solflare Wallet](https://solflare.com/)
- [Solana Explorer](https://explorer.solana.com/)
- [Solana Devnet Faucet](https://solfaucet.com/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console (F12)
2. Check API server logs
3. Check Solana Explorer for transaction details
4. Verify all environment variables are set
5. Ensure smart contract is deployed
6. Check wallet has devnet SOL

Happy Testing! 🎓✨
