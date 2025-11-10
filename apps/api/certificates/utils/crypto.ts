import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { createHash } from "crypto";
import nacl from "tweetnacl";

const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY!);
export const issuerKeypair = Keypair.fromSecretKey(secretKey);
export const issuerDid = `did:sol:${issuerKeypair.publicKey.toBase58()}`;

export const signVC = (vcJson: Record<string, any>) => {
  const message = new TextEncoder().encode(JSON.stringify(vcJson));
  const signature = nacl.sign.detached(message, issuerKeypair.secretKey);
  const encodedSig = bs58.encode(signature);

  return {
    type: "Ed25519Signature2020",
    created: new Date().toISOString(),
    proofPurpose: "assertionMethod",
    verificationMethod: `${issuerDid}#key-1`,
    proofValue: encodedSig,
  };
};

export const hashVC = (vcJson: Record<string, any>) => {
  const data = JSON.stringify(vcJson);
  return createHash("sha256").update(data).digest("hex");
};

export const verifyVC = (vcJson: object, proof: any) => {
  const message = new TextEncoder().encode(JSON.stringify(vcJson));
  const signature = bs58.decode(proof.proofValue);
  return nacl.sign.detached.verify(
    message,
    signature,
    issuerKeypair.publicKey.toBytes(),
  );
};

export const buildVC = (params: {
  studentDid: string;
  studentWallet: string;
  issuerDid: string;
  courseId: string;
  courseTitle: string;
  txSignature: string;
  nftAddress?: string;
}) => ({
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential", "CourseCompletionCertificate"],
  issuer: params.issuerDid,
  issuanceDate: new Date().toISOString(),
  credentialSubject: {
    id: `did:sol:${params.studentWallet}`,
    studentDid: params.studentDid,
    courseId: params.courseId,
    courseTitle: params.courseTitle,
    completionDate: new Date().toISOString(),
    transactionSignature: params.txSignature,
    nftAddress: params.nftAddress || null,
  },
});
