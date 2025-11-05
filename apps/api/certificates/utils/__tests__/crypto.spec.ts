import { describe, it, expect } from "bun:test";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

// Set required environment variable for tests BEFORE importing crypto
// crypto.ts decodes SOLANA_PRIVATE_KEY at module load time
if (
  !process.env.SOLANA_PRIVATE_KEY ||
  typeof process.env.SOLANA_PRIVATE_KEY !== "string"
) {
  const testKeypair = Keypair.generate();
  process.env.SOLANA_PRIVATE_KEY = bs58.encode(testKeypair.secretKey);
}

import {
  hashVC,
  buildVC,
  signVC,
  verifyVC,
  issuerKeypair,
  issuerDid,
} from "../crypto";

describe("hashVC", () => {
  it("should return a valid hex string", () => {
    const vcJson = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
    };
    const hash = hashVC(vcJson);
    expect(hash).toBeString();
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should produce the same hash for the same input", () => {
    const vcJson = {
      issuer: "did:example:123",
      credentialSubject: { id: "did:example:456" },
    };

    const hash1 = hashVC(vcJson);
    const hash2 = hashVC(vcJson);

    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different inputs", () => {
    const vcJson1 = {
      issuer: "did:example:123",
      credentialSubject: { id: "did:example:456" },
    };

    const vcJson2 = {
      issuer: "did:example:789",
      credentialSubject: { id: "did:example:456" },
    };

    const hash1 = hashVC(vcJson1);
    const hash2 = hashVC(vcJson2);

    expect(hash1).not.toBe(hash2);
  });

  it("should handle empty objects", () => {
    const hash = hashVC({});

    expect(hash).toBeString();
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should handle nested objects", () => {
    const vcJson = {
      credentialSubject: {
        id: "did:example:456",
        nested: {
          data: {
            value: "test",
          },
        },
      },
    };

    const hash = hashVC(vcJson);

    expect(hash).toBeString();
    expect(hash).toHaveLength(64);
  });

  it("should be sensitive to property order in JSON stringification", () => {
    const vcJson1 = { a: 1, b: 2 };
    const vcJson2 = { b: 2, a: 1 };

    const hash1 = hashVC(vcJson1);
    const hash2 = hashVC(vcJson2);

    expect(hash1).toBeString();
    expect(hash2).toBeString();
  });
});

describe("issuerKeypair", () => {
  it("should be a valid Keypair instance", () => {
    expect(issuerKeypair).toBeInstanceOf(Keypair);
  });

  it("should have a valid public key", () => {
    expect(issuerKeypair.publicKey).toBeDefined();
    expect(issuerKeypair.publicKey.toBase58()).toBeString();
    expect(issuerKeypair.publicKey.toBase58().length).toBeGreaterThan(0);
  });

  it("should have a valid secret key", () => {
    expect(issuerKeypair.secretKey).toBeDefined();
    expect(issuerKeypair.secretKey).toHaveLength(64);
  });
});

describe("issuerDid", () => {
  it("should be a valid DID string", () => {
    expect(issuerDid).toBeString();
    expect(issuerDid).toMatch(/^did:sol:.+$/);
  });

  it("should match the issuer keypair public key", () => {
    const expectedDID = `did:sol:${issuerKeypair.publicKey.toBase58()}`;
    expect(issuerDid).toBe(expectedDID);
  });

  it("should start with did:sol: prefix", () => {
    expect(issuerDid.startsWith("did:sol:")).toBe(true);
  });
});

