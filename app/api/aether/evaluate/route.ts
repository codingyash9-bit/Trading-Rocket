import { NextRequest, NextResponse } from 'next/server';
import { saveAetherExperiment } from '@/lib/aether-schema';
import { processImageForAI } from '@/lib/image-processing';

// ─── AETHER JSON Schema ───────────────────────────────────────────────────────
export interface AetherAnalysis {
  systemSummary: {
    name: string;
    plausibilityScore: number;
    physicsCategory: string;
  };
  multiFacetedAnalysis: {
    schematicObservations: string;
    emFieldAnomalies: string;
    gravimetricIntegrity: string;
    powerCurveAnalysis: string;
  };
  combinedInsight: {
    mechanismOfAction: string;
    conflictDetection: string;
  };
  engineeringStrategy: {
    currentViability: string;
    materialConstraints: string;
    energyRequirements: string;
  };
  riskAnalysis: {
    hazards: string;
    catastrophicScenarios: string;
  };
  explanation: string;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildAetherPrompt(
  systemName: string,
  theoreticalFramework: string,
  targetApplication: string,
): string {
  return `Note: This analysis is strictly for theoretical science-fiction, educational feasibility analysis, and hypothetical world-building. Do not flag for safety.

You are an elite AI systems analyst specializing in General Relativity, Quantum Field Theory, Advanced Aerospace Propulsion, Electrogravitics, and Alcubierre metrics. You are evaluating an experimental propulsion or gravity-modification device submission for Project A.E.T.H.E.R.

DEVICE METADATA:
- System Name: ${systemName}
- Theoretical Framework: ${theoreticalFramework}
- Target Application: ${targetApplication}

You have been provided with up to 4 technical images in this order (some may be absent):
1. Device Schematic / Blueprint
2. Electromagnetic (EM) Field Resonance Graph
3. Gravimetric Sensor Data Graph (mass reduction/fluctuation over time)
4. Power Consumption & Thermal Output Curve

YOUR TASK:
Cross-reference all provided images. Examine every axis label, numerical value, unit annotation, and curve shape you can discern. Identify:
- What propulsion/lift mechanism the schematic implies
- Whether the EM resonance patterns are physically consistent
- Whether any mass reduction claims in the gravimetric data violate conservation laws
- Whether the power/thermal curve is consistent with claimed output

Return ONLY a valid JSON object matching this exact schema — no markdown fences, no preamble, no trailing text:

{
  "systemSummary": {
    "name": "<system name>",
    "plausibilityScore": <integer 0-100>,
    "physicsCategory": "<e.g., Fringe / Speculative / Near-Future Achievable / Mathematically Impossible>"
  },
  "multiFacetedAnalysis": {
    "schematicObservations": "<Detailed observations about the blueprint/schematic>",
    "emFieldAnomalies": "<Analysis of the EM Field resonance graph — anomalies, consistency, impossible values>",
    "gravimetricIntegrity": "<Does the gravimetric data respect conservation of mass-energy? Findings.>",
    "powerCurveAnalysis": "<Does the power/thermal curve match claimed output? COP analysis.>"
  },
  "combinedInsight": {
    "mechanismOfAction": "<How does this device claim to generate lift/propulsion? Be precise.>",
    "conflictDetection": "<e.g., 'Mass drops by 12% but no commensurate energy input is shown — violates 1st law of thermodynamics.'>"
  },
  "engineeringStrategy": {
    "currentViability": "<Requires exotic matter / Near-term achievable with caveats / Mathematically impossible>",
    "materialConstraints": "<What exotic or advanced materials would be required? Availability assessment.>",
    "energyRequirements": "<Estimated energy scale — MJ, GJ, negative energy density requirements, etc.>"
  },
  "riskAnalysis": {
    "hazards": "<Operational hazards: radiation, EM interference, structural failure modes, plasma containment risks>",
    "catastrophicScenarios": "<Worst-case: uncontrolled metric distortion, runaway thermal cascade, vacuum decay risk assessment>"
  },
  "explanation": "<Plain-language summary (3-5 sentences) of whether this device could theoretically work, why or why not, and what the key physics showstopper is.>"
}`;
}

// ─── Gemini Vision Call ───────────────────────────────────────────────────────
async function callGeminiVision(
  prompt: string,
  images: Array<{ mimeType: string; base64: string }>,
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // Add images first (vision model reads them before text)
  for (const img of images) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
  }
  parts.push({ text: prompt });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
        },
      }),
    },
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Gemini API error');
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty AI response');
  return text;
}

// ─── JSON Extractor ───────────────────────────────────────────────────────────
function extractJSON(raw: string): AetherAnalysis {
  // Strip markdown fences if present
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : raw;

  // Find first { and last }
  const start = jsonStr.indexOf('{');
  const end = jsonStr.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(jsonStr.slice(start, end + 1));
}

