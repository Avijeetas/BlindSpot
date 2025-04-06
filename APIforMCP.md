# "What Am I Missing.com?" API Documentation

## Overview
This project provides AI-generated summaries and perspectives on various topics, helping users understand different viewpoints based on their inputs like age, gender, and location. The APIs are designed to retrieve real-time news and provide summarized content or compare different perspectives on a given topic.

---

## APIs

### 1. **News Summary API**
- **Endpoint:** `http://your_server:8000/news-summary`
- **Method:** `POST`
- **Description:** Fetches a summarized article based on a given topic and user details.
  
#### **Parameters:**
- **topic** (string): The topic of interest (e.g., "Vegan Diet").
- **prompt** (string): The specific prompt to summarize (e.g., "Vegan Diet is Healthy?, provide 1 source").
- **age** (integer): The age of the user (e.g., 25).
- **gender** (string): The gender of the user (e.g., "female").
- **location** (string): The location of the user (e.g., "California").

#### **Example Request:**
```json
{
  "topic": "Vegan Diet",
  "prompt": "Vegan Diet is Healthy?, provide 1 source",
  "age": 25,
  "gender": "female",
  "location": "California"
}
```
2. Debate News Summary API
Endpoint: http://your_server:8000/debate-news-summary

Method: POST

Description: Provides a summary of news articles with a comparison of different perspectives based on the user’s input.

Parameters:
topic (string): The topic of interest (e.g., "Vegan Diet").

prompt (string): The prompt to be debated (e.g., "Vegan Diet is Healthy").

age (integer): The age of the user (e.g., 25).

gender (string): The gender of the user (e.g., "female").

location (string): The location of the user (e.g., "California").

Example Request:
```
json

{
  "topic": "Vegan Diet",
  "prompt": "Vegan Diet is Healthy",
  "age": 25,
  "gender": "female",
  "location": "California"
}
```
3. Buzzwords API
Endpoint: http://your_server:8000/buzzwords

Method: POST

Description: Fetches trending buzzwords related to a specific topic.

Parameters:
topic (string): The topic for which to retrieve trending buzzwords (e.g., "Trade").

Example Request:
```
json
{
  "topic": "Trade"
}
```
4. Trends API
Endpoint: http://your_server:8000/trends

Method: POST

Description: Retrieves trends and summaries related to a specific topic and user context.

Parameters:
topic (string): The topic of interest (e.g., "Vegan Diet").

prompt (string): The prompt to summarize (e.g., "Vegan Diet is Healthy").

age (integer): The age of the user (e.g., 25).

gender (string): The gender of the user (e.g., "female").

location (string): The location of the user (e.g., "California").

Example Request:
```
json
{
  "topic": "Vegan Diet",
  "prompt": "Vegan Diet is Healthy",
  "age": 25,
  "gender": "female",
  "location": "California"
}
```
Usage
Make a POST request to the appropriate endpoint.

Pass the required parameters in the body of the request.

Receive the response containing the summary, debate perspective, buzzwords, or trends.

Notes
Ensure that the API server is running in your server at port:8000.

Each endpoint is designed to respond with AI-generated content based on the context provided by the user.

Use these APIs to generate personalized, context-aware summaries and analysis based on news articles, trends, and user interests.