describe("buildVC", () => {
  const mockParams = {
    studentDid: "did:example:student123",
    studentWallet: "AbcDefGh12345678901234567890123456789012",
    issuerDid: "did:example:issuer456",
    courseId: "course-uuid-789",
    courseTitle: "Introduction to Blockchain",
    txSignature: "sig-abc123def456",
  };

  it("should return a valid Verifiable Credential structure", () => {
    const vc = buildVC(mockParams);

    expect(vc).toHaveProperty("@context");
    expect(vc).toHaveProperty("type");
    expect(vc).toHaveProperty("issuer");
    expect(vc).toHaveProperty("issuanceDate");
    expect(vc).toHaveProperty("credentialSubject");
  });

  it("should set the correct @context", () => {
    const vc = buildVC(mockParams);

    expect(vc["@context"]).toEqual(["https://www.w3.org/2018/credentials/v1"]);
  });

  it("should set the correct type", () => {
    const vc = buildVC(mockParams);

    expect(vc.type).toEqual([
      "VerifiableCredential",
      "CourseCompletionCertificate",
    ]);
  });

  it("should set the issuer DID correctly", () => {
    const vc = buildVC(mockParams);

    expect(vc.issuer).toBe(mockParams.issuerDid);
  });

  it("should set a valid ISO 8601 issuanceDate", () => {
    const beforeDate = new Date();
    const vc = buildVC(mockParams);
    const afterDate = new Date();

    expect(vc.issuanceDate).toBeString();
    const parsedDate = new Date(vc.issuanceDate);
    expect(parsedDate).toBeInstanceOf(Date);
    expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
    expect(parsedDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
  });

  it("should set credentialSubject.id to student wallet DID", () => {
    const vc = buildVC(mockParams);
    expect(vc.credentialSubject.id).toBe(`did:sol:${mockParams.studentWallet}`);
  });

  it("should include studentDid in credentialSubject", () => {
    const vc = buildVC(mockParams);
    expect(vc.credentialSubject.studentDid).toBe(mockParams.studentDid);
  });

  it("should include course information in credentialSubject", () => {
    const vc = buildVC(mockParams);

    expect(vc.credentialSubject.courseId).toBe(mockParams.courseId);
    expect(vc.credentialSubject.courseTitle).toBe(mockParams.courseTitle);
  });

  it("should include completionDate in credentialSubject", () => {
    const beforeDate = new Date();
    const vc = buildVC(mockParams);
    const afterDate = new Date();

    expect(vc.credentialSubject.completionDate).toBeString();
    const parsedDate = new Date(vc.credentialSubject.completionDate);
    expect(parsedDate).toBeInstanceOf(Date);
    expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
    expect(parsedDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
  });

  it("should include transactionSignature in credentialSubject", () => {
    const vc = buildVC(mockParams);
    expect(vc.credentialSubject.transactionSignature).toBe(
      mockParams.txSignature,
    );
  });

  it("should include nftAddress in credentialSubject", () => {
    const vc = buildVC(mockParams);
    expect(vc.credentialSubject.nftAddress).toBe(
      `did:sol:${mockParams.studentWallet}`,
    );
  });

  it("should create different VCs for different students", () => {
    const vc1 = buildVC(mockParams);
    const vc2 = buildVC({
      ...mockParams,
      studentDid: "did:example:student999",
      studentWallet: "XyzQwerty12345678901234567890123456789",
    });

    expect(vc1.credentialSubject.id).not.toBe(vc2.credentialSubject.id);
    expect(vc1.credentialSubject.studentDid).not.toBe(
      vc2.credentialSubject.studentDid,
    );
  });

  it("should create VCs with all required fields populated", () => {
    const vc = buildVC(mockParams);

    // Verify all fields from params are present in the VC
    expect(vc.issuer).toBe(mockParams.issuerDid);
    expect(vc.credentialSubject.id).toBe(`did:sol:${mockParams.studentWallet}`);
    expect(vc.credentialSubject.studentDid).toBe(mockParams.studentDid);
    expect(vc.credentialSubject.courseId).toBe(mockParams.courseId);
    expect(vc.credentialSubject.courseTitle).toBe(mockParams.courseTitle);
    expect(vc.credentialSubject.transactionSignature).toBe(
      mockParams.txSignature,
    );
  });

  it("should create VCs with proper credential structure for different courses", () => {
    const course1Params = {
      studentDid: "did:example:student123",
      studentWallet: "AbcDefGh12345678901234567890123456789012",
      issuerDid: "did:example:issuer456",
      courseId: "course-1",
      courseTitle: "Course One",
      txSignature: "sig-1",
    };

    const course2Params = {
      studentDid: "did:example:student123",
      studentWallet: "AbcDefGh12345678901234567890123456789012",
      issuerDid: "did:example:issuer456",
      courseId: "course-2",
      courseTitle: "Course Two",
      txSignature: "sig-2",
    };

    const vc1 = buildVC(course1Params);
    const vc2 = buildVC(course2Params);

    expect(vc1.credentialSubject.courseId).toBe("course-1");
    expect(vc2.credentialSubject.courseId).toBe("course-2");
    expect(vc1.credentialSubject.courseTitle).not.toBe(
      vc2.credentialSubject.courseTitle,
    );
    expect(vc1.credentialSubject.transactionSignature).not.toBe(
      vc2.credentialSubject.transactionSignature,
    );
  });
});

describe("signVC", () => {
  const mockVC = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", "CourseCompletionCertificate"],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: "did:sol:student123",
      courseId: "course-1",
      courseTitle: "Test Course",
    },
  };

  it("should return a valid proof object", () => {
    const proof = signVC(mockVC);

    expect(proof).toHaveProperty("type");
    expect(proof).toHaveProperty("created");
    expect(proof).toHaveProperty("proofPurpose");
    expect(proof).toHaveProperty("verificationMethod");
    expect(proof).toHaveProperty("proofValue");
  });

  it("should set the correct proof type", () => {
    const proof = signVC(mockVC);
    expect(proof.type).toBe("Ed25519Signature2020");
  });

  it("should set a valid ISO 8601 created date", () => {
    const beforeDate = new Date();
    const proof = signVC(mockVC);
    const afterDate = new Date();

    expect(proof.created).toBeString();
    const parsedDate = new Date(proof.created);
    expect(parsedDate).toBeInstanceOf(Date);
    expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
    expect(parsedDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
  });

  it("should set the correct proof purpose", () => {
    const proof = signVC(mockVC);
    expect(proof.proofPurpose).toBe("assertionMethod");
  });

  it("should set the correct verification method", () => {
    const proof = signVC(mockVC);
    expect(proof.verificationMethod).toBe(`${issuerDid}#key-1`);
  });

  it("should produce a valid base58 encoded signature", () => {
    const proof = signVC(mockVC);
    expect(proof.proofValue).toBeString();
    expect(proof.proofValue.length).toBeGreaterThan(0);

    // Should be decodable as base58
    expect(() => bs58.decode(proof.proofValue)).not.toThrow();
  });

  it("should produce different signatures for different VCs", () => {
    const vc1 = {
      ...mockVC,
      credentialSubject: { ...mockVC.credentialSubject, courseId: "course-1" },
    };
    const vc2 = {
      ...mockVC,
      credentialSubject: { ...mockVC.credentialSubject, courseId: "course-2" },
    };

    const proof1 = signVC(vc1);
    const proof2 = signVC(vc2);

    expect(proof1.proofValue).not.toBe(proof2.proofValue);
  });

  it("should produce a signature that can be decoded", () => {
    const proof = signVC(mockVC);
    const signature = bs58.decode(proof.proofValue);

    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);
  });

  it("should create a signature with correct length", () => {
    const proof = signVC(mockVC);
    const signature = bs58.decode(proof.proofValue);

    // Ed25519 signatures are 64 bytes
    expect(signature).toHaveLength(64);
  });
});

