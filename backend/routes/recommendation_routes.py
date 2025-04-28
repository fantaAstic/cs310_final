"""
Recommendation Routes Blueprint.

This blueprint handles routes related to generating module recommendations
for users based on their preferences. It interacts with User, Module,
and TopicByModule models.
"""

# Third-party imports
from flask import Blueprint, request, jsonify # Core Flask components for routing, requests, and JSON responses
from flask_login import login_required, current_user # Utilities for requiring login and accessing the current user

# Standard library imports
import json # Used for potentially handling JSON strings stored in the database

# Local application/library specific imports
# Make sure TopicByModule exists in your models and db is the SQLAlchemy instance
from models import User, Module, TopicByModule, db

# Create a Blueprint instance named 'recommendation'.
# Routes defined here will be prefixed (e.g., /recommendations) when registered.
rec_bp = Blueprint('recommendation', __name__)

# --- Helper Function (Potentially for internal use or testing) ---

# Note: This function returns a jsonify response, which is unusual for a helper
#       called internally. It might be intended as a standalone endpoint or
#       should be refactored to just perform the action without returning a response.
def add_recommended_modules(module_name: str):
    """
    Add a single module name to the current user's recommended modules list.

    This function calls the User model's method to add the recommendation
    and immediately commits the change.

    Args:
        module_name (str): The name of the module to recommend.

    Returns:
        flask.Response: A JSON response confirming the addition and the updated list.
                        (Note: Returning a response might not be ideal for an internal helper).
    """
    # Call the User model method to add the module to recommendations.
    # This method should handle checking for duplicates and committing.
    current_user.add_recommended_module(module_name)
    # Return a success message and the updated list.
    return jsonify({
        "message": "Module added to recommended modules",
        "recommended_modules": current_user.get_recommended_modules()
    })

# --- Main Recommendation Generation Route ---

