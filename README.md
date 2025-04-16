# **What Am I Missing.com?**
by Team Blindspot

## 👥 Team Members
| Name                   | Program     | LinkedIn |
|------------------------|-------------|----------|
| Sai Charan Merugu      | MS Computer Science (CS) | [@sai-charan-merugu-6a44ab225](https://www.linkedin.com/in/sai-charan-merugu-6a44ab225/) |
| Sara Santillanes       | MS Applied Data and Technology Analytics (ADTA) | [@sara-g-santillanes](https://www.linkedin.com/in/sara-g-santillanes/) |
| Naga Sai Sivani Tutika | MS Artificial Intelligence (AI) | [@sivani-tutika](https://www.linkedin.com/in/sivani-tutika/) |
| Vennela Balagala       | MS Computer Science (CS) | [@vennela-balagala](https://www.linkedin.com/in/vennela-balagala/) |
| Avijeet Shil           | PhD Computer Science (CS) | [@avijeetshil](https://www.linkedin.com/in/avijeetshil/) |



This project is part of [GrandinnoHack Interdesciplinary Graduate Hackathon](https://www.gradinnohack.com/)

GradinnoHack Table Choices:
| Category      | Details             |
|---------------|---------------------|
| Tech & Skills | AI for Social Good  |
| Impact Area   | Media Literacy      |
| User Group    | Youth & Students    |

## Problem Statement

Digital platforms increasingly shape the way we consume news by tailoring content through algorithms, often limiting exposure to diverse perspectives. This results in people of different political orientations, age groups, or media ecosystems having fundamentally different understandings of current events, contributing to social fragmentation and declining media literacy.

## Proposed Solution
We developed a website where users can input biographical information and a topic of interest. In return, they receive:

- A curated collection of articles.
- An AI-generated summary highlighting the differences between their likely perspective and an alternative viewpoint.

## 🛠️ Implementation Overview

### 🔧 Tools & Technologies

- **Frontend:** Next.js  
- **Backend:** Python, FastAPI  
- **Database:** Supabase  

### 🧠 Model Context Protocol (MCP)-Inspired Architecture

#### Backend Framework
- **FastAPI** – A lightweight and efficient web framework for handling API requests.

#### Summarization Model
- **BART (Bidirectional and Auto-Regressive Transformer)** – A pre-trained model used for generating concise and coherent article summaries.

#### Search & Retrieval
- **Faiss + TF-IDF** – Enables vector-based indexing and semantic search for relevant content.

#### Real-time News Fetching
- **Google Serper API** – Used to query up-to-date news based on user input.

#### Scraping & Content Extraction
- **Newspaper3k** – Extracts full-text content from article URLs.  
- **Playwright** – Acts as a fallback for browser-based scraping when standard extraction fails.

### 🔄 User Flow

1. **User Input:** The user provides their biographical info and topic of interest.
2. **Context Fetching:** Relevant news is retrieved using the Google Server API.
3. **Content Extraction:** Full article content is extracted via Newspaper3k or Playwright.
4. **Summarization:** Articles are summarized using the BART model.
5. **Perspective Modeling:** The system generates summaries based on the user’s likely perspective and contrasts it with an alternative view.
6. **Faiss Indexing:** Summaries and metadata are indexed using Faiss for efficient retrieval.
7. **JSON Output:** Final output is returned in structured JSON format for display or further processing.

### 🧩 Modular Architecture

- **Composable Routes:** Modular, context-aware backend components that adapt to varying user input and task types.
- **Agentic Programming:** Inspired by MCP, layering context-specific prompts to improve the quality and relevance of AI-generated summaries.


Here’s how you can structure the markdown to include an option to extend for additional details or features:


## Running the Next.js Project and Python Backend

Follow the steps below to run the Next.js project and start the Python backend:

### 1. **Clone the Repository** (if you haven't already):
   ```bash
   git clone <your-repository-url>
   cd blind-spot
   ```

### 2. **Install Dependencies for Next.js Frontend:**
   ```bash
   npm install
   ```

### 3. **Build the Next.js Project:**
   ```bash
   npm run build
   ```

### 4. **Start the Next.js Development Server:**
   ```bash
   npm start
   ```

Your Next.js app should now be running on `http://your_backend_server:3000`.

---

### 5. **Start the Python Backend using Uvicorn:**
To run the Python backend, use the following command:

   ```bash
   uvicorn app:app --reload --port 8000
   ```

This will start the FastAPI server at `http://your_backend_server:8000`, where the APIs are available.




