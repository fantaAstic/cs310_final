"""
Script to populate database tables from CSV files.

This script reads data from 'mix_range_reviews2.csv' and 'topics_by_module.csv'
using pandas, processes the data (e.g., cleaning percentage values), and then
populates the 'Module' and 'TopicByModule' tables in the database defined
by the Flask application. It uses the existing Flask app context to interact
with the SQLAlchemy database session.
"""

import json
import pandas as pd
from database import db  # Import only db, no need to re-init
from models import Module, TopicByModule
from app import app  # Import the existing app instance

# Function to clean percentage values and convert to integer
def clean_percentage(value):
    # Remove '%' and convert to float, then to integer
    if isinstance(value, str):
        value = value.replace('%', '')  # Remove the '%' symbol
        try:
            return int(float(value))  # Convert to float and then to int
        except ValueError:
            return 0  # If conversion fails, return 0
    return 0  # If value is not a string, return 0

# Load CSV files
modules_df = pd.read_csv("./reviews_data_processing/data/mix_range_reviews2.csv")
topics_df = pd.read_csv("./reviews_data_processing/data/topics_by_module.csv")

print(modules_df.columns)
print(topics_df.columns)

with app.app_context():  # Use the existing app context
    # Clear existing data to avoid duplicates
    db.session.query(Module).delete()
    db.session.query(TopicByModule).delete()
    db.session.commit()

    # Populate Module table
    for _, row in modules_df.iterrows():
        module = Module(
            name=row["module_name"],
            outlook=row["outlook"],
            summary=row["summary"],
            positive_reviews=clean_percentage(row.get("positive_reviews", "0%")),  # Use .get() to avoid KeyError
            negative_reviews=clean_percentage(row.get("negative_reviews", "0%")),
            positive_emotions=clean_percentage(row.get("positive_emotions", "0%")),
            negative_emotions=clean_percentage(row.get("negative_emotions", "0%")),
            category=row["category"],
            teacher_prompt=row["teacher_feedback_prompt"],
            teacher_feedback_recommendation=row["teacher_feedback_recommendation"],
            teacher_feedback_recommendation_shortform=row["shortened_feedback"],
            topics=json.dumps(row["topics"].split(",")),  # Convert topics to JSON string
            analysis_refs=row["analysis_refs"]
        )

        db.session.add(module)

    # Populate TopicByModule table
    for _, row in topics_df.iterrows():
        topic = TopicByModule(
            name=row["module_name"],
            topic=row["topic"],
            topic_outlook=row["topic_outlook"],
            topic_summary=row["topic_summary"],
            positive_reviews_topic=clean_percentage(row.get("positive_reviews_topic", row.get("positive_reviews", "0%"))),
            negative_reviews_topic=clean_percentage(row.get("negative_reviews_topic", row.get("negative_reviews", "0%"))),
            positive_emotions_topic=clean_percentage(row.get("positive_emotions_topic", row.get("positive_emotions", "0%"))),
            negative_emotions_topic=clean_percentage(row.get("negative_emotions_topic", row.get("negative_emotions", "0%"))),
            analysis_ref_topic=row["analysis_refs"]
        )
        db.session.add(topic)

    # Commit all changes
    db.session.commit()
    print("Database populated successfully!")