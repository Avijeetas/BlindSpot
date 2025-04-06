import json
import http.client
import asyncio
import re
from collections import Counter
from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from transformers import pipeline
from newspaper import Article
from playwright.async_api import async_playwright
from typing import Optional
app = FastAPI()
from sklearn.feature_extraction.text import TfidfVectorizer
import faiss
from dotenv import load_dotenv
import os
# Load environment variables
load_dotenv()


# Retrieve the API key from the environment
api_key = os.getenv('API_KEY')
SERPER_API_KEY = api_key

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
import numpy as np
from urllib.parse import urlparse


# ---------- Models ----------
class Query(BaseModel):
    topic: str
    prompt: str = None
    age: int = None
    gender: str = None
    location: str = None
class ReferenceFeatures(BaseModel):
    topic: str
    age: Optional[int] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    prompt: Optional[str] = None
    perspectives: Optional[List[str]] = None
    articles: Optional[List[str]] = None
    summaries: Optional[List[str]] = None
class TrendQuery(BaseModel):
    interest: Optional[str] = None
    prompt: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    location: Optional[str] = None
@app.get("/ping")
async def ping():
    return {"status": "ok"}
# Add a filter to ignore low-quality articles
def is_meaningful(text: str) -> bool:
    filters = ["submit your best", "photo gallery", "CNN.com will feature", "click here", "snapshots"]
    return all(phrase.lower() not in text.lower() for phrase in filters) and len(text.strip()) > 100

def clean_article_text(text: str) -> str:
    # Remove promotional phrases
    promo_keywords = ["photo gallery", "submit your", "click here", "iReport", "terms of service", "travel snapshot"]
    for kw in promo_keywords:
        text = re.sub(rf".*{kw}.*\n?", "", text, flags=re.IGNORECASE)

    # Remove sequences of years or digits
    text = re.sub(r"(\d{4}(, )?)+", "", text)

    # Remove overly short sentences
    sentences = text.split('.')
    text = '. '.join([s.strip() for s in sentences if len(s.strip().split()) > 5])

    return text[:3000]  # Trim length for the model

# ---------- Utility ----------
def fetch_news_links(topic: str) -> List[str]:
    try:
        conn = http.client.HTTPSConnection("google.serper.dev")
        payload = json.dumps({"q": topic})
        headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        }
        conn.request("POST", "/search", payload, headers)
        res = conn.getresponse()
        data = res.read()
        result = json.loads(data.decode("utf-8"))
        urls = []
        if "organic" in result:
            for item in result["organic"][:5]:
                if "link" in item:
                    urls.append(item["link"])
        return urls
    except Exception as e:
        print("Error fetching links:", e)
        return []


# Minimal stopwords list
STOPWORDS = set([
    "the", "and", "is", "in", "of", "to", "a", "for", "on", "that",
    "with", "as", "by", "at", "it", "from", "this", "an", "be", "are",
    "gemini", "google", "check", "delete", "access", "deepai", "chatgpt", "chatbot",
    "sign", "connection", "history", "your", "more", "text"
])

def extract_buzzwords(text: str, limit: int = 20):
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    filtered = [word for word in words if word not in STOPWORDS]
    freq = Counter(filtered)
    return dict(freq.most_common(limit))


async def fetch_fallback_text(url):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=10000)
            content = await page.inner_text("body")
            await browser.close()
            return content[:3000]  # limit for summarizer
    except Exception as e:
        print(f"Playwright fallback failed for {url}: {e}")
        return ""


