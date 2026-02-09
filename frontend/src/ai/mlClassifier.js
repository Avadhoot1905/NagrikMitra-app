import * as tf from '@tensorflow/tfjs';

// Department mapping (ensure this matches your model's output classes)
const DEPARTMENTS = [
  "Public Works Department",
  "Water Board Department",
  "Sewage and Drainage Department",
  "Sanitation Department",
  "Traffic Department"
];

let model = null;

/**
 * Load the TensorFlow.js model
 * Call this once when the app initializes
 */
export async function loadModel() {
  if (model) return model;
  
  try {
    // Load the model from the public/models directory
    model = await tf.loadLayersModel('/models/civic_issue_imgmodel.keras/model.json');
    console.log('ML Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Failed to load ML model:', error);
    throw error;
  }
}

/**
 * Preprocess image for model input
 * @param {File} imageFile - The image file to preprocess
 * @returns {Promise<tf.Tensor>} Preprocessed image tensor
 */
async function preprocessImage(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext('2d');
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, 224, 224);
        
        // Convert to tensor and normalize
        const tensor = tf.browser.fromPixels(canvas)
          .toFloat()
          .div(255.0)  // Normalize to [0, 1]
          .expandDims(0);  // Add batch dimension
        
        resolve(tensor);
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Preprocess text inputs (title and description)
 * @param {string} title - Issue title
 * @param {string} description - Issue description
 * @returns {tf.Tensor} Processed text tensor (placeholder for now)
 */
function preprocessText(title, description) {
  // TODO: Implement proper text preprocessing based on your model's requirements
  // This is a placeholder - you'll need to match your model's text processing
  
  const combinedText = `${title} ${description}`.toLowerCase();
  
  // If your model uses text embeddings or tokenization, implement here
  // For now, returning null as the model might be image-only
  return null;
}

/**
 * Classify civic issue image using the ML model
 * @param {File} imageFile - The image file to classify
 * @param {string} issueTitle - The issue title
 * @param {string} issueDescription - The issue description
 * @returns {Promise<string>} The predicted department name
 */
export async function classifyImageML(imageFile, issueTitle = "", issueDescription = "") {
  try {
    // Ensure model is loaded
    if (!model) {
      await loadModel();
    }
    
    // Preprocess the image
    const imageTensor = await preprocessImage(imageFile);
    
    // Make prediction (image only for now)
    const predictions = await model.predict(imageTensor);
    const predictionData = await predictions.data();
    
    // Get the class with highest probability
    const maxIndex = predictionData.indexOf(Math.max(...predictionData));
    const confidence = predictionData[maxIndex];
    
    // Clean up tensors
    imageTensor.dispose();
    predictions.dispose();
    
    // Log for debugging
    if (import.meta.env.DEV) {
      console.log('ML Prediction:', {
        department: DEPARTMENTS[maxIndex],
        confidence: confidence,
        allProbabilities: Array.from(predictionData)
      });
    }
    
    // Return department name if confidence is above threshold
    const CONFIDENCE_THRESHOLD = 0.5;
    if (confidence >= CONFIDENCE_THRESHOLD) {
      return DEPARTMENTS[maxIndex];
    } else {
      console.warn('Low confidence prediction, returning Manual');
      return "Manual";
    }
    
  } catch (error) {
    console.error('ML Classification error:', error);
    return "Manual";
  }
}

/**
 * Unload the model to free memory (optional)
 */
export function unloadModel() {
  if (model) {
    model.dispose();
    model = null;
    console.log('ML Model unloaded');
  }
}