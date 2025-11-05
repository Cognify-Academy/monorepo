import { PublicKey } from "@solana/web3.js";

/**
 * Metaplex Token Metadata Program ID
 */
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

/**
 * Finds the Metadata PDA for a given mint account
 * @param mint - The mint public key
 * @returns A tuple of [metadata PDA, bump seed]
 */
export function findMetadataPDA(mint: PublicKey): [PublicKey, number] {
  const [publicKey, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  );
  return [publicKey, bump];
}

/**
 * Finds the Master Edition PDA for a given mint account
 * @param mint - The mint public key
 * @returns A tuple of [master edition PDA, bump seed]
 */
export function findMasterEditionPDA(mint: PublicKey): [PublicKey, number] {
  const [publicKey, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  );
  return [publicKey, bump];
}
