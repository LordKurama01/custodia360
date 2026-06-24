import type { OCRProviderPort } from "./OCRProviderPort";

export class PreparedOCRAdapter implements OCRProviderPort {
  async readEvidence(): Promise<{ guideNumber?: string; carrier?: string; confidence: number }> {
    return { guideNumber: "PENDIENTE", carrier: "PENDIENTE", confidence: 0 };
  }
}
