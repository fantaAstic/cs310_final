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

# Standard library imports
import json # Used for loading data from JSON files and dumping lists to JSON strings
import csv  # Used for reading data from CSV files

# Local application/library specific imports
from database import db   # The SQLAlchemy database instance from the application
from models import Module # The SQLAlchemy model class for the 'module' table

# --- JSON Population Function ---

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
    # Define the path to the JSON data file
    json_file_path = 'modules_data.json'
    print(f"Attempting to load data from: {json_file_path}")

    # Load module data from the JSON file
    try:
        with open(json_file_path, 'r') as file:
            modules_data = json.load(file) # Parse the JSON data into a Python list/dict
    except FileNotFoundError:
        print(f"Error: JSON file not found at {json_file_path}")
        return # Exit the function if the file doesn't exist
    except json.JSONDecodeError as e:
        print(f"Error: Could not decode JSON from {json_file_path}. Details: {e}")
        return # Exit if JSON is invalid

    print(f"Loaded {len(modules_data)} modules from JSON. Populating database...")

    # Iterate through each module's data loaded from the JSON file
    for module_data in modules_data:
        # Create an instance of the Module model using data from the dictionary.
        # NOTE: This assumes the keys in module_data exactly match the expected
        #       attributes/column names in the Module model.
        # TODO: Add validation or check for key existence if JSON structure might vary.
        module = Module(
            # Map JSON keys to Module attributes
            title=module_data['title'], # Assuming 'title' exists in JSON and maps to 'title' in Module
            outlook=module_data.get('outlook'), # Use .get() for potentially optional fields
            positive_reviews=module_data.get('positive_reviews'),
            negative_reviews=module_data.get('negative_reviews'),
            category=module_data.get('category'),
            teacher_feedback_recommendation=module_data.get('teacher_feedback_recommendation'),
            # Assuming 'similar_modules' in JSON is already in a format suitable
            # for the database (e.g., a JSON string if the column type is Text/JSON)
            # or if it's expected to be a simple string. Adjust if conversion needed.
            similar_modules=module_data.get('similar_modules')
            # Add other fields like 'summary', 'topics', etc., if they exist in JSON
            # and the Module model. E.g.:
            # summary=module_data.get('summary'),
            # topics=json.dumps(module_data.get('topics', [])) # If topics is a list in JSON
        )
        # Add the newly created Module object to the SQLAlchemy session.
        # The object is now pending insertion into the database.
        db.session.add(module)

    # Attempt to commit all the added Module objects to the database.
    try:
        db.session.commit() # Persist changes to the database
        print("Modules populated successfully from JSON!")
    except Exception as e:
        # If any error occurs during the commit process (e.g., database constraint violation),
        # roll back the entire transaction to maintain data integrity.
        db.session.rollback()
        print(f"Error populating modules from JSON: {str(e)}")

# --- CSV Population Function ---

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
    print(f"Attempting to load data from CSV: {csv_file}")
    try:
        # Open the CSV file for reading. `newline=''` is recommended practice for the csv module.
        with open(csv_file, mode='r', newline='', encoding='utf-8') as file: # Added encoding
            # Create a DictReader object, which reads rows as dictionaries
            # mapping header names to cell values.
            reader = csv.DictReader(file)
            modules_added_count = 0

            # Iterate through each row (dictionary) in the CSV file.
            for row in reader:
                # Create an instance of the Module model using data from the current row.
                module = Module(
                    # Access values using dictionary keys (CSV header names).
                    title=row['title'], # Assume 'title' column exists and is required.

                    # Use .get() for potentially optional columns to avoid KeyErrors.
                    outlook=row.get('outlook'),

                    # Convert numeric fields from string to integer.
                    # Provide a default value ('0') to int() if the column is missing or empty.
                    positive_reviews=int(row.get('positive_reviews', 0)),
                    negative_reviews=int(row.get('negative_reviews', 0)),

                    # Get string fields.
                    category=row.get('category'),
                    teacher_feedback_recommendation=row.get('teacher_feedback_recommendation'),

                    # --- Handling list-like data stored as strings in CSV ---
                    # Assume 'similar_modules' and 'topics' columns contain semicolon-separated strings.
                    # Split the string into a list, then dump the list as a JSON string
                    # for storage in a Text/JSON database column.
                    # Provide a default of '[]' (empty JSON list string) if column is missing/empty.
                    similar_modules=json.dumps(row.get('similar_modules', '').split(';') if row.get('similar_modules') else []),
                    topics=json.dumps(row.get('topics', '').split(';') if row.get('topics') else [])
                    # Add other fields from CSV as needed, matching Module model attributes.
                    # E.g., summary=row.get('summary')
                )
                # Add the new Module object to the session.
                db.session.add(module)
                modules_added_count += 1

            print(f"Processed {modules_added_count} rows from CSV. Committing to database...")
            # Commit all the added Module objects to the database after processing all rows.
            db.session.commit()
            print("Modules populated successfully from CSV!")

    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_file}")
    except KeyError as e:
        # Catch errors if a required column (like 'title' accessed with []) is missing.
        db.session.rollback() # Rollback any potential adds from previous rows
        print(f"Error: Missing required column in CSV file '{csv_file}': {e}")
    except ValueError as e:
        # Catch errors during int() conversion if data is not numeric.
        db.session.rollback()
        print(f"Error: Invalid numeric value encountered in CSV '{csv_file}': {e}")
    except Exception as e:
        # Catch any other unexpected errors, including database errors during commit.
        db.session.rollback()
        print(f"An unexpected error occurred while processing CSV '{csv_file}': {str(e)}")

# Example Usage (Uncomment and adapt path if running this script directly within Flask context):
# if __name__ == '__main__':
#     # Ensure this runs within Flask app context, e.g., using Flask-Script or Flask CLI
#     # from app import app # Assuming your Flask app instance is named 'app'
#     # with app.app_context():
#     #    populate_module_table() # To populate from modules_data.json
#     #    # OR
#     #    populate_from_csv('path/to/your/modules.csv') # To populate from a CSV file