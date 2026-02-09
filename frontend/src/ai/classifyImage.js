// frontend/src/ai/classifyImage.js
// Updated to use the backend ML model API

import { getApiUrl } from "../utils/api";

/**
 * Classify an image using the backend ML model
 * @param {string} imageBase64 - Base64 encoded image (with or without data URL prefix)
 * @param {Function} getAuthHeaders - Function to get authentication headers
 * @returns {Promise<string>} - Predicted department name
 */
export async function classifyImage(imageBase64, getAuthHeaders = null) {
  try {
    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Add auth headers if available
    if (getAuthHeaders && typeof getAuthHeaders === "function") {
      const authHeaders = await getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    // Call the backend ML prediction endpoint
    const response = await fetch(getApiUrl("/ml/predict/"), {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        image_base64: imageBase64,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ML prediction failed:", errorData);
      
      // Log the error but don't throw - fall back to "Manual"
      console.warn("Falling back to Manual classification due to ML API error");
      return "Manual";
    }

    const result = await response.json();

    if (import.meta.env.DEV) {
      console.log("ML Prediction Result:", {
        department: result.department,
        confidence: result.confidence,
        allProbabilities: result.all_probabilities,
      });
    }

    // Return the predicted department
    // If confidence is too low, you could return "Manual" instead
    const CONFIDENCE_THRESHOLD = 0.3; // Adjust as needed
    
    if (result.confidence < CONFIDENCE_THRESHOLD) {
      console.warn(
        `Low confidence (${result.confidence.toFixed(2)}), defaulting to Manual`
      );
      return "Manual";
    }

    return result.department || "Manual";
    
  } catch (error) {
    console.error("Error calling ML classification API:", error);
    // Fall back to "Manual" if the API call fails
    return "Manual";
  }
}

/**
 * Get a user-friendly department name
 * @param {string} department - Internal department name
 * @returns {string} - Display-friendly department name
 */
export function getDepartmentDisplayName(department) {
  const departmentMap = {
    "Public Works Department": "Public Works Department (PWD)",
    "Water Board Department": "Water Board",
    "Sewage and Drainage Department": "Sewage & Drainage",
    "Sanitation Department": "Sanitation",
    "Traffic Department": "Traffic",
    "Manual": "Manual Classification",
  };

  return departmentMap[department] || department;
}