@rec_bp.route('/generate_recommendations_student', methods=['POST'])
@login_required  # Ensure the user is logged in before making this request
def generate_user_recommendations():
    """
    Generate module recommendations based on user preferences.

    Accepts user preferences via a JSON POST request, clears previous
    recommendations, filters all available modules based on the preferences
    using a prioritized sequence of filters, adds the resulting module names
    to the user's recommended list, and returns the final list.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {
            "user_priority": [1, 2, 3], // List of integers representing priority order (1: Feelings, 2: Subject, 3: Aspect)
            "selected_importance": 1,  // Integer (e.g., 1-5) indicating importance of 'feelings'
            "selected_categories": ["AI & Machine Learning", "Data Science"], // List of subject category strings
            "selected_aspects": ["topic1", "topic2"] // List of specific topic strings
        }

    Returns:
        JSON response containing the list of recommended module names.
        Example: {"recommended_modules": ["Machine Learning", "Data Scientist's Toolbox"]}
        Status Codes:
        - 200: Recommendations generated successfully.
        - 400: Invalid or missing request data.
        - 500: Internal server error.
    """
    # Receive JSON data from the frontend POST request.
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # Log the incoming request data for debugging purposes.
    print(f"--- Recommendation Request for User: {current_user.email} ---")
    print("Received data:", data)

    # --- Clear Previous Recommendations ---
    # Get the list of currently recommended modules for the user.
    existing_modules = current_user.get_recommended_modules()
    print("Existing recommended modules before removal:", existing_modules)

    # Iterate through the existing recommendations and remove each one.
    # The `remove_recommended_module` method handles database commits.
    for module_name in existing_modules:
        current_user.remove_recommended_module(module_name)

    # Verify that all recommendations were cleared (for debugging).
    remaining_modules = current_user.get_recommended_modules()
    print("Remaining recommended modules after removal attempt:", remaining_modules)
    if not remaining_modules:
        print("All old recommendations successfully removed.")
    else:
        # This might indicate an issue with the removal logic or concurrent modifications.
        print(f"Warning: {len(remaining_modules)} modules still remaining in recommendations after clearing.")

    # --- Extract User Preferences from Request Data ---
    # Get the user's priority order for filtering criteria. Default to empty list.
    priority_order = data.get("user_priority", [])
    print(f"User's priority order: {priority_order}")

    # Get the user's selected importance level for 'feelings'. Default to 1.
    selected_importance = data.get("selected_importance", 1)
    print(f"User's importance level for 'feelings': {selected_importance}")

    # Get the list of selected subject categories. Default to empty list.
    selected_categories = data.get("selected_categories", [])
    print(f"User's selected categories: {selected_categories}")

    # Get the list of selected aspects (topics). Default to empty list.
    selected_aspects = data.get("selected_aspects", [])
    print(f"User's selected aspects/topics: {selected_aspects}")

    # --- Initialize Module Shortlist ---
    # Start with a list of all module names available in the database.
    try:
        shortlist = [module.name for module in Module.query.all()]
        print(f"Initial shortlist (all modules): {len(shortlist)} modules")
        print(shortlist) # Optional: print the full initial list
    except Exception as e:
        print(f"Error retrieving initial module list: {e}")
        return jsonify({"error": "Failed to retrieve module list from database."}), 500


    # --- Apply Filters Based on Priority ---
    # Map priority numbers to their corresponding filter functions.
    priority_mapping = {
        1: filter_by_feelings,
        2: filter_by_subject,
        3: filter_by_aspect
    }

    # Iterate through the user's specified priority order and apply filters sequentially.
    # The shortlist is passed through each filter in the specified order.
    for priority in priority_order:
        filter_function = priority_mapping.get(priority)
        if filter_function:
            print(f"\nApplying filter for priority {priority}: {filter_function.__name__}")
            try:
                # Call the appropriate filter function with the current shortlist and relevant preferences.
                if priority == 1:
                    shortlist = filter_function(shortlist, selected_importance)
                elif priority == 2:
                    shortlist = filter_function(shortlist, selected_categories)
                elif priority == 3:
                    shortlist = filter_function(shortlist, selected_aspects)
                print(f"Shortlist size after {filter_function.__name__}: {len(shortlist)}")
                print(f"Shortlist content: {shortlist}") # Debugging output
            except Exception as e:
                print(f"Error during filtering with {filter_function.__name__}: {e}")
                # Decide if filtering should stop or continue on error. Continuing here.
        else:
            print(f"Warning: Unknown priority number {priority} found in user_priority.")

    # Special case: Apply feelings filter again if importance is low, regardless of priority order?
    # TODO: Clarify the logic here. Should this always run if importance <= 2, potentially overriding priority?
    if selected_importance <= 2 and 1 not in priority_order: # Only apply if not already applied via priority
         print(f"\nApplying additional filter: filter_by_feelings (as importance <= 2)")
         try:
            shortlist = filter_by_feelings(shortlist, selected_importance)
            print(f"Shortlist size after additional feelings filter: {len(shortlist)}")
            print(f"Shortlist content: {shortlist}") # Debugging output
         except Exception as e:
             print(f"Error during additional feelings filter: {e}")


    # --- Add Final Shortlist to User's Recommendations ---
    # Add the filtered module names to the current user's recommended_modules list.
    print(f"\nFinal shortlist before adding to user recommendations: {len(shortlist)} modules")
    print(shortlist)

    # Use the User model's method to add each module. This handles DB interaction.
    for module_name in shortlist:
        # It's crucial that `add_recommended_module` just performs the action
        # and doesn't return a response object here.
        try:
             current_user.add_recommended_module(module_name)
        except Exception as e:
             print(f"Error adding recommended module '{module_name}' for user {current_user.email}: {e}")
             # Decide on error handling: skip module, stop process, etc. Skipping here.

    # Verify final recommendations stored for the user (for debugging).
    final_recommended = current_user.get_recommended_modules()
    print(f"Final recommended modules stored for user {current_user.email}: {len(final_recommended)}")
    print(final_recommended)

    # --- Return Recommendations ---
    # Return the final shortlist of recommended module names as a JSON response.
    # Ensure the key matches what the frontend expects.
    return jsonify({"recommended_modules": shortlist}), 200

# --- Filtering Functions ---

