import pickle
import nltk
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer

nltk.download("stopwords")

#  Load trained model & vectorizer (Ensure these files exist before running this script)
try:
    model = pickle.load(open("fake_news_model.pkl", "rb"))
    vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
except FileNotFoundError:
    print("❌ Error: Model or vectorizer file not found. Train the model first.")
    exit(1)

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    news_text = data.get("text", "")

    if not news_text:
        return jsonify({"error": "No text provided"}), 400

    #  Predict fake/real
    text_vector = vectorizer.transform([news_text])
    prediction = model.predict(text_vector)[0]

    return jsonify({"isFake": prediction == "FAKE"})

if __name__ == "__main__":
    app.run(port=5002, debug=True)  #  Flask API runs on port 5002
