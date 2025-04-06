# "What Am I Missing.com?" API Documentation

## Overview
This project provides AI-generated summaries and perspectives on various topics, helping users understand different viewpoints based on their inputs like age, gender, and location. The APIs are designed to retrieve real-time news and provide summarized content or compare different perspectives on a given topic.

---

## APIs

### 1. **News Summary API**
- **Endpoint:** `http://0.0.0.0:8000/news-summary`
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
