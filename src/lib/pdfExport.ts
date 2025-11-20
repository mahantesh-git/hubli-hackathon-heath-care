import jsPDF from "jspdf";
import type { HealthInsights } from "./healthInsights";

interface SymptomCheck {
    id: string;
    symptoms: any[];
    severity: string;
    duration_value: number;
    duration_unit: string;
    body_area?: string | null;
    created_at: string;
}

interface Suggestion {
    suggestions_text: string;
    urgency_level: string;
    possible_conditions?: any[] | null;
    home_remedies?: any[] | null;
}

/**
 * Export a single symptom check result to PDF
 */
export const exportResultToPDF = async (
    check: SymptomCheck,
    suggestion: Suggestion,
    insights?: HealthInsights
) => {
    try {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header
        pdf.setFillColor(59, 130, 246); // Primary blue
        pdf.rect(0, 0, pageWidth, 40, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.text("HealthCheck", 20, 20);

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text("Symptom Check Report", 20, 30);

        // Reset text color
        pdf.setTextColor(0, 0, 0);
        yPosition = 50;

        // Date
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
            `Generated: ${new Date().toLocaleString()}`,
            pageWidth - 20,
            yPosition,
            { align: "right" }
        );
        yPosition += 10;

        // Check Date
        pdf.text(
            `Check Date: ${new Date(check.created_at).toLocaleString()}`,
            pageWidth - 20,
            yPosition,
            { align: "right" }
        );
        yPosition += 15;

        // Urgency Level
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0);
        pdf.text("Urgency Level", 20, yPosition);
        yPosition += 7;

        const urgencyColor: [number, number, number] =
            suggestion.urgency_level === "emergency"
                ? [239, 68, 68]
                : suggestion.urgency_level === "consult_doctor"
                    ? [245, 158, 11]
                    : [34, 197, 94];

        pdf.setFillColor(urgencyColor[0], urgencyColor[1], urgencyColor[2]);
        pdf.roundedRect(20, yPosition, 60, 10, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text(
            suggestion.urgency_level.replace("_", " ").toUpperCase(),
            50,
            yPosition + 7,
            { align: "center" }
        );
        yPosition += 20;

        // Symptoms Section
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Reported Symptoms", 20, yPosition);
        yPosition += 7;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        check.symptoms.forEach((symptom: any) => {
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = 20;
            }
            pdf.setFillColor(59, 130, 246, 0.1 * 255);
            pdf.roundedRect(20, yPosition, 80, 8, 2, 2, "F");
            pdf.setTextColor(59, 130, 246);
            pdf.text(`• ${symptom.name}`, 23, yPosition + 5.5);
            yPosition += 10;
        });
        yPosition += 5;

        // Severity and Duration
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`Severity: ${check.severity}`, 20, yPosition);
        yPosition += 7;
        pdf.text(
            `Duration: ${check.duration_value} ${check.duration_unit}`,
            20,
            yPosition
        );
        yPosition += 15;

        // Keywords Section (if insights available)
        if (insights && insights.keywords.length > 0) {
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Medical Keywords", 20, yPosition);
            yPosition += 7;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            const keywordsText = insights.keywords.join(" • ");
            const keywordLines = pdf.splitTextToSize(keywordsText, pageWidth - 40);
            keywordLines.forEach((line: string) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.setTextColor(59, 130, 246);
                pdf.text(line, 20, yPosition);
                yPosition += 5;
            });
            yPosition += 10;
        }

        // All Likely Conditions
        if (suggestion.possible_conditions && suggestion.possible_conditions.length > 0) {
            if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Likely Conditions", 20, yPosition);
            yPosition += 7;

            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            suggestion.possible_conditions.forEach((condition: string, index: number) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.setTextColor(index === 0 ? 59 : 100, index === 0 ? 130 : 100, index === 0 ? 246 : 100);
                pdf.text(`${index + 1}. ${condition}`, 20, yPosition);
                yPosition += 6;
            });
            yPosition += 10;
        }

        // Doctor Recommendation (if insights available)
        if (insights && insights.doctorRecommendation) {
            if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Recommended Doctor Type", 20, yPosition);
            yPosition += 7;

            pdf.setFontSize(11);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(34, 197, 94);
            pdf.text(insights.doctorRecommendation.specialty, 20, yPosition);
            yPosition += 6;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Reason: ${insights.doctorRecommendation.reason}`, 20, yPosition);
            yPosition += 6;

            if (insights.doctorRecommendation.alternativeSpecialties &&
                insights.doctorRecommendation.alternativeSpecialties.length > 0) {
                pdf.setTextColor(100, 100, 100);
                pdf.text(
                    `Alternatives: ${insights.doctorRecommendation.alternativeSpecialties.join(", ")}`,
                    20,
                    yPosition
                );
                yPosition += 10;
            }
            yPosition += 5;
        }

        // General Insight (if available)
        if (insights && insights.generalInsight) {
            if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("General Insight", 20, yPosition);
            yPosition += 7;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            const generalLines = pdf.splitTextToSize(insights.generalInsight, pageWidth - 40);
            generalLines.forEach((line: string) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.text(line, 20, yPosition);
                yPosition += 5;
            });
            yPosition += 10;
        }

        // AI Analysis
        if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = 20;
        }

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("AI Analysis", 20, yPosition);
        yPosition += 7;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const splitText = pdf.splitTextToSize(
            suggestion.suggestions_text,
            pageWidth - 40
        );
        splitText.forEach((line: string) => {
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
            }
            pdf.text(line, 20, yPosition);
            yPosition += 5;
        });
        yPosition += 10;

        // Deep Insight (if available)
        if (insights && insights.deepInsight) {
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Detailed Insight", 20, yPosition);
            yPosition += 7;

            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            const deepLines = pdf.splitTextToSize(insights.deepInsight, pageWidth - 40);
            deepLines.forEach((line: string) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.text(line, 20, yPosition);
                yPosition += 4;
            });
            yPosition += 10;
        }

        // Home Remedies / Precautions
        if (suggestion.home_remedies && suggestion.home_remedies.length > 0) {
            if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Key Precautions", 20, yPosition);
            yPosition += 7;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            suggestion.home_remedies.forEach((remedy: string) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                const remedyText = pdf.splitTextToSize(`✓ ${remedy}`, pageWidth - 40);
                remedyText.forEach((line: string) => {
                    pdf.text(line, 20, yPosition);
                    yPosition += 5;
                });
                yPosition += 3;
            });
        }

        // Footer / Disclaimer
        const disclaimerY = pageHeight - 25;
        pdf.setFillColor(245, 158, 11, 0.1 * 255);
        pdf.rect(0, disclaimerY - 5, pageWidth, 30, "F");

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "italic");
        const disclaimer =
            "Medical Disclaimer: This tool provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician with any questions about a medical condition.";
        const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
        let disclaimerY2 = disclaimerY;
        disclaimerLines.forEach((line: string) => {
            pdf.text(line, 20, disclaimerY2);
            disclaimerY2 += 4;
        });

        // Save PDF
        const fileName = `HealthCheck_Report_${new Date(check.created_at)
            .toISOString()
            .split("T")[0]}.pdf`;
        pdf.save(fileName);

        return true;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
};

/**
 * Export health history to PDF
 */
export const exportHistoryToPDF = async (checks: SymptomCheck[]) => {
    try {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header
        pdf.setFillColor(59, 130, 246);
        pdf.rect(0, 0, pageWidth, 40, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.text("HealthCheck", 20, 20);

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text("Health History Report", 20, 30);

        pdf.setTextColor(0, 0, 0);
        yPosition = 50;

        // Date
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
            `Generated: ${new Date().toLocaleString()}`,
            pageWidth - 20,
            yPosition,
            { align: "right" }
        );
        yPosition += 5;

        pdf.text(
            `Total Checks: ${checks.length}`,
            pageWidth - 20,
            yPosition,
            { align: "right" }
        );
        yPosition += 15;

        // Statistics
        const stats = {
            severe: checks.filter((c) => c.severity === "severe").length,
            moderate: checks.filter((c) => c.severity === "moderate").length,
            mild: checks.filter((c) => c.severity === "mild").length,
        };

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Summary Statistics", 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Severe Cases: ${stats.severe}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Moderate Cases: ${stats.moderate}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Mild Cases: ${stats.mild}`, 20, yPosition);
        yPosition += 15;

        // Checks List
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Health Check History", 20, yPosition);
        yPosition += 10;

        checks.forEach((check, index) => {
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 20;
            }

            // Check number and date
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text(`Check #${checks.length - index}`, 20, yPosition);
            yPosition += 6;

            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text(
                new Date(check.created_at).toLocaleString(),
                20,
                yPosition
            );
            yPosition += 8;

            // Severity badge
            const severityColor: [number, number, number] =
                check.severity === "severe"
                    ? [239, 68, 68]
                    : check.severity === "moderate"
                        ? [245, 158, 11]
                        : [34, 197, 94];

            pdf.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
            pdf.roundedRect(20, yPosition, 30, 6, 1, 1, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.text(check.severity.toUpperCase(), 35, yPosition + 4, {
                align: "center",
            });
            yPosition += 10;

            // Symptoms
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.text("Symptoms:", 20, yPosition);
            yPosition += 5;

            check.symptoms.forEach((symptom: any) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.text(`• ${symptom.name}`, 25, yPosition);
                yPosition += 5;
            });

            yPosition += 3;
            pdf.text(
                `Duration: ${check.duration_value} ${check.duration_unit}`,
                20,
                yPosition
            );
            yPosition += 10;

            // Separator
            pdf.setDrawColor(200, 200, 200);
            pdf.line(20, yPosition, pageWidth - 20, yPosition);
            yPosition += 10;
        });

        // Footer
        const disclaimerY = pageHeight - 25;
        pdf.setFillColor(245, 158, 11, 0.1 * 255);
        pdf.rect(0, disclaimerY - 5, pageWidth, 30, "F");

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "italic");
        const disclaimer =
            "Medical Disclaimer: This tool provides general information only and is not a substitute for professional medical advice.";
        const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
        let disclaimerY2 = disclaimerY;
        disclaimerLines.forEach((line: string) => {
            pdf.text(line, 20, disclaimerY2);
            disclaimerY2 += 4;
        });

        // Save PDF
        const fileName = `HealthCheck_History_${new Date()
            .toISOString()
            .split("T")[0]}.pdf`;
        pdf.save(fileName);

        return true;
    } catch (error) {
        console.error("Error generating history PDF:", error);
        throw error;
    }
};
