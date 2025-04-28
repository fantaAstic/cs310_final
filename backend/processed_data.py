"""
Database seeding script for populating the Module table.

This script provides functions to populate the 'Module' database table
either from a JSON file ('modules_data.json') or a specified CSV file.

Prerequisites:
- Ensure Flask-Migrate is set up and migrations are applied (`flask db upgrade`).
- This script assumes it is run within an active Flask application context
  (e.g., using `flask shell` or a custom Flask CLI command) so that `db.session`
  is correctly bound and configured.
"""

import json
from database import db
from models import Module
import csv

def populate_module_table():
    """
    Populates the Module table from a predefined JSON file ('modules_data.json').

    Reads module data from the JSON file, creates Module model instances,
    and commits them to the database in a single transaction. Includes basic
    error handling with rollback on failure.

    Raises:
        FileNotFoundError: If 'modules_data.json' does not exist.
        json.JSONDecodeError: If 'modules_data.json' contains invalid JSON.
        Exception: Catches potential database errors during commit.
    """
    # Load JSON file
    with open('modules_data.json') as file:
        modules = json.load(file)

    for module_data in modules:
        # Create Module instance
        module = Module(
            title=module_data['title'],
            outlook=module_data['outlook'],
            positive_reviews=module_data['positive_reviews'],
            negative_reviews=module_data['negative_reviews'],
            category=module_data['category'],
            teacher_feedback_recommendation=module_data['teacher_feedback_recommendation'],
            similar_modules=module_data['similar_modules']
        )
        db.session.add(module)

    try:
        db.session.commit()
        print("Modules populated successfully!")
    except Exception as e:
        db.session.rollback()
        print("Error populating modules:", str(e))

# or if using a csv (maybe easy to just make a summary table/df)
def populate_from_csv(csv_file):
    """
    Populates the Module table from a specified CSV file.

    Reads module data row by row from the CSV file using DictReader,
    creates Module model instances, and commits them to the database.
    Handles potential missing columns using .get() and performs basic
    type conversions and JSON serialization for list-like fields.

    Args:
        csv_file (str): The file path to the CSV file containing module data.

    Raises:
        FileNotFoundError: If the specified csv_file does not exist.
        Exception: Catches potential database errors during commit.

    NOTE: Commits changes after processing all rows. For very large CSV files,
          consider committing in batches to manage memory usage and transaction size.
    """
    with open(csv_file, newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            module = Module(
                title=row['title'],
                outlook=row.get('outlook'),
                positive_reviews=int(row.get('positive_reviews', 0)),
                negative_reviews=int(row.get('negative_reviews', 0)),
                category=row.get('category'),
                teacher_feedback_recommendation=row.get('teacher_feedback_recommendation'),
                similar_modules=json.dumps(row.get('similar_modules', '[]').split(';')),
                topics=json.dumps(row.get('topics', '[]').split(';'))
            )
            db.session.add(module)
        db.session.commit()