async def summarize_article(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        text = article.text
        if len(text.strip()) < 200:
            raise Exception("Too short or failed")
    except:
        text = await fetch_fallback_text(url)
        if not text.strip():
            return f"Failed to summarize: {url}"

    try:
        summary = await asyncio.to_thread(
            summarizer, text[:1024], max_length=130, min_length=30, do_sample=False
        )
        return summary[0]["summary_text"]
    except Exception as e:
        return f"Summarization failed: {str(e)}"


# ---------- Routes ----------
# @app.post("/news-summary")
# async def news_summary(query: Query):
#     try:
#         urls = fetch_news_links(query.topic)
#         summaries = await asyncio.gather(*[summarize_article(url) for url in urls])
#         return JSONResponse(content={"topic": query.topic, "summaries": summaries, "sources": urls})
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/news-summary")
async def news_summary(query:ReferenceFeatures ):
    try:
        urls = fetch_news_links(query.topic)
        summaries = []

        for url in urls:
            try:
                article = Article(url)
                article.download()
                article.parse()
                text = article.text.strip()
                if len(text) < 100:
                    continue

                # Create contextual prompt if available
                if query.prompt or query.age or query.gender or query.location:
                    context = f"Summarize this article"
                    if query.prompt:
                        context += f" with a focus on {query.prompt}"
                    if query.age or query.gender or query.location:
                        context += f" for a {query.age}yo {query.gender or ''} from {query.location or 'an unspecified location'}"
                    text = context + ":\n\n" + text

                summary = await asyncio.to_thread(
                    summarizer, text[:1024], max_length=130, min_length=30, do_sample=False
                )
                summaries.append(summary[0]["summary_text"])
            except Exception as ex:
                summaries.append(f"Failed to summarize {url}: {ex}")

        return JSONResponse(content={"topic": query.topic, "summaries": summaries, "sources": urls})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
@app.post("/buzzwords")
async def get_buzzwords(query: Query):
    try:
        urls = fetch_news_links(query.topic)
        all_texts = []

        for url in urls:
            try:
                article = Article(url)
                article.download()
                article.parse()
                text = article.text.strip()
                if len(text) < 200:
                    raise Exception("Too short")
                all_texts.append(text)
            except:
                fallback_text = await fetch_fallback_text(url)
                if fallback_text.strip():
                    all_texts.append(fallback_text)

        if not all_texts:
            return JSONResponse(content={"error": "No valid article content found."}, status_code=400)

        # Combine all article text
        combined_text = " ".join(all_texts)

        # Add optional user context
        user_context = f"{query.prompt or ''} {query.age or ''} {query.gender or ''} {query.location or ''}".strip()
        if user_context:
            combined_text = user_context + " " + combined_text

        # Extract refined buzzwords
        buzz = extract_buzzwords(combined_text)

        return JSONResponse(content={
            "topic": query.topic,
            "buzzwords": buzz,
            "sources": urls
        })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# @app.post("/buzzwords")
# async def get_buzzwords(query: Query):
#     try:
#         urls = fetch_news_links(query.topic)
#         all_texts = []

#         for url in urls:
#             try:
#                 article = Article(url)
#                 article.download()
#                 article.parse()
#                 if len(article.text.strip()) < 200:
#                     raise Exception("Too short")
#                 all_texts.append(article.text)
#             except:
#                 fallback_text = await fetch_fallback_text(url)
#                 if fallback_text.strip():
#                     all_texts.append(fallback_text)

#         if not all_texts:
#             return JSONResponse(content={"error": "No valid article content found."}, status_code=400)

#         combined_text = " ".join(all_texts)
#         buzz = extract_buzzwords(combined_text)
#         return JSONResponse(content={"buzzwords": buzz})
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)
# @app.post("/trends")
# async def get_trends(query: TrendQuery):
#     try:
#         conn = http.client.HTTPSConnection("google.serper.dev")
#         payload = json.dumps({"q": query.interest})
#         headers = {
#             'X-API-KEY': SERPER_API_KEY,
#             'Content-Type': 'application/json'
#         }
#         conn.request("POST", "/search", payload, headers)
#         res = conn.getresponse()
#         data = res.read()
#         results = json.loads(data.decode("utf-8"))

#         trends = []
#         seen_titles = set()