def filter_by_aspect(current_shortlist, selected_aspects):
    """
    Filter a list of module names based on selected aspects (topics).

    Keeps modules that contain at least one of the `selected_aspects` with a
    positive review score of 70% or higher in the `TopicByModule` table.

    Args:
        current_shortlist (list): The list of module names to filter.
        selected_aspects (list): A list of topic strings the user cares about.

    Returns:
        list: A filtered list of module names meeting the criteria.
    """
    # If no aspects are selected, no filtering is needed based on aspects.
    if not selected_aspects:
        print("No aspects selected, skipping aspect filter.")
        return current_shortlist

    # Create a new list to store modules that meet the criteria.
    filtered_list = []
    # Iterate through the modules currently in the shortlist.
    for module_name in current_shortlist:
        try:
            # Query the TopicByModule table for all topics related to the current module.
            # TODO: Ensure 'name' in TopicByModule corresponds to Module.name
            module_topics = TopicByModule.query.filter_by(name=module_name).all()

            # Check if any topic for this module matches the selected aspects and review threshold.
            found_matching_aspect = False
            for topic in module_topics:
                # Check if the topic name is in the user's selected aspects AND
                # if its positive review score meets the threshold (>= 70).
                if topic.topic in selected_aspects and \
                   topic.positive_reviews_topic is not None and \
                   topic.positive_reviews_topic >= 70:
                    found_matching_aspect = True
                    break # Found a matching aspect, no need to check other topics for this module.

            # If a matching aspect was found, add the module to the filtered list.
            if found_matching_aspect:
                filtered_list.append(module_name)
            else:
                print(f"Filtering out '{module_name}' (Aspect filter: No matching aspect >= 70% found).")
        except Exception as e:
            print(f"Error filtering module '{module_name}' by aspect: {e}")
            # Decide whether to keep or remove module on error. Keeping it here by not filtering it out.
            # If module data is crucial, consider removing or logging more prominently.
            if module_name in current_shortlist: # Ensure it's still in the original list context
                 filtered_list.append(module_name) # Keep module if error occurred during its processing

    return filtered_list


def filter_by_feelings(current_shortlist, selected_importance):
    """
    Filter a list of module names based on overall positive reviews ('feelings').

    If `selected_importance` is 1 or 2, it keeps modules where the overall
    positive review score in the `Module` table is 70% or higher.
    If `selected_importance` is greater than 2, it returns the list unfiltered.

    Args:
        current_shortlist (list): The list of module names to filter.
        selected_importance (int): The user's importance level for feelings.

    Returns:
        list: A filtered list of module names (or the original list if importance > 2).
    """
    # If the importance level is high (e.g., > 2), the user doesn't prioritize feelings,
    # so we skip this filter and return the list as is.
    if selected_importance > 2:
        print("Feelings importance > 2, skipping feelings filter.")
        return current_shortlist

    print("Applying feelings filter (importance <= 2)...")
    filtered_list = []
    # Iterate through the modules currently in the shortlist.
    for module_name in current_shortlist:
        try:
            # Retrieve the corresponding Module object from the database.
            module_data = Module.query.filter_by(name=module_name).first()

            # Check if module data was found in the database.
            if not module_data:
                print(f"Warning: Module '{module_name}' not found in Module table during feelings filter. Skipping.")
                continue # Skip this module if its data can't be retrieved.

            # Log the review value for debugging (optional).
            # print(f"Module '{module_name}': Positive Reviews = {module_data.positive_reviews}%")

            # Apply the filtering condition: positive reviews must be >= 70%.
            # Handle cases where positive_reviews might be None.
            if module_data.positive_reviews is not None and module_data.positive_reviews >= 70:
                filtered_list.append(module_name) # Keep the module if it meets the criteria.
            else:
                 print(f"Filtering out '{module_name}' (Feelings filter: Positive reviews < 70% or None).")
        except Exception as e:
            print(f"Error filtering module '{module_name}' by feelings: {e}")
            # Decide error handling. Keeping module here.
            if module_name in current_shortlist:
                 filtered_list.append(module_name) # Keep module if error occurred

    return filtered_list


