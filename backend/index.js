const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Fake News API URL
const FAKE_NEWS_API_URL = "http://localhost:5002/predict";

app.get("/api/news", async (req, res) => {
  const { category, search, page } = req.query;
  const API_KEY = process.env.NEWS_API_KEY;

  let url = search
    ? `https://newsapi.org/v2/everything?q=${search}&page=${page || 1}&apiKey=${API_KEY}`
    : `https://newsapi.org/v2/top-headlines?category=${category}&country=us&page=${page || 1}&apiKey=${API_KEY}`;

  try {
    const response = await axios.get(url);
    let articles = response.data.articles || [];

    // Predict Fake News
    const updatedArticles = await Promise.all(
      articles.map(async (article) => {
        try {
          const prediction = await axios.post(FAKE_NEWS_API_URL, {
            text: article.title + " " + article.description,
          });

          return { ...article, isFake: prediction.data.isFake };
        } catch (err) {
          console.error("Fake news check failed:", err.message);
          return { ...article, isFake: "unknown" }; // ✅ Default if API fails
        }
      })
    );

    res.json({ articles: updatedArticles });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});