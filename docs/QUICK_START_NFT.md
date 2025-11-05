# 🚀 Quick Start

## Prerequisites

- ✅ Solana CLI installed
- ✅ Anchor CLI installed
- ✅ Bun installed
- ✅ PostgreSQL running

## Step 1: Setup Devnet (2 minutes)

```bash
# Run the automated setup script
bun run setup-devnet

# This will:
# - Configure Solana CLI for devnet
# - Create/configure issuer keypair
# - Fund wallet with SOL
# - Generate base58 private key for .env
```

## Step 2: Configure Environment (1 minute)

**API (`apps/api/.env`):**

```bash
# Database (existing)
DATABASE_URL=postgresql://...
JWT_SECRET=...

# Solana (for transaction verification only)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=<paste_from_setup_script>  # Only for signing VCs
PROGRAM_ID=GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm
```

**UI (`apps/cognify-ui/.env.local`):**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm
```

**Note**: `SOLANA_PRIVATE_KEY` is only for signing VCs. The API wallet does NOT need SOL because students mint NFTs from their browser wallets.

## Step 3: Deploy Smart Contract (1 minute)

```bash
# Build and deploy to devnet
bun run deploy-devnet

# If Program ID changed, update .env and rebuild:
bun run build-nft
```

## Step 4: Test Everything (1 minute)

```bash
# Run smart contract tests
bun run test-nft

# Start API server (in another terminal)
cd apps/api && bun run dev

# Test certificate issuance
bun run test:certificate
```

## Verification

After successful test:

1. **Check Solana Explorer**:

   ```
   https://explorer.solana.com/address/<NFT_ADDRESS>?cluster=devnet
   ```

2. **Import student wallet to Phantom**:
   - Settings → Import Wallet → Private Key
   - Switch to Devnet
   - See your certificate NFT!

3. **Try to transfer (should fail)**:
   - Proves it's soulbound ✓

---

## Common Commands

```bash
# Setup
bun run setup-devnet          # Configure devnet
bun run build-nft             # Build program + copy IDL
bun run deploy-devnet         # Deploy to devnet

# Testing
bun run test-nft              # Run smart contract tests
bun run test:certificate      # Test full flow

# Development
cd apps/api && bun run dev    # Start API server
cd blockchain/certificate_nft && anchor test  # Test locally
```

---

## Troubleshooting

### "Account not found"

```bash
solana balance
solana airdrop 2
```

### "Program not deployed"

```bash
bun run deploy-devnet
```

### "Invalid signature"

Check `SOLANA_PRIVATE_KEY` is base58 format (run `setup-devnet` again)

---

## Next Steps

✅ Everything working? Great! Now you can:

1. **Deploy to mainnet**:

   ```bash
   solana config set --url mainnet-beta
   anchor deploy
   # Update .env with mainnet RPC and new Program ID
   ```

2. **Integrate with UI**:
   - Add "Request Certificate" button after course completion
   - Show certificates in student profile
   - Display NFT in wallet

3. **Add enhancements**:
   - IPFS metadata storage
   - Custom certificate artwork
   - Batch minting
   - Verification portal

---

## Documentation

- 📚 **Full Guide**: `TESTING_GUIDE.md`
- 🏗️ **Implementation**: `SOULBOUND_NFT_IMPLEMENTATION_COMPLETE.md`
- 📖 **Phase 1**: `blockchain/certificate_nft/PHASE1_COMPLETE.md`
- 📖 **Phase 2**: `apps/api/certificates/PHASE2_COMPLETE.md`

---

## Support

Having issues? Check:

1. Environment variables are set correctly
2. Issuer wallet has SOL (run `solana balance`)
3. Program is deployed (run `solana program show <PROGRAM_ID>`)
4. API server is running

For detailed troubleshooting, see `TESTING_GUIDE.md`.

---

**Happy minting! 🎉**
