import pandas as pd
import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB

# Backend folder ke andar hi hai, toh direct file ka naam likho
true_path = "True.csv"
fake_path = "Fake.csv"

# ✅ Check karo ki files exist karti hai ya nahi
if not os.path.exists(true_path):
    print(f"❌ File not found: {true_path}")
if not os.path.exists(fake_path):
    print(f"❌ File not found: {fake_path}")

# ✅ Read files
df_true = pd.read_csv(true_path)
df_fake = pd.read_csv(fake_path)

# ✅ Label add karo
df_true["label"] = "REAL"
df_fake["label"] = "FAKE"

# ✅ Dono ko combine karo
df = pd.concat([df_true, df_fake])

# ✅ Save merged dataset
df.to_csv("fake_or_real_news.csv", index=False)

print("✅ Dataset merged successfully!")

# ✅ Train Model

# Convert text into numerical features
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X = vectorizer.fit_transform(df["text"])
y = df["label"]

# Split dataset into train & test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = MultinomialNB()
model.fit(X_train, y_train)

# 🏆 Save trained model
with open("fake_news_model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

# 🏆 Save TF-IDF Vectorizer
with open("vectorizer.pkl", "wb") as vec_file:
    pickle.dump(vectorizer, vec_file)

print("✅ Model & Vectorizer saved successfully!")
