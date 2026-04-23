# SafeBand – AI-Powered Women Safety Monitoring System

## 📌 Overview
SafeBand is an intelligent wearable safety system designed to enhance women’s safety through real-time monitoring of physiological and audio signals. The system detects potential danger or stress situations and automatically triggers alerts when necessary.

The solution integrates IoT hardware with AI-based audio analysis to identify distress signals such as screams or verbal calls for help.
It is an Ongoing Project, Current progress : https://gaurav-711.github.io/Safety_Band/
---

## 🚀 Features
- 📡 Real-time monitoring of vital signs (Heart Rate, SpO₂)
- 🎤 Automatic audio recording during abnormal conditions
- 🧠 AI-based distress detection using audio signals
- 🚨 Instant alert generation in case of danger
- 🌐 Language-independent distress recognition (multi-lingual support)

---

## 🧠 System Architecture

1. Wearable device detects abnormal vitals or stress signals  
2. Audio recording is triggered automatically  
3. Audio is passed through AI models:
   - Model 1: Detects if audio is a **scream/distress sound**
   - Model 2: Detects **verbal calls for help**
4. Final classification:
   - Distress detected → Alert triggered  
   - No distress → System remains inactive  

---

## 🤖 Machine Learning Approach

### 🔹 Stage 1: Sound Classification (Scream Detection)
- Input: Raw audio signal
- Output: `Scream` / `Non-Scream`

### 🔹 Stage 2: Help Detection (Speech-based)
- Input: Non-scream audio
- Output: `Help Request` / `Normal Speech`

---

## 🌍 Language-Independent Approach

Instead of relying on translation, the system uses **audio feature extraction techniques**:

- MFCC (Mel-Frequency Cepstral Coefficients)
- Spectrogram-based features
- Deep learning embeddings (CNN / RNN / Transformer-based models)

These features capture **patterns in sound**, not language, enabling the model to generalize across:
- Hindi  
- English  
- Bengali  
- Other languages  

---

## 📊 Datasets Used
- 🎧 Scream/Distress audio dataset  
- 🗣️ Bengali female voice dataset (help-related phrases)  
- (Optional) Multi-language speech datasets for better generalization  

---

## 🛠️ Tech Stack
- Python  
- Machine Learning (Scikit-learn / TensorFlow / PyTorch)  
- Audio Processing (Librosa)  
- IoT Integration (Raspberry Pi / Sensors)  
- Web Interface (HTML, CSS, JavaScript)  

---

## ⚙️ Workflow



<img width="1440" height="1996" alt="image" src="https://github.com/user-attachments/assets/d8c18ba9-81e9-48c3-929c-c4eef5f0b2fe" />

```text
Audio Input
     ↓
Feature Extraction (MFCC / Spectrogram)
     ↓
Model 1 → Scream Detection
     ↓
If NOT scream →
     ↓
Model 2 → Help Detection
     ↓
Final Output:
[Distress] or [Not Distress]



