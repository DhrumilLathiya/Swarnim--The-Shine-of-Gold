# 💎 Swarnim – The Shining of Gold

An AI-powered jewellery customization platform that transforms traditional jewellery shopping into a digital, intelligent, and personalized experience.

---

## 🚀 Overview

Swarnim enables users to browse jewellery, customize designs using AI, and generate new jewellery designs based on their preferences. It reduces dependency on physical catalogues and supports a made-to-order model using advanced technologies like computer vision and generative AI.

---

## ✨ Key Features

### 🛍️ E-Commerce Features
- Browse Jewellery Catalogue  
- Add to Wishlist ❤️  
- Add to Cart 🛒  
- Share Jewellery Designs  
- Place Orders  

---

### 🎨 AI-Based Customization (Core Feature)
- Modify existing jewellery designs  
- AI detects jewellery components (rings, bands, stones)  
- Interactive customization through UI  

---

### ✏️ Annotation System
- Manually annotate undetected parts  
- Improves model accuracy over time  

---

### 🤖 AI Integration
- **Roboflow (ETR Model):** Jewellery component detection  
- **Gemini AI:** Generate new jewellery designs from prompts  

---

### 🧠 Smart Design Generation
- Generate designs using prompts  
- Combine original + annotated images  
- Visualize before manufacturing  

---

### 🏭 Made-to-Order System
- Convert generated designs into real jewellery  
- Reduces need for large catalogues  

---

## 🏗️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS  

### Backend
- Node.js  
- Express.js  

### AI & ML
- Roboflow (ETR Model)  
- Gemini API (Generative AI)  

### Data & Services
- Supabase (Database + Auth + Sessions)  
- Python (Web Scraping – BeautifulSoup, Requests)  

### Deployment
- Frontend: AWS S3  
- Backend: Render  

---

## 🔄 System Workflow

1. User browses jewellery catalogue  
2. Selects item → clicks **Modify Jewellery**  
3. Image is sent to backend  
4. **Roboflow (ETR)** detects components  
5. Components are highlighted  
6. User can:
   - Customize detected parts  
   - Annotate missing parts  
7. User enters prompt  
8. **Gemini AI** generates new design  
9. User previews design  
10. User places **made-to-order request**  

---

## 📊 AI Model Used

| Model | Purpose | Advantage |
|------|--------|----------|
| ETR  | Component Detection | High accuracy for complex jewellery designs |

---

## ⚠️ Limitations

- Complex AI-generated designs may not always be manufacturable  
- Detection accuracy depends on training data  
- Requires stable internet connection  
- High computational cost for AI processing  

---

## 🔮 Future Enhancements

- 3D Jewellery Visualization  
- Mobile Application (Android & iOS)  
- Design feasibility validation system  
- Human expert review for complex designs  
- Faster and more accurate AI models  

---

## 🧪 How to Run Locally

### 🔹 Clone Repository
```bash
git clone https://github.com/DhrumilLathiya/Swarnim--The-Shine-of-Gold.git
cd Swarnim--The-Shine-of-Gold

🔹 Run Frontend
cd Frontend/swarm-shine-main
npm install
npm run dev
🔹 Run Backend
cd backend_final
npm install
npm run dev


📁 Project Structure
Swarnim--The-Shine-of-Gold/
│
├── Frontend/                # React Frontend
│   └── swarm-shine-main/
│
├── backend_final/           # Node.js Backend
│   ├── src/
│   └── uploads/
│
├── inference/               # Model inference
├── training/                # Model training
├── notebooks/               # Experiments
├── scripts/                 # Web scraping scripts
│
├── requirements.txt
└── README.md
👨‍💻 Contributors
Lathiya Dhrumil – Frontend
Mehta Raj – Backend & Machine Learning
📌 Conclusion

Swarnim bridges the gap between traditional jewellery craftsmanship and modern AI technology, enabling users to design personalized jewellery digitally while supporting real-world manufacturing.
