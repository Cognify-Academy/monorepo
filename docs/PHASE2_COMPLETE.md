# Phase 2: API Integration Layer - COMPLETE ✅

## Summary

Phase 2 of the Soulbound Certificate NFT implementation has been successfully completed. The API is now fully integrated with the Solana smart contract and ready for testing.

## What Was Implemented

### 1. ✅ Created Metadata Utilities (`utils/metadata/index.ts`)

New utility module for Metaplex metadata operations:

```typescript
// Export constants
- TOKEN_METADATA_PROGRAM_ID: Metaplex Token Metadata program address

// Helper functions
- findMetadataPDA(mint): Derives metadata PDA for a given mint
- findMasterEditionPDA(mint): Derives master edition PDA (for future use)
```

**Function Improvements:**

- ✅ Proper TypeScript typing with explicit parameters
- ✅ Uses Anchor Program to call smart contract
- ✅ Correctly derives all required PDAs
- ✅ Passes course name to certificate
- ✅ Comprehensive error handling
- ✅ Detailed console logging for debugging

**Fixed Issues:**

- ✅ Removed duplicate SOLANA_PRIVATE_KEY format (consistent bs58 decoding)
- ✅ Proper Anchor Provider setup
- ✅ Correct account passing to smart contract
- ✅ Associated Token Account derivation

### 3. ✅ Added Required Dependencies

Updated `apps/api/package.json`:

- `@coral-xyz/anchor`: ^0.32.1 (Solana program framework)
- `@solana/spl-token`: ^0.4.14 (SPL Token utilities)
- `tweetnacl`: ^1.0.3 (Cryptographic operations)

## Files Modified/Created

```
apps/api/
├── certificates/
│   ├── service.ts                      [MODIFIED] - Pass course name to NFT
│   └── utils/
│       ├── crypto.ts                   [MODIFIED] - Fixed implementation
│       └── metadata/
│           └── index.ts                [CREATED]  - Metadata utilities
├── package.json                        [MODIFIED] - Added dependencies
└── PHASE2_COMPLETE.md                  [CREATED]  - This file
```

## Integration Details

### Certificate Issuance Flow

**Current Flow (Student Pays):**

1. **User completes course** → Enrollment marked as completed
2. **Student connects wallet** → Phantom/Solflare in browser
3. **Student mints NFT** → Browser calls smart contract directly:
   - Creates new mint account
   - Mints 1 token to student's wallet
   - Creates Metaplex metadata with course name
   - Stores VC hash on-chain
   - Freezes token (makes it soulbound)
   - **Student pays for minting (~$0.20)**
4. **API verifies transaction** → Checks transaction signature on-chain
5. **API generates VC** → Creates verifiable credential with course info
6. **Signs VC** → Uses issuer's Ed25519 key to sign (for VC proof)
7. **Hashes VC** → Creates SHA-256 hash for on-chain storage
8. **Stores certificate** → Saves to database with NFT address
9. **Returns certificate** → Student receives certificate with NFT proof

**Note**: The API no longer mints NFTs. Students mint from their browser wallets, and the API only verifies transactions and stores certificate records.

### Smart Contract Call (From Browser)

The smart contract is called from the student's browser:

```typescript
// This happens in the browser (frontend), not API
await program.methods
  .issueCertificate(
    metadataUri, // IPFS URI with metadata
    certificateName, // e.g., "Blockchain 101 - Certificate"
    "COGCERT", // Symbol
    vcHash, // SHA-256 hash for verification
  )
  .accounts({
    mint, // New mint keypair
    recipient, // Student's wallet
    tokenAccount, // Associated token account (auto-created)
    mintAuthority, // Student's wallet (signs and pays)
    metadata, // Metaplex metadata PDA
    // ... program accounts
  })
  .signers([mint])
  .rpc();
```

## Environment Variables Required

Before testing, ensure these environment variables are set:

**API (`apps/api/.env`):**

```bash
# Solana Configuration (for transaction verification only)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=<base58_encoded_keypair_secret_key>  # Only for signing VCs
PROGRAM_ID=GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm

# Optionally for production
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# IPFS_API_KEY=<if_using_hosted_ipfs>
```

**UI (`apps/cognify-ui/.env.local`):**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm
```

**Important**: `SOLANA_PRIVATE_KEY` in the API is only used for signing Verifiable Credentials (VCs), not for minting NFTs. The API wallet does NOT need SOL because students mint NFTs from their browser wallets.

### Generating Keys

```bash
# Generate a new keypair
solana-keygen new -o ~/.config/solana/issuer-keypair.json

