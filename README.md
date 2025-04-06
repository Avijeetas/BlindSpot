# **What Am I Missing.com?**
by Team Blindspot

This project is part of GrandinnoHack Interdesciplinary Graduate Hackathon
GradinnoHack Table Choices:
| Category      | Details             |
|---------------|---------------------|
| Tech & Skills | AI for Social Good  |
| Impact Area   | Media Literacy      |
| User Group    | Youth & Students    |

##Problem Statement

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
- **Google Server API** – Used to query up-to-date news based on user input.

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



## 👥 Team Members

| Name                   | Program     |
|------------------------|-------------|
| Sai Charan Merugu      | MS Computer Science (CS) |
| Sara Santillanes       | MS Applied Data and Technology Analytics (ADTA) |
| Naga Sai Sivani Tutika | MS Artificial Intelligence (AI) |
| Vennela Balagala       | MS Computer Information Systems (CIS) |
| Avijeet Shil           | PhD Computer Science (CS) |

