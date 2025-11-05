# Soulbound NFT Certificate

A Solana smart contract (Anchor program) that issues non-transferable (soulbound) NFT certificates for course completion.

## Features

- 🔒 **Soulbound NFTs**: Certificates are frozen and non-transferable
- 🎨 **Metaplex Standard**: Full NFT metadata support
- ✅ **Verifiable Credentials**: Stores VC hash on-chain
- 🔐 **Secure**: Authority-controlled minting

## Program ID

```
GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm
```

## Installation

```bash
# Install dependencies
bun install

# Build the program
anchor build

# Run tests
anchor test

# Copy IDL to API
bun run copy-idl
```

## Instructions

### `issue_certificate`

Issues a soulbound certificate NFT to a student.

**Parameters:**

- `metadata_uri`: String - URI to certificate metadata
- `name`: String - Certificate name
- `symbol`: String - Token symbol (e.g., "COGCERT")
- `vc_hash`: String - Verifiable credential hash

**Accounts:**

- Mint (writable, signer)
- Recipient
- Token Account (writable, PDA)
- Mint Authority (writable, signer)
- Metadata (writable)
- Metadata Program
- Token Program
- Associated Token Program
- System Program
- Rent Sysvar

## Development

```bash
# Start local validator
solana-test-validator

# Build
anchor build

# Deploy to localnet
anchor deploy

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Testing

```bash
anchor test
```

Tests cover:

- ✅ NFT minting with metadata
- ✅ Soulbound verification (frozen state)
- ✅ Multiple certificates to same wallet
- ✅ PDA derivation

## Architecture

The certificate NFT uses:

1. **SPL Token** - For token minting
2. **Associated Token Account** - For automatic account creation
3. **Metaplex Token Metadata** - For NFT metadata
4. **Freeze Authority** - For soulbound implementation

## Status

✅ **Phase 1 Complete** - Smart contract implemented and tested

See [PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md) for details.