# Get the base58 private key
solana-keygen pubkey ~/.config/solana/issuer-keypair.json

# Convert to base58 for SOLANA_PRIVATE_KEY
# Use a tool or script to encode the secret key bytes to base58
```

## API Endpoints

### POST `/certificates/issue`

Issues a verifiable credential certificate with soulbound NFT.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "userId": "string",
  "courseId": "string",
  "studentDid": "string",
  "studentWallet": "string",
  "txSignature": "string",
  "nftAddress": "string?" // Optional
}
```

**Response (200):**

```json
{
  "success": true,
  "certificate": {
    "id": "string",
    "userId": "string",
    "courseId": "string",
    "studentDid": "string",
    "issuerDid": "string",
    "vcJson": {},
    "vcHash": "string",
    "nftAddress": "string",
    "createdAt": "ISO8601"
  }
}
```

**Permissions:**

- Students can issue for themselves (after course completion)
- Admins can issue for anyone

## Testing Checklist

To test the complete flow:

- [ ] Set up environment variables (see above)
- [ ] Deploy program to devnet: `cd blockchain/certificate_nft && anchor deploy --provider.cluster devnet`
- [ ] Update `PROGRAM_ID` with deployed address
- [ ] **Student funds their wallet** with SOL (get from faucet - API wallet does NOT need SOL)
- [ ] Start API server: `cd apps/api && bun run dev`
- [ ] Start UI server: `cd apps/cognify-ui && bun run dev`
- [ ] Complete a course as a student
- [ ] **Student connects wallet** in browser (Phantom/Solflare)
- [ ] **Student mints certificate NFT** from browser (pays ~$0.20)
- [ ] API verifies transaction and stores certificate
- [ ] Verify NFT in student's wallet
- [ ] Verify certificate is frozen (non-transferable)
- [ ] Check database for certificate record

## Error Handling

The implementation includes comprehensive error handling:

```typescript
try {
  // NFT issuance logic
} catch (error) {
  console.error("Error issuing soulbound NFT:", error);
  throw new Error(`Failed to issue soulbound NFT: ${error.message}`);
}
```

Common errors:

- **Insufficient SOL**: Student wallet needs ~0.0015 SOL per certificate (not API wallet)
- **Invalid wallet address**: Check studentWallet format
- **Program not deployed**: Deploy to devnet/mainnet first
- **RPC rate limits**: Use paid RPC for production
- **Transaction not found**: Ensure student minted NFT before calling API endpoint

## Performance Considerations

- **Transaction Time**: ~2-3 seconds on devnet
- **Cost**: ~0.0015 SOL per certificate (~$0.20) - **paid by student, not platform**
- **Platform Cost**: **$0** - No ongoing costs!
- **Scalability**: Unlimited (students pay for their own certificates)
- **Caching**: Consider caching program instance in frontend for better performance

## Security Notes

1. **Private Key Security**: Store `SOLANA_PRIVATE_KEY` securely (only for VC signing, not minting)
2. **RPC Endpoint**: Use authenticated RPC for production
3. **Validation**: Always validate course completion and transaction signature before storing certificate
4. **Rate Limiting**: Implement rate limits to prevent abuse
5. **Monitoring**: Log all certificate issuances for audit trail
6. **Transaction Verification**: Always verify transactions exist on-chain before storing certificates

## Next Steps - Phase 3 (Optional Enhancements)

1. **IPFS Integration**
   - Upload certificate metadata to IPFS
   - Generate proper NFT metadata JSON
   - Use real IPFS URIs instead of placeholder

2. **Metadata Enhancement**
   - Add certificate images
   - Include instructor signatures
   - Add completion date and grade

3. **Batch Minting**
   - Issue multiple certificates in one transaction
   - Reduce costs for bulk issuance

4. **Verification Portal**
   - Public verification page for certificates
   - QR code generation for easy verification
   - Blockchain explorer integration

5. **Advanced Features**
   - Revocation mechanism (if needed)
   - Certificate updates (metadata changes)
   - Collection support (group certificates by cohort)

## Status

✅ **Phase 2 Complete** - API fully integrated with smart contract

Ready for testing with environment configuration!

---

**Phase 2 Status**: ✅ **COMPLETE**  
**Ready for**: Testing & Deployment  
**Completed**: November 3, 2025
