import { Router } from "express";

const router = Router();

router.get("/performance", async (_req, res) => {
  res.json({
    accuracy: 0.874,
    precision: 0.891,
    recall: 0.856,
    f1Score: 0.873,
    auc: 0.932,
    falseAlarmRate: 0.109,
    missRate: 0.144,
    trainingDataSize: 47832,
    lastTrainedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    modelName: "HELIOS-RF-v2",
    version: "2.4.1",
    confusionMatrix: [
      [412, 23, 8, 2, 0],
      [31, 287, 19, 5, 1],
      [12, 22, 198, 14, 3],
      [3, 7, 18, 89, 6],
      [0, 2, 4, 8, 34],
    ],
  });
});

router.get("/feature-importance", async (_req, res) => {
  const features = [
    { feature: "Soft X-Ray Peak Flux", importance: 0.234, category: "Spectral" },
    { feature: "Hard X-Ray Derivative", importance: 0.198, category: "Temporal" },
    { feature: "Rolling Mean (10min)", importance: 0.167, category: "Statistical" },
    { feature: "Soft/Hard Ratio", importance: 0.142, category: "Spectral" },
    { feature: "Rate of Change", importance: 0.128, category: "Temporal" },
    { feature: "FFT Peak Frequency", importance: 0.089, category: "Frequency" },
    { feature: "Rolling Std Dev", importance: 0.076, category: "Statistical" },
    { feature: "Energy Integral", importance: 0.065, category: "Energy" },
    { feature: "Wavelet Coefficient", importance: 0.058, category: "Frequency" },
    { feature: "Peak Width", importance: 0.047, category: "Shape" },
    { feature: "Signal Gradient", importance: 0.041, category: "Temporal" },
    { feature: "Rolling Max (30min)", importance: 0.035, category: "Statistical" },
  ];
  res.json(features.sort((a, b) => b.importance - a.importance));
});

export default router;
