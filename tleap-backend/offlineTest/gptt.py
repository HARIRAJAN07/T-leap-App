import csv
import os
import json
import random
from ollama import Client

# connect to local ollama server


# generate Tamil science question for Class 6





# Load GPT4All model
model_path = "C:\\Users\\User\\.ollama\\models\\manifest"  
model = Client(model_path, allow_download=False)

# Store previous questions to avoid repetition
history_file = "question_history.json"
if os.path.exists(history_file):
    with open(history_file, "r") as f:
        question_history = json.load(f)
else:
    question_history = []

def generate_questions(class_level, subject, topic, difficulty, qtype, language, num=5):
    prompt = f"""
    Generate {num} {qtype} questions in {language} for class {class_level} students.
    Subject: {subject}
    Topic: {topic}
    Difficulty: {difficulty}
    Provide correct answers clearly. Avoid repeating previous questions.
    """
    
    with model.chat_session():
        response = model.generate(prompt, max_tokens=800, temperature=0.8)
    
    # Check for repetition
    unique_questions = []
    for q in response.split("\n"):
        if q.strip() and q not in question_history:
            unique_questions.append(q)
            question_history.append(q)
    
    # Save updated history
    with open(history_file, "w") as f:
        json.dump(question_history, f)
    
    return "\n".join(unique_questions)

def save_analysis(student_id, score, total, mode, difficulty):
    file_exists = os.path.isfile("analysis.csv")
    with open("analysis.csv", "a", newline="") as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["Student ID", "Score", "Total", "Mode", "Difficulty"])
        writer.writerow([student_id, score, total, mode, difficulty])

# Example usage
questions = generate_questions(class_level="10", subject="Mathematics", topic="Fractions",
                                difficulty="Medium", qtype="MCQ", language="English", num=5)

print("Generated Questions:\n", questions)

# Save analysis after test
save_analysis("Student001", 8, 10, "Practice", "Medium")
print("Analysis saved to CSV.")

# Generate  multiple choice questions in tamil for class 6th standar students.
#     Subject: Science
#     Topic: Force
#     Difficulty: Medium
#     Provide correct answers clearly. Avoid repeating previous questions.