#         if "organic" in results:
#             for idx, item in enumerate(results["organic"][:10]):
#                 title = item.get("title")
#                 if not title or title in seen_titles:
#                     continue
#                 seen_titles.add(title)
#                 snippet = item.get("snippet", "")
#                 link = item.get("link", "")
#                 trend_score = 100 - idx * 10  # Higher rank = higher score
#                 trends.append({
#                     "title": title,
#                     "snippet": snippet,
#                     "link": link,
#                     "trend_score": trend_score
#                 })

#         return JSONResponse(content={
#             "interest": query.interest,
#             "trending_topics": trends
#         })

#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/trends")
async def get_trends(query: TrendQuery):
    try:
        # Construct personalized search query
        search_terms = [query.interest or "", query.prompt or "", query.location or "", query.gender or "", str(query.age or "")]
        search_query = " ".join([term for term in search_terms if term]).strip()

        if not search_query:
            return JSONResponse(content={"error": "No query parameters provided."}, status_code=400)

        conn = http.client.HTTPSConnection("google.serper.dev")
        payload = json.dumps({"q": search_query})
        headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        }
        conn.request("POST", "/search", payload, headers)
        res = conn.getresponse()
        data = res.read()
        results = json.loads(data.decode("utf-8"))

        trends = []
        seen_titles = set()

        if "organic" in results:
            for idx, item in enumerate(results["organic"][:10]):
                title = item.get("title")
                if not title or title in seen_titles:
                    continue
                seen_titles.add(title)

                snippet = item.get("snippet", "")
                link = item.get("link", "")
                trend_score = 100 - idx * 10  # Higher rank = higher score

                trends.append({
                    "title": title,
                    "snippet": snippet,
                    "link": link,
                    "trend_score": trend_score
                })

        return JSONResponse(content={
            "search_basis": search_query,
            "trending_topics": trends
        })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

async def summarize_article(url: str) -> str:
    try:
        article = Article(url)
        article.download()
        article.parse()
        text = article.text[:1024]
        summary = await asyncio.to_thread(summarizer, text, max_length=130, min_length=30, do_sample=False)
        return summary[0]["summary_text"]
    except:
        return f"Failed to summarize: {url}"
# @app.post("/debate-news-summary")
# async def debate_news_summary(query: ReferenceFeatures):
#     try:
#         def fetch_news_links(topic: str) -> List[str]:
#             conn = http.client.HTTPSConnection("google.serper.dev")
#             payload = json.dumps({"q": topic})
#             headers = {
#                 'X-API-KEY': SERPER_API_KEY,
#                 'Content-Type': 'application/json'
#             }
#             conn.request("POST", "/search", payload, headers)
#             res = conn.getresponse()
#             data = res.read()
#             result = json.loads(data.decode("utf-8"))
#             urls = []
#             if "organic" in result:
#                 for item in result["organic"][:10]:
#                     if "link" in item:
#                         urls.append(item["link"])
#             return urls

#         # If user provides their own article URLs
#         urls = query.articles if query.articles else fetch_news_links(query.topic)
#         articles = []

#         for url in urls:
#             try:
#                 article = Article(url)
#                 article.download()
#                 article.parse()
#                 articles.append({
#                     "title": article.title,
#                     "text": article.text,
#                     "url": url
#                 })
#             except:
#                 continue

#         if not articles:
#             return JSONResponse(content={"message": "No articles found."})

#         texts = [a["text"][:1024] for a in articles]
#         vectorizer = TfidfVectorizer(stop_words='english')
#         X = vectorizer.fit_transform(texts).toarray()

#         dim = X.shape[1]
#         index = faiss.IndexFlatL2(dim)
#         index.add(np.array(X).astype(np.float32))

#         query_basis = query.prompt if query.prompt else query.topic
#         interest_vector = vectorizer.transform([query_basis]).toarray().astype(np.float32)
#         D, I = index.search(interest_vector, k=min(5, len(articles)))

