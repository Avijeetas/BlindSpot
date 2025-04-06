"What Am I Missing.com?" by Team Blindspot
GradinnoHack Table Choices:
Tech & Skills: AI for Social Good

Impact Area: Media Literacy for Youth/Students

User Group: Youth, Students, and General Public

Problem Statement
Digital platforms increasingly shape the way we consume news by tailoring content through algorithms, often limiting exposure to diverse perspectives. This results in people of different political orientations, age groups, or media ecosystems having fundamentally different understandings of current events, contributing to social fragmentation and declining media literacy.

Proposed Solution
We developed a website where users can input biographical information and a topic of interest. In return, they receive:

A curated collection of articles.

An AI-generated summary highlighting the differences between their likely perspective and an alternative viewpoint.

Implementation
Tools:
Frontend: Next.js

Backend: Python, FastAPI

Database: Supabase

Model Context Protocol (MCP) Inspired Approach:
FastAPI: Lightweight backend framework.

BART Model: A pre-trained transformer model for summarization.

Faiss + TF-IDF: Used for indexing and vector embedding of the content for better retrieval.

Google Server API: Fetches real-time news content.

Scraping Layer:

Newspaper3k: Extracts the full content from articles.

Playwright: A fallback for browser automation if necessary (e.g., if the article is not directly accessible).

User Flow:
User Input: The user provides their biographical information and the topic of interest.

Context Fetching: Fetch context-aware news content using Google API.

News Content Retrieval: Articles are fetched using the Google Server API.

Summarization: The fetched articles are summarized using the BART model.

User Perspective: The system takes the user’s likely perspective into account and contrasts it with an alternative viewpoint.

Faiss Indexing: The content is indexed using Faiss for efficient and context-aware retrieval.

JSON Output: The output is returned in a structured JSON format for further processing or display.

Modular Architecture:
Composable Routes: The backend features modular, context-aware components that can be recombined to handle different tasks based on user input.

Agentic Programming: The backend is inspired by the MCP protocol, defining layers of context-aware prompting to enhance the quality of the AI-generated summaries.
