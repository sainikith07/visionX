# VISION-X AI Suite
**Professional AI-Powered Visual Refinement Platform**

## 1. Problem Statement
In modern digital workflows, visual assets often suffer from "visual noise" that degrades professionalism and privacy:
- **Document Obstructions:** Physical scans frequently contain shadows, glares, or human fingers that prevent clean OCR and archiving.
- **Visual Clutter in Real Estate:** Emptying a space for staging is manually intensive and requires high-end editing skills.
- **Privacy in Video:** Traditional background blurring is imprecise; users need the ability to selectively "cloak" specific objects in a scene while maintaining a natural background.

## 2. Abstract
VISION-X is a high-performance SaaS suite that leverages **Gemini 2.5 Flash-Image** (a Multimodal Transformer model) to automate complex image inpainting and document restoration. By combining a React-based interactive canvas with state-of-the-art generative AI, VISION-X allows users to remove obstructions from documents, stage empty rooms, and apply "Adaptive Cloaking" to video feeds with zero-shot learning.

## 3. Introduction
The platform provides an intuitive, professional interface (Glassmorphism UI) for three core modules. Unlike traditional tools that require manual cloning and healing, VISION-X uses "Visual Prompting"—where user brush strokes are converted into attention masks for a remote Vision-Language Model (VLM) to reconstruct the background with context-aware textures.

## 4. Requirements
### Software
- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **Engine:** Google Generative AI SDK (`@google/genai`).
- **Environment:** Node.js 18+, Modern Web Browser (Chrome/Edge/Safari).
- **API:** Google Gemini API Key.

### Hardware
- **Processor:** Dual-core 2GHz+ (Quad-core recommended for video sync).
- **Camera:** 720p/1080p Web-Cam for Live AI module.
- **Network:** High-speed internet for low-latency AI inference.

## 5. System Architecture
The application utilizes a **Client-Side Orchestration** model:
1. **Media Interface:** Captures raw pixels from user uploads or live `getUserMedia` streams.
2. **Interactive Masking Layer:** An HTML5 Canvas allows users to draw "Attention Masks" (Red high-frequency features).
3. **Inference Service:** Packages the image and mask into a multimodal payload for the Gemini 2.5 Flash model.
4. **Adaptive Compositing:** For video, the AI generates a "Clean Plate" which is layered over the live feed using a `requestAnimationFrame` loop.

## 6. Machine Learning & Algorithms
### Model: Gemini 2.5 Flash-Image
We utilize the **Gemini 2.5 Flash-Image** model, a multimodal transformer optimized for speed and visual reconstruction.

### Working Mechanism & Algos:
1. **Preprocessing (Feature Engineering):**
   - **Visual Prompting:** We draw high-saturation Red Masks (#FF0000). To the model’s visual encoder, these pixels act as "out-of-distribution" markers that indicate the region of interest for deletion.
2. **Target Detection:**
   - The model doesn't use a fixed detector like YOLO. Instead, it uses **Cross-Attention**. It aligns the text prompt ("Remove the red marked object") with the visual tokens of the image to identify exactly which pixels to replace.
3. **Generative Inpainting Algorithm:**
   - **Contextual Synthesis:** The model analyzes pixels outside the mask (Context) to predict the texture, lighting, and geometry behind the object.
   - **Structural Continuity:** The algorithm ensures that lines (like floorboards or wall edges) passing through the mask are reconstructed with mathematical alignment on the other side.
4. **Motion Drift Detection (Video AI):**
   - A custom **Pixel-Variance Algorithm** compares a 40x40 sample of the current frame against a cached frame. If the variance exceeds a specific threshold (Drift > 9000), the system flags a "Motion Warning," indicating the AI background no longer aligns with the camera's physical position.

## 7. Modules Description
- **Document Master:** Uses de-noising logic to separate foreground text from background artifacts (fingers/shadows).
- **Home Staging:** Implements multi-object inpainting to replace furniture with structural textures (hardwood/marble).
- **Video AI:** Performs "Temporal Inpainting" by generating a static clean plate and compositing it over dynamic feeds.

---
**Developed by:** Sai Nikith  
**Institution:** ACE Engineering College  
**Tech Stack:** React, TypeScript, Gemini AI API