#         top = articles[I[0][0]]
#         bottom = articles[I[0][-1]]

#        cleaned_top = clean_article_text(top["text"])
#        cleaned_bottom = clean_article_text(bottom["text"])
#        top_summary = summarizer(cleaned_top, max_length=250, min_length=100, do_sample=False)[0]["summary_text"]
#        bottom_summary = summarizer(cleaned_bottom, max_length=250, min_length=100, do_sample=False)[0]["summary_text"]


#         personalized_context = f" (Audience: {query.age}yo {query.gender} in {query.location})" if query.age or query.gender or query.location else ""

#         summary_paragraph = (
#             f"Supporters argue that {top_summary} (Source: {top['url']}). "
#             f"However, critics argue that {bottom_summary} (Source: {bottom['url']})."
#             f"{personalized_context}"
#         )

#         return JSONResponse(content={"topic": query.topic, "debate_summary": summary_paragraph})

#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)

# Helper: Clean unwanted promotional/short content
def clean_article_text(text):
    lines = text.splitlines()
    cleaned = []
    for line in lines:
        line = line.strip()
        if len(line) > 30 and not any(
            phrase in line.lower() for phrase in [
                "submit your", "click here", "gallery", "best shots", 
                "next week", "cnn.com", "reporter", "travel snapshots"
            ]
        ):
            cleaned.append(line)
    return " ".join(cleaned)


@app.post("/debate-news-summary")
async def debate_news_summary(query: ReferenceFeatures):
    try:
        def fetch_news_links(topic: str) -> List[str]:
            conn = http.client.HTTPSConnection("google.serper.dev")
            payload = json.dumps({"q": topic})
            headers = {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
            conn.request("POST", "/search", payload, headers)
            res = conn.getresponse()
            data = res.read()
            result = json.loads(data.decode("utf-8"))
            urls = []
            if "organic" in result:
                for item in result["organic"][:10]:
                    if "link" in item:
                        urls.append(item["link"])
            return urls

        # Fetch or use given articles
        urls = query.articles if query.articles else fetch_news_links(query.topic)
        articles = []

        for url in urls:
            try:
                article = Article(url)
                article.download()
                article.parse()
                if len(article.text.strip()) > 300:
                    articles.append({
                        "title": article.title,
                        "text": article.text,
                        "url": url,
                        "source": urlparse(url).netloc
                    })
            except:
                continue

        if not articles:
            return JSONResponse(content={"message": "No meaningful articles found."})

        # TF-IDF + FAISS
        texts = [a["text"][:1024] for a in articles]
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(texts).toarray()

        dim = X.shape[1]
        index = faiss.IndexFlatL2(dim)
        index.add(np.array(X).astype(np.float32))

        query_basis = query.prompt if query.prompt else query.topic
        interest_vector = vectorizer.transform([query_basis]).toarray().astype(np.float32)
        D, I = index.search(interest_vector, k=min(5, len(articles)))

        top = articles[I[0][0]]
        bottom = articles[I[0][-1]]

        # Clean and summarize
        cleaned_top = clean_article_text(top["text"])
        cleaned_bottom = clean_article_text(bottom["text"])

        top_summary = summarizer(cleaned_top[:1024], max_length=300, min_length=100, do_sample=False)[0]["summary_text"]
        bottom_summary = summarizer(cleaned_bottom[:1024], max_length=300, min_length=100, do_sample=False)[0]["summary_text"]

        personalized_context = (
            f" (Audience: {query.age}yo {query.gender} in {query.location})"
            if query.age or query.gender or query.location else ""
        )

        summary_paragraph = (
            f"Supporters argue that {top_summary} (Source: {top['source']}). "
            f"However, critics argue that {bottom_summary} (Source: {bottom['source']})."
            f"{personalized_context}"
        )

        return JSONResponse(content={"topic": query.topic, "debate_summary": summary_paragraph})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)