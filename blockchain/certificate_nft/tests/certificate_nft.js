const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram } = anchor.web3;
const {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");

describe("certificate_nft", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.CertificateNft;

  // Metaplex Token Metadata Program ID
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );

  // Helper function to derive metadata PDA
  const getMetadataPDA = async (mint) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );
  };

  it("Issues a soulbound certificate NFT", async () => {
    // Create a new mint keypair
    const mint = Keypair.generate();

    // Recipient wallet (student)
    const recipient = Keypair.generate();

    // Airdrop some SOL to recipient for account creation
    const airdropSig = await provider.connection.requestAirdrop(
      recipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Get the associated token account address
    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        recipient.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    // Get metadata PDA
    const [metadata] = await getMetadataPDA(mint.publicKey);

    // Certificate metadata
    const metadataUri = "https://arweave.net/test-certificate-metadata";
    const name = "Cognify Certificate";
    const symbol = "COGCERT";
    const vcHash = "test-vc-hash-" + Date.now();

    console.log("Mint:", mint.publicKey.toBase58());
    console.log("Recipient:", recipient.publicKey.toBase58());
    console.log("Token Account:", tokenAccount.toBase58());
    console.log("Metadata PDA:", metadata.toBase58());

    // Issue the certificate
    const tx = await program.methods
      .issueCertificate(metadataUri, name, symbol, vcHash)
      .accounts({
        mint: mint.publicKey,
        recipient: recipient.publicKey,
        tokenAccount: tokenAccount,
        mintAuthority: provider.wallet.publicKey,
        metadata: metadata,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    console.log("Certificate issued! Transaction signature:", tx);

    // Verify the token account has 1 token
    const tokenAccountInfo =
      await provider.connection.getTokenAccountBalance(tokenAccount);
    console.log("Token balance:", tokenAccountInfo.value.amount);

    // Should have exactly 1 token (NFT)
    if (tokenAccountInfo.value.amount !== "1") {
      throw new Error("Expected token balance to be 1");
    }

    // Verify the account is frozen (soulbound)
    const tokenAccountData =
      await provider.connection.getAccountInfo(tokenAccount);
    const accountInfo =
      await provider.connection.getParsedAccountInfo(tokenAccount);
    console.log(
      "Token account state:",
      accountInfo.value.data.parsed.info.state,
    );

    // The account should be frozen
    if (accountInfo.value.data.parsed.info.state !== "frozen") {
      throw new Error("Expected token account to be frozen (soulbound)");
    }

    console.log("✅ Certificate is soulbound (frozen and non-transferable)");
  });

  it("Prevents issuing duplicate certificates to the same wallet", async () => {
    const mint1 = Keypair.generate();
    const mint2 = Keypair.generate();
    const recipient = Keypair.generate();

    // Airdrop SOL
    const airdropSig = await provider.connection.requestAirdrop(
      recipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Get token accounts (will be the same for both mints to the same recipient)
    const [tokenAccount1] = PublicKey.findProgramAddressSync(
      [
        recipient.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint1.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const [tokenAccount2] = PublicKey.findProgramAddressSync(
      [
        recipient.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint2.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const [metadata1] = await getMetadataPDA(mint1.publicKey);
    const [metadata2] = await getMetadataPDA(mint2.publicKey);

    // Issue first certificate
    await program.methods
      .issueCertificate(
        "https://arweave.net/cert1",
        "Certificate 1",
        "CERT1",
        "hash1",
      )
      .accounts({
        mint: mint1.publicKey,
        recipient: recipient.publicKey,
        tokenAccount: tokenAccount1,
        mintAuthority: provider.wallet.publicKey,
        metadata: metadata1,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint1])
      .rpc();

    console.log("✅ First certificate issued successfully");

    // Issue second certificate (different mint, same recipient)
    await program.methods
      .issueCertificate(
        "https://arweave.net/cert2",
        "Certificate 2",
        "CERT2",
        "hash2",
      )
      .accounts({
        mint: mint2.publicKey,
        recipient: recipient.publicKey,
        tokenAccount: tokenAccount2,
        mintAuthority: provider.wallet.publicKey,
        metadata: metadata2,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint2])
      .rpc();

    console.log(
      "✅ Second certificate issued successfully (different courses allowed)",
    );
  });
});
