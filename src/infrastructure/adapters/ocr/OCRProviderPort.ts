export interface OCRProviderPort {
  readEvidence(evidenceId: string): Promise<{ guideNumber?: string; carrier?: string; confidence: number }>;
}
