"""
Script to populate database tables from CSV files.

This script reads data from 'mix_range_reviews2.csv' and 'topics_by_module.csv'
using pandas, processes the data (e.g., cleaning percentage values), and then
populates the 'Module' and 'TopicByModule' tables in the database defined
by the Flask application. It uses the existing Flask app context to interact
with the SQLAlchemy database session.
"""

# Standard library imports
import json                     # For converting Python lists/dicts to JSON strings

# Third-party imports
import pandas as pd             # Data manipulation library, used for reading CSV files

# Local application/library specific imports
from database import db         # Import the SQLAlchemy database instance (`db`) from the local `database` module
                                # Note: Only `db` is needed, initialization happens via `app`
from models import Module, TopicByModule # Import the SQLAlchemy model classes for the tables being populated
from app import app             # Import the Flask application instance (`app`) from the local `app` module
                                # This provides the necessary application context for database operations

# --- Helper Function ---

def clean_percentage(value):
    """
    Cleans a string representing a percentage and converts it to an integer.

    Removes the '%' symbol, attempts conversion to float then integer.
    Handles potential errors during conversion and non-string inputs.

    Args:
        value (str or any): The input value, expected to be a string like 'XX%'.

    Returns:
        int: The integer representation of the percentage, or 0 if the input
             is invalid, cannot be converted, or is not a string.
    """
    # Check if the input is a string before attempting string operations
    if isinstance(value, str):
        value = value.replace('%', '').strip() # Remove the '%' symbol and any surrounding whitespace
        try:
            # Convert the cleaned string first to float (to handle decimals if any)
            # and then to integer.
            return int(float(value))
        except ValueError:
            # If conversion to float or int fails (e.g., empty string, non-numeric), return 0.
            return 0
    # If the input value is not a string (e.g., NaN, None, int), return 0.
    return 0

# --- Data Loading ---

# Define file paths for the input CSV files
MODULES_CSV_PATH = "./reviews_data_processing/data/mix_range_reviews2.csv"
TOPICS_CSV_PATH = "./reviews_data_processing/data/topics_by_module.csv"

# Load data from specified CSV files into pandas DataFrames
print(f"Loading modules data from: {MODULES_CSV_PATH}")
modules_df = pd.read_csv(MODULES_CSV_PATH)
print(f"Loading topics data from: {TOPICS_CSV_PATH}")
topics_df = pd.read_csv(TOPICS_CSV_PATH)

# Print the column names to verify successful loading and expected columns
print("\nColumns in modules DataFrame:")
print(modules_df.columns)
print("\nColumns in topics DataFrame:")
print(topics_df.columns)

# --- Database Population ---

# Establish an application context to interact with the database.
# SQLAlchemy operations tied to the Flask app (like using `db.session`)
# require an active application context.
with app.app_context():
    print("\nStarting database population...")
    # Clear existing data from the tables before populating.
    # This prevents duplicate entries if the script is run multiple times.
    # This deletes all data in these tables
    print("Clearing existing data from Module and TopicByModule tables...")
    db.session.query(Module).delete()
    db.session.query(TopicByModule).delete()
    # Commit the deletion operations immediately.
    db.session.commit()
    print("Existing data cleared.")

    # Populate the Module table
    print("Populating Module table...")
    # Iterate through each row in the modules DataFrame.
    for index, row in modules_df.iterrows():
        # Create a new Module object using data from the current row.
        module = Module(
            # Basic module information
            name=row["module_name"],
            outlook=row["outlook"],
            summary=row["summary"],
            category=row["category"],

            # Clean and convert percentage values using the helper function.
            # Use .get() with a default value ('0%') to safely handle potentially missing columns
            # and provide a default that clean_percentage can handle.
            positive_reviews=clean_percentage(row.get("positive_reviews", "0%")),
            negative_reviews=clean_percentage(row.get("negative_reviews", "0%")),
            positive_emotions=clean_percentage(row.get("positive_emotions", "0%")),
            negative_emotions=clean_percentage(row.get("negative_emotions", "0%")),

            # Teacher-specific feedback fields
            teacher_prompt=row["teacher_feedback_prompt"],
            teacher_feedback_recommendation=row["teacher_feedback_recommendation"],
            teacher_feedback_recommendation_shortform=row["shortened_feedback"],

            # Convert the comma-separated topics string into a list, then store as a JSON string.
            # Handles potential NaN or non-string values in 'topics' column gracefully.
            topics=json.dumps(str(row["topics"]).split(",")) if pd.notna(row["topics"]) else "[]",

            # Analysis reference field
            analysis_refs=row["analysis_refs"]
        )
        # Add the newly created Module object to the SQLAlchemy session.
        # Objects added to the session are tracked for changes.
        db.session.add(module)

    print(f"{len(modules_df)} modules processed.")

    # Populate the TopicByModule table
    print("Populating TopicByModule table...")
    # Iterate through each row in the topics DataFrame.
    for index, row in topics_df.iterrows():
        # Create a new TopicByModule object using data from the current row.
        topic = TopicByModule(
            # Module and topic identifiers
            name=row["module_name"],
            topic=row["topic"],

            # Topic-specific summaries and outlook
            topic_outlook=row["topic_outlook"],
            topic_summary=row["topic_summary"],

            # Clean and convert topic-specific percentage values.
            # Uses .get() for topic-specific columns, falling back to the general module
            # percentage columns (also using .get()) if the topic-specific ones aren't present.
            positive_reviews_topic=clean_percentage(row.get("positive_reviews_topic", row.get("positive_reviews", "0%"))),
            negative_reviews_topic=clean_percentage(row.get("negative_reviews_topic", row.get("negative_reviews", "0%"))),
            positive_emotions_topic=clean_percentage(row.get("positive_emotions_topic", row.get("positive_emotions", "0%"))),
            negative_emotions_topic=clean_percentage(row.get("negative_emotions_topic", row.get("negative_emotions", "0%"))),

            # Topic-specific analysis reference
            analysis_ref_topic=row["analysis_refs"] # Assuming the column name is 'analysis_refs' in topics_df too
        )
        # Add the newly created TopicByModule object to the SQLAlchemy session.
        db.session.add(topic)

    print(f"{len(topics_df)} topics processed.")

    # Commit all the changes (added Module and TopicByModule objects) to the database.
    # This performs the actual INSERT operations in a single transaction.
    print("Committing changes to the database...")
    db.session.commit()
    print("Database populated successfully!")