#!/usr/bin/env bash
set -e

echo "🚀 Setting up Solana Devnet for Certificate NFT Testing"
echo "========================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found${NC}"
    echo "Install: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites satisfied${NC}"
echo ""

# Set Solana to devnet
echo "🌐 Configuring Solana CLI for devnet..."
solana config set --url devnet
echo -e "${GREEN}✅ Set to devnet${NC}"
echo ""

# Get or create keypair
KEYPAIR_PATH="${HOME}/.config/solana/cognify-issuer.json"

if [ -f "$KEYPAIR_PATH" ]; then
    echo -e "${YELLOW}⚠️  Keypair already exists at $KEYPAIR_PATH${NC}"
    read -p "Use existing keypair? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating new keypair..."
        solana-keygen new -o "$KEYPAIR_PATH" --force
    fi
else
    echo "🔑 Creating new issuer keypair..."
    solana-keygen new -o "$KEYPAIR_PATH"
fi

# Set as default
solana config set --keypair "$KEYPAIR_PATH"
echo -e "${GREEN}✅ Keypair configured${NC}"
echo ""

# Get public key
PUBLIC_KEY=$(solana address)
echo "📍 Issuer Public Key: $PUBLIC_KEY"
echo ""

# Request airdrop
echo "💰 Requesting devnet airdrop..."
solana airdrop 2 || solana airdrop 1

# Check balance
BALANCE=$(solana balance)
echo -e "${GREEN}✅ Wallet funded: $BALANCE${NC}"
echo ""

# Generate base58 private key for .env
echo "🔐 Generating base58 private key for .env..."
echo ""

# Create temp node script
cat > /tmp/keypair_to_base58.js << 'EOF'
const fs = require('fs');
const bs58 = require('bs58');

const keypairPath = process.argv[2];
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
const secretKey = Uint8Array.from(keypairData.slice(0, 64));
const base58Key = bs58.encode(secretKey);

console.log(base58Key);
EOF

if command -v node &> /dev/null; then
    # Check if bs58 is available
    if node -e "require('bs58')" 2>/dev/null; then
        PRIVATE_KEY_BASE58=$(node /tmp/keypair_to_base58.js "$KEYPAIR_PATH")
        
        echo -e "${GREEN}✅ Base58 Private Key Generated${NC}"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📋 Add this to your apps/api/.env file:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "SOLANA_RPC_URL=https://api.devnet.solana.com"
        echo "SOLANA_PRIVATE_KEY=$PRIVATE_KEY_BASE58"
        echo "PROGRAM_ID=GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        echo -e "${YELLOW}⚠️  bs58 npm package not found${NC}"
        echo "Install: npm install -g bs58 or bun add -g bs58"
        echo "Then run: node /tmp/keypair_to_base58.js $KEYPAIR_PATH"
    fi
else
    echo -e "${YELLOW}⚠️  Node.js not found${NC}"
    echo "Private key is at: $KEYPAIR_PATH"
    echo "You'll need to convert it to base58 format for the .env file"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Devnet setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the environment variables above to apps/api/.env"
echo "2. Deploy the program: anchor deploy"
echo "3. Start testing!"
echo ""