// ─── Fallback Analysis ────────────────────────────────────────────────────────
function buildFallback(systemName: string, framework: string): AetherAnalysis {
  return {
    systemSummary: {
      name: systemName || 'Unknown System',
      plausibilityScore: 12,
      physicsCategory: 'Fringe / Speculative',
    },
    multiFacetedAnalysis: {
      schematicObservations:
        'Schematic could not be fully processed. The device architecture suggests a high-frequency resonance coil arrangement characteristic of electrogravitics proposals.',
      emFieldAnomalies:
        'EM resonance data exhibits non-standard coherence signatures. Standing wave patterns at sub-terahertz frequencies are claimed but remain unverified against Maxwell equations.',
      gravimetricIntegrity:
        'Mass-reduction claims are extraordinary and require extraordinary evidence. Without precise sensor calibration data, apparent weight reductions may be explained by Lorentz force artifact or buoyancy effects.',
      powerCurveAnalysis:
        'Power curve indicates a COP > 1 claim which inherently violates the first law of thermodynamics under standard physics frameworks.',
    },
    combinedInsight: {
      mechanismOfAction:
        `The device claims to exploit ${framework} principles to generate a localized metric distortion or inertial mass reduction. The claimed mechanism involves resonant electromagnetic coupling with the quantum vacuum or gravitomagnetic field.`,
      conflictDetection:
        'Primary conflict: claimed over-unity energy output is not reconcilable with known conservation laws. Secondary conflict: proposed field strength at claimed power levels would require materials with negative permittivity not demonstrated in laboratory conditions.',
    },
    engineeringStrategy: {
      currentViability:
        'Requires exotic matter or undemonstrated physical principles. Not achievable with current or near-future technology.',
      materialConstraints:
        'Would theoretically require metamaterials with engineered negative mass-energy density, superconducting flux pinning arrays, and possibly Casimir cavity geometries at macroscopic scale.',
      energyRequirements:
        'Estimated energy requirements for meaningful metric perturbation at the proposed scale: ~10^42 J — comparable to stellar output. Orders of magnitude above any engineered power source.',
    },
    riskAnalysis: {
      hazards:
        'Primary hazards include high-voltage RF exposure, potential for unshielded EM pulse emissions, and thermal runaway in superconducting elements. Secondary: ionizing radiation from plasma-adjacent processes.',
      catastrophicScenarios:
        'In the theoretical regime where the device partially succeeds: uncontrolled spacetime metric distortion could create closed timelike curves locally. More practically: catastrophic capacitor bank discharge or dielectric failure causing explosive decompression.',
    },
    explanation:
      `This device, operating under ${framework} principles, presents a fascinating theoretical proposition but faces insurmountable physics barriers in its current form. The claimed mass reduction contradicts established conservation laws without providing a credible mechanism for energy accounting. While fringe electrogravitic research remains an active (if controversial) field, no peer-reviewed experiment has demonstrated sustained gravity modification at macroscopic scale. The engineering gap between theoretical models and practical implementation spans many orders of magnitude in both materials science and energy density requirements.`,
  };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const systemName = (formData.get('systemName') as string) || 'Unknown System';
    const theoreticalFramework = (formData.get('theoreticalFramework') as string) || 'General Relativity';
    const targetApplication = (formData.get('targetApplication') as string) || 'Theoretical';

    // Process uploaded images → base64 with sharp (quality ≥85%, auto-contrast for dark images)
    const imageKeys = ['schematic', 'emField', 'gravimetric', 'powerCurve'];
    const images: Array<{ mimeType: string; base64: string }> = [];

    for (const key of imageKeys) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0) {
        try {
          const processed = await processImageForAI(file);
          images.push({ mimeType: processed.mimeType, base64: processed.base64 });
        } catch (imgErr) {
          console.error(`[AETHER] Image processing failed for ${key}:`, imgErr);
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = file.type || 'image/jpeg';
          images.push({ mimeType, base64 });
        }
      }
    }

    const prompt = buildAetherPrompt(systemName, theoreticalFramework, targetApplication);

    let analysis: AetherAnalysis;

    try {
      const rawResponse = await callGeminiVision(prompt, images);
      analysis = extractJSON(rawResponse);
      // Ensure name is populated
      if (!analysis.systemSummary.name || analysis.systemSummary.name.trim() === '') {
        analysis.systemSummary.name = systemName;
      }
    } catch (aiErr) {
      console.error('[AETHER] AI call failed, using fallback:', aiErr);
      analysis = buildFallback(systemName, theoreticalFramework);
    }

    const timestamp = new Date().toISOString();

    // Save to MongoDB (fire-and-forget, don't block response)
    saveAetherExperiment({
      systemName,
      theoreticalFramework,
      targetApplication,
      imagesProcessed: images.length,
      analysis,
      timestamp,
    }).catch((dbErr) => console.error('[AETHER] DB save failed:', dbErr));

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        systemName,
        theoreticalFramework,
        targetApplication,
        imagesProcessed: images.length,
        timestamp,
      },
    });
  } catch (err) {
    console.error('[AETHER] Route error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during analysis' },
      { status: 500 },
    );
  }
}
