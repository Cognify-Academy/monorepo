import { signVC, hashVC, buildVC, issuerDid } from "./utils/crypto";
import { Connection } from "@solana/web3.js";
import { getCourseTitle, createCertificate } from "./model";

export async function issueCertificate({
  userId,
  courseId,
  studentDid,
  studentWallet,
  txSignature,
  nftAddress,
}: {
  userId: string;
  courseId: string;
  studentDid: string;
  studentWallet: string;
  txSignature: string;
  nftAddress?: string;
}) {
  const course = await getCourseTitle(courseId);
  if (!course) throw new Error("Course not found");

  // Verify the transaction exists on-chain
  const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
  const tx = await connection.getTransaction(txSignature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  if (!tx) throw new Error("Invalid Solana transaction");

  // Build and sign the verifiable credential
  const vcJson = buildVC({
    studentDid,
    studentWallet,
    issuerDid,
    courseId,
    courseTitle: course.title,
    txSignature: txSignature,
  });

  const proof = signVC(vcJson);
  const signedVC = { ...vcJson, proof };
  const vcHash = hashVC(signedVC);

  // Store the certificate record in database
  // Note: NFT was minted by the student in their browser
  const cert = await createCertificate({
    userId,
    courseId,
    studentDid,
    issuerDid,
    vcJson: signedVC,
    vcHash,
    nftAddress: nftAddress || null,
  });

  return cert;
}