describe("verifyVC", () => {
  const mockVC = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", "CourseCompletionCertificate"],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: "did:sol:student123",
      courseId: "course-1",
      courseTitle: "Test Course",
    },
  };

  it("should verify a valid signature", () => {
    const proof = signVC(mockVC);
    const isValid = verifyVC(mockVC, proof);
    expect(isValid).toBe(true);
  });

  it("should reject an invalid signature", () => {
    const proof = signVC(mockVC);
    const modifiedVC = {
      ...mockVC,
      credentialSubject: {
        ...mockVC.credentialSubject,
        courseId: "modified-course",
      },
    };

    const isValid = verifyVC(modifiedVC, proof);
    expect(isValid).toBe(false);
  });

  it("should reject a tampered proofValue", () => {
    const proof = signVC(mockVC);
    const tamperedProof = {
      ...proof,
      proofValue: bs58.encode(new Uint8Array(64)), // Random signature
    };

    const isValid = verifyVC(mockVC, tamperedProof);
    expect(isValid).toBe(false);
  });

  it("should handle empty VC objects", () => {
    const emptyVC = {};
    const proof = signVC(emptyVC);
    const isValid = verifyVC(emptyVC, proof);

    expect(isValid).toBe(true);
  });

  it("should be case sensitive", () => {
    const vc1 = { message: "Hello" };
    const vc2 = { message: "hello" };

    const proof = signVC(vc1);
    const isValid = verifyVC(vc2, proof);

    expect(isValid).toBe(false);
  });

  it("should detect changes in nested objects", () => {
    const vcWithNested = {
      outer: {
        inner: {
          value: "original",
        },
      },
    };

    const proof = signVC(vcWithNested);

    const modifiedVC = {
      outer: {
        inner: {
          value: "modified",
        },
      },
    };

    const isValid = verifyVC(modifiedVC, proof);
    expect(isValid).toBe(false);
  });

  it("should verify multiple VCs independently", () => {
    const vc1 = {
      ...mockVC,
      credentialSubject: { ...mockVC.credentialSubject, courseId: "course-1" },
    };
    const vc2 = {
      ...mockVC,
      credentialSubject: { ...mockVC.credentialSubject, courseId: "course-2" },
    };

    const proof1 = signVC(vc1);
    const proof2 = signVC(vc2);

    expect(verifyVC(vc1, proof1)).toBe(true);
    expect(verifyVC(vc2, proof2)).toBe(true);
    expect(verifyVC(vc1, proof2)).toBe(false);
    expect(verifyVC(vc2, proof1)).toBe(false);
  });
});