def filter_by_subject(current_shortlist, selected_categories):
    """
    Filter a list of module names based on selected subject categories.

    Uses a hardcoded dictionary (`modules_each_cat`) mapping category names
    to lists of module names belonging to that category. Keeps only modules
    from the `current_shortlist` that are present in the lists corresponding
    to the `selected_categories`.

    Args:
        current_shortlist (list): The list of module names to filter.
        selected_categories (list): A list of category strings selected by the user.

    Returns:
        list: A filtered list containing only modules from the selected categories
              that were also present in the original `current_shortlist`.
    """
    # If no categories are selected, no filtering is needed based on subject.
    if not selected_categories:
        print("No categories selected, skipping subject filter.")
        return current_shortlist

    # Hardcoded mapping of categories to module names.
    #       for easier maintenance and scalability.
    modules_each_cat = {
        "AI & Machine Learning": ['Machine Learning', 'Applied Machine Learning in Python', 'Mobile Robots'],
        "Algorithms": ['Algorithmic Toolbox', 'Data Structures and Algorithms in Java'],
        "Big Data": ['Introduction to Big Data', 'Cloud Computing Fundamentals'],
        "Business & Technology": ['Digital Business Models'],
        "C++ Programming": ['Object-Oriented Data Structures in C++'],
        "Cyber Security": ['Information Security: Context and Introduction', 'Computer Networks and Security', 'Ethical Hacking and Penetration Testing'],
        "Data Analytics": ['Data Analytics for Lean Six Sigma'],
        "Data Management": ['Research Data Management and Sharing'],
        "Data Science": ['The Data Scientist’s Toolbox', 'Introduction to Data Science in Python'],
        "Data Visualization": ['Applied Plotting, Charting & Data Representation in Python'],
        "Databases": ['Using Databases with Python', 'SQL for Data Science', 'Database Administration with PostgreSQL'],
        "Financial Analysis": ['Python and Statistics for Financial Analysis'],
        "Problem Solving": ['Computational Thinking for Problem Solving'],
        "Programming Basics": ['Programming Fundamentals', 'Introduction to Computer Programming'],
        "Programming Languages": ['Programming Languages, Part A'],
        "Python & Web Development": ['Full-Stack Web Development with React'],
        "Python Programming": ['Programming for Everybody (Getting Started with Python)', 'Python Basics', 'Python Functions, Files, and Dictionaries', 'Python Programming: A Concise Introduction'],
        "Quantum Computing": ['The Introduction to Quantum Computing', 'Quantum Information Theory'],
        "Software Engineering": ['Object-Oriented Design', 'Mobile App Development with Flutter', 'Software Testing and Quality Assurance', 'Microservices Architecture']
    }

    # Create a set of allowed module names based on the selected categories.
    allowed_modules = set()
    for category in selected_categories:
        if category in modules_each_cat:
            # Add all modules associated with the selected category to the set.
            allowed_modules.update(modules_each_cat[category])
        else:
            print(f"Warning: Selected category '{category}' not found in hardcoded map.")

    # Filter the current shortlist, keeping only modules present in the allowed set.
    # Using list comprehension for concise filtering.
    filtered_list = [module for module in current_shortlist if module in allowed_modules]

    # Log which modules were filtered out (optional debugging).
    # removed_modules = set(current_shortlist) - set(filtered_list)
    # if removed_modules:
    #      print(f"Filtering out modules (Subject filter): {removed_modules}")

    return filtered_list

# --- Potentially Redundant Helper Function ---

def get_saved_modules2():
    """
    Retrieve the list of saved module names for the current user.

    Accesses the `saved_modules` attribute, potentially decoding it from JSON if needed.

    Returns:
        list: A list of saved module names.
    """
    # Access the saved_modules attribute from the current_user object.
    saved_modules_data = current_user.saved_modules

    # The User model's `saved_modules` is stored as a JSON string.
    # It needs to be decoded into a Python list. Use the model's getter method preferably.
    # Fallback to manual JSON loading if necessary.
    if isinstance(saved_modules_data, str):
        try:
            # Attempt to parse the JSON string into a list.
            saved_modules_list = json.loads(saved_modules_data)
        except json.JSONDecodeError:
            print(f"Warning: Could not decode saved_modules JSON for user {current_user.email}. Returning empty list.")
            saved_modules_list = [] # Return empty list on decoding error.
    elif isinstance(saved_modules_data, list):
         # If it's already a list (less likely based on model comments), use it directly.
         saved_modules_list = saved_modules_data
    else:
        # Handle unexpected types.
        print(f"Warning: Unexpected type for saved_modules for user {current_user.email}. Returning empty list.")
        saved_modules_list = []

    # Prefer using the model's getter method:
    # saved_modules_list = current_user.get_saved_modules() # Assumes this method handles JSON decoding

    return saved_modules_list