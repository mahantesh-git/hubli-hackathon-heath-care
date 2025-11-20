/**
 * Health Insights Utilities
 * Functions for extracting keywords, generating insights, and recommending doctors
 */

export interface HealthInsights {
    keywords: string[];
    generalInsight: string;
    deepInsight: string;
    doctorRecommendation: {
        specialty: string;
        reason: string;
        alternativeSpecialties?: string[];
    };
}

/**
 * Extract medical keywords from conditions and symptoms
 */
export const extractKeywords = (
    conditions: string[],
    symptoms: any[]
): string[] => {
    const keywords = new Set<string>();

    // Extract from conditions
    conditions.forEach((condition) => {
        const words = condition
            .split(/[\s,]+/)
            .filter((word) => word.length > 3)
            .map((word) => word.replace(/[^\w]/g, ""));
        words.forEach((word) => keywords.add(word));
    });

    // Extract from symptoms
    symptoms.forEach((symptom) => {
        const words = symptom.name
            .split(/[\s,]+/)
            .filter((word: string) => word.length > 3)
            .map((word: string) => word.replace(/[^\w]/g, ""));
        words.forEach((word: string) => keywords.add(word));
    });

    return Array.from(keywords).slice(0, 8); // Limit to 8 keywords
};

/**
 * Generate general insight (brief overview)
 */
export const generateGeneralInsight = (
    conditions: string[],
    severity: string,
    urgencyLevel: string
): string => {
    const mainCondition = conditions[0] || "General Health Concern";

    if (urgencyLevel === "emergency") {
        return `Your symptoms suggest ${mainCondition.toLowerCase()}, which requires immediate medical attention. Please seek emergency care right away.`;
    } else if (urgencyLevel === "consult_doctor") {
        return `Based on your ${severity} symptoms, you may be experiencing ${mainCondition.toLowerCase()}. It's recommended to consult a healthcare professional soon.`;
    } else {
        return `Your symptoms indicate ${mainCondition.toLowerCase()}, which can typically be managed with self-care and monitoring. Watch for any worsening symptoms.`;
    }
};

/**
 * Generate deep insight (detailed analysis)
 */
export const generateDeepInsight = (
    conditions: string[],
    symptoms: any[],
    severity: string,
    urgencyLevel: string,
    suggestionText: string
): string => {
    const mainCondition = conditions[0] || "General Health Concern";
    const symptomList = symptoms.map((s) => s.name).join(", ");

    let insight = `**Detailed Analysis:**\n\n`;
    insight += `Your reported symptoms (${symptomList}) suggest a possible case of ${mainCondition}. `;

    if (conditions.length > 1) {
        insight += `Other potential conditions include: ${conditions.slice(1).join(", ")}. `;
    }

    insight += `\n\n**Severity Assessment:** Your symptoms are classified as ${severity}. `;

    if (urgencyLevel === "emergency") {
        insight += `This is a high-priority situation requiring immediate medical intervention. Do not delay seeking care.\n\n`;
        insight += `**When to Seek Immediate Care:**\n`;
        insight += `- If symptoms worsen rapidly\n`;
        insight += `- If you experience difficulty breathing, chest pain, or severe pain\n`;
        insight += `- If you develop confusion or loss of consciousness\n`;
    } else if (urgencyLevel === "consult_doctor") {
        insight += `While not an emergency, professional medical evaluation is recommended within 24-48 hours.\n\n`;
        insight += `**What to Monitor:**\n`;
        insight += `- Any worsening of current symptoms\n`;
        insight += `- Development of new symptoms\n`;
        insight += `- Fever above 101°F (38.3°C)\n`;
        insight += `- Symptoms lasting more than a week\n`;
    } else {
        insight += `This condition can often be managed with self-care, but monitor your symptoms closely.\n\n`;
        insight += `**Self-Care Tips:**\n`;
        insight += `- Get adequate rest and stay hydrated\n`;
        insight += `- Follow the recommended precautions\n`;
        insight += `- Keep track of symptom progression\n`;
        insight += `- Consult a doctor if symptoms persist beyond 3-5 days\n`;
    }

    insight += `\n**Important Note:** ${suggestionText}`;

    return insight;
};

/**
 * Map conditions to appropriate medical specialties
 */
export const getDoctorRecommendation = (
    conditions: string[],
    symptoms: any[],
    urgencyLevel: string
): {
    specialty: string;
    reason: string;
    alternativeSpecialties?: string[];
} => {
    const mainCondition = conditions[0]?.toLowerCase() || "";
    const symptomNames = symptoms.map((s) => s.name.toLowerCase()).join(" ");
    const combinedText = `${mainCondition} ${symptomNames}`;

    // Emergency cases
    if (urgencyLevel === "emergency") {
        return {
            specialty: "Emergency Medicine",
            reason: "Your symptoms require immediate emergency care",
            alternativeSpecialties: ["Emergency Room", "Urgent Care"],
        };
    }

    // Respiratory conditions
    if (
        combinedText.includes("respiratory") ||
        combinedText.includes("breathing") ||
        combinedText.includes("cough") ||
        combinedText.includes("asthma") ||
        combinedText.includes("bronchitis") ||
        combinedText.includes("pneumonia") ||
        combinedText.includes("lung")
    ) {
        return {
            specialty: "Pulmonologist",
            reason: "Specializes in respiratory and lung conditions",
            alternativeSpecialties: ["General Physician", "Internal Medicine"],
        };
    }

    // Cardiac conditions
    if (
        combinedText.includes("heart") ||
        combinedText.includes("cardiac") ||
        combinedText.includes("chest pain") ||
        combinedText.includes("palpitation") ||
        combinedText.includes("blood pressure")
    ) {
        return {
            specialty: "Cardiologist",
            reason: "Specializes in heart and cardiovascular conditions",
            alternativeSpecialties: ["General Physician", "Internal Medicine"],
        };
    }

    // Digestive/GI conditions
    if (
        combinedText.includes("stomach") ||
        combinedText.includes("digestive") ||
        combinedText.includes("abdominal") ||
        combinedText.includes("nausea") ||
        combinedText.includes("diarrhea") ||
        combinedText.includes("constipation") ||
        combinedText.includes("gastro")
    ) {
        return {
            specialty: "Gastroenterologist",
            reason: "Specializes in digestive system disorders",
            alternativeSpecialties: ["General Physician", "Internal Medicine"],
        };
    }

    // Neurological conditions
    if (
        combinedText.includes("headache") ||
        combinedText.includes("migraine") ||
        combinedText.includes("dizzy") ||
        combinedText.includes("neurological") ||
        combinedText.includes("seizure") ||
        combinedText.includes("nerve")
    ) {
        return {
            specialty: "Neurologist",
            reason: "Specializes in nervous system and brain conditions",
            alternativeSpecialties: ["General Physician", "Internal Medicine"],
        };
    }

    // Dermatological conditions
    if (
        combinedText.includes("skin") ||
        combinedText.includes("rash") ||
        combinedText.includes("dermat") ||
        combinedText.includes("itch") ||
        combinedText.includes("acne")
    ) {
        return {
            specialty: "Dermatologist",
            reason: "Specializes in skin conditions and disorders",
            alternativeSpecialties: ["General Physician"],
        };
    }

    // Musculoskeletal conditions
    if (
        combinedText.includes("joint") ||
        combinedText.includes("muscle") ||
        combinedText.includes("bone") ||
        combinedText.includes("arthritis") ||
        combinedText.includes("back pain") ||
        combinedText.includes("orthopedic")
    ) {
        return {
            specialty: "Orthopedist",
            reason: "Specializes in bone, joint, and muscle conditions",
            alternativeSpecialties: ["Rheumatologist", "General Physician"],
        };
    }

    // ENT conditions
    if (
        combinedText.includes("ear") ||
        combinedText.includes("nose") ||
        combinedText.includes("throat") ||
        combinedText.includes("sinus") ||
        combinedText.includes("tonsil")
    ) {
        return {
            specialty: "ENT Specialist (Otolaryngologist)",
            reason: "Specializes in ear, nose, and throat conditions",
            alternativeSpecialties: ["General Physician"],
        };
    }

    // Endocrine conditions
    if (
        combinedText.includes("diabetes") ||
        combinedText.includes("thyroid") ||
        combinedText.includes("hormone") ||
        combinedText.includes("endocrine")
    ) {
        return {
            specialty: "Endocrinologist",
            reason: "Specializes in hormonal and metabolic disorders",
            alternativeSpecialties: ["General Physician", "Internal Medicine"],
        };
    }

    // Mental health
    if (
        combinedText.includes("anxiety") ||
        combinedText.includes("depression") ||
        combinedText.includes("mental") ||
        combinedText.includes("stress") ||
        combinedText.includes("psychiatric")
    ) {
        return {
            specialty: "Psychiatrist or Psychologist",
            reason: "Specializes in mental health and emotional well-being",
            alternativeSpecialties: ["General Physician", "Counselor"],
        };
    }

    // Infectious diseases
    if (
        combinedText.includes("fever") ||
        combinedText.includes("infection") ||
        combinedText.includes("viral") ||
        combinedText.includes("bacterial")
    ) {
        return {
            specialty: "General Physician",
            reason: "Can diagnose and treat common infections and fevers",
            alternativeSpecialties: ["Infectious Disease Specialist", "Internal Medicine"],
        };
    }

    // Default to General Physician
    return {
        specialty: "General Physician",
        reason: "Can provide comprehensive evaluation and treatment for your symptoms",
        alternativeSpecialties: ["Internal Medicine", "Family Medicine"],
    };
};

/**
 * Generate complete health insights
 */
export const generateHealthInsights = (
    conditions: string[],
    symptoms: any[],
    severity: string,
    urgencyLevel: string,
    suggestionText: string
): HealthInsights => {
    const keywords = extractKeywords(conditions, symptoms);
    const generalInsight = generateGeneralInsight(conditions, severity, urgencyLevel);
    const deepInsight = generateDeepInsight(
        conditions,
        symptoms,
        severity,
        urgencyLevel,
        suggestionText
    );
    const doctorRecommendation = getDoctorRecommendation(
        conditions,
        symptoms,
        urgencyLevel
    );

    return {
        keywords,
        generalInsight,
        deepInsight,
        doctorRecommendation,
    };
};
