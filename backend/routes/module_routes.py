"""
Module Routes Blueprint.

This blueprint handles routes related to retrieving, adding, and managing
academic modules, as well as user-specific module lists (saved, taught, selected, recommended).
It interacts with the Module, User, and TopicByModule models and the database session.
"""

# Third-party imports
from flask import Blueprint, jsonify, request, Response # Core Flask components
from flask_login import login_required, current_user    # Utilities for handling logged-in users

# Standard library imports
import json # For handling JSON data, especially loading from Text columns

# Local application/library specific imports
from models import Module, User, db, TopicByModule # Database models and the db session instance

# Create a Blueprint instance named 'module'.
# Routes defined with this blueprint will be prefixed (e.g., /modules) when registered in the main app.
module_bp = Blueprint('module', __name__)

# --- General Module Information Routes ---

@module_bp.route('/<string:module_title>', methods=['GET'])
def get_module_by_title(module_title):
    """
    Retrieve details of a specific module by its title.

    Searches the database for a module matching the provided title.
    Note: The model seems to use 'name' internally, but the route uses 'title'.
          Ensure consistency or adjust the query/model. This implementation
          assumes the model field is actually `name`.

    Args:
        module_title (str): The title (name) of the module passed in the URL.

    Returns:
        JSON response containing module details if found, or an error message.
        Status Codes:
        - 200: Module found and details returned.
        - 404: Module with the specified title not found.
    """
    # Query the database for a module with the matching name (assuming 'name' is the correct field).
    # Use .first() to get the first result or None if not found.
    # TODO: Verify if the model field is 'title' or 'name'. Using 'name' based on model definition.
    module = Module.query.filter_by(name=module_title).first() # Adjusted to filter by 'name'

    # If no module is found, return a 404 Not Found error.
    if not module:
        return jsonify({"error": "Module not found"}), 404

    # If module is found, prepare the data for the JSON response.
    module_data = {
        "id": module.id,
        "name": module.name, # Return 'name' consistent with model
        "outlook": module.outlook,
        "positive_reviews": module.positive_reviews,
        "negative_reviews": module.negative_reviews,
        "category": module.category,
        "teacher_feedback_recommendation": module.teacher_feedback_recommendation,
        # Assuming 'similar_modules' is stored as a comma-separated string. Split into a list.
        # TODO: Verify 'similar_modules' attribute exists and its storage format.
        "similar_modules": module.similar_modules.split(",") if hasattr(module, 'similar_modules') and module.similar_modules else []
    }
    # Return the module data as JSON with a 200 OK status.
    return jsonify(module_data), 200

@module_bp.route('/add', methods=['POST'])
# @login_required 
def add_module():
    """
    Add a new module to the database.

    Expects a JSON payload with module details. Validates required fields
    and checks if a module with the same title already exists before creating.

    Request Body (JSON):
        {
            "title": "Module Title",
            "outlook": "...",
            "positive_reviews": %,
            "negative_reviews": %,
            "category": "...",
            "teacher_feedback_recommendation": "...",
            "similar_modules": ["Module A", "Module B"] // Or comma-separated string?
        }

    Returns:
        JSON response indicating success or failure.
        Status Codes:
        - 201: Module created successfully.
        - 400: Missing required fields or module already exists.
        - 500: Internal server error.
    """
    # Get JSON data from the request body.
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body must be JSON.'}), 400

    # Define the fields required in the request payload.
    # TODO: Adjust field names based on actual Module model ('title' vs 'name'). Using 'name'.
    required_fields = ["name", "outlook", "positive_reviews", "negative_reviews", "category", "teacher_feedback_recommendation", "similar_modules"]

    # Check if all required fields are present in the received data.
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if a module with the same name already exists in the database.
    # TODO: Assuming the model field is 'name'.
    existing_module = Module.query.filter_by(name=data['name']).first()
    if existing_module:
        # Return an error if the module already exists. 409 Conflict might be more appropriate.
        return jsonify({"error": "Module already exists"}), 400

    # Create a new Module instance with data from the request.
    try:
        new_module = Module(
            name=data['name'], # Use 'name' consistent with model
            outlook=data['outlook'],
            positive_reviews=data['positive_reviews'], # Assuming input is already cleaned integer/percentage
            negative_reviews=data['negative_reviews'], # Assuming input is already cleaned integer/percentage
            category=data['category'],
            teacher_feedback_recommendation=data['teacher_feedback_recommendation'],
            # Assuming 'similar_modules' comes as a list and needs joining,
            # or comes as a string and needs no processing. Joining list here.
            # TODO: Confirm expected format of 'similar_modules' in request and DB storage.
            similar_modules=",".join(data.get('similar_modules', [])) if isinstance(data.get('similar_modules'), list) else data.get('similar_modules', '')
            # Add other fields like summary, topics, etc. if needed
        )

        # Add the new module to the database session and commit the changes.
        db.session.add(new_module)
        db.session.commit()

        # Return a success message with a 201 Created status code.
        return jsonify({"message": "Module added successfully"}), 201

    except Exception as e:
        # Handle potential errors during object creation or database commit.
        db.session.rollback()
        print(f"Error adding module: {e}")
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500


@module_bp.route('/category/<string:category>', methods=['GET'])
def get_module_by_category(category):
    """
    Retrieve a list of modules belonging to a specific category.

    Queries the database for all modules matching the provided category name.

    Args:
        category (str): The category name passed in the URL.

    Returns:
        JSON response containing a list of module details if found, or an error message.
        Status Codes:
        - 200: Modules found and details returned.
        - 404: No modules found for the specified category.
    """
    # Query the database for all modules matching the category.
    modules = Module.query.filter_by(category=category).all()

    # If no modules are found for the category, return a 404 error.
    if not modules:
        return jsonify({"error": "No modules found for this category"}), 404

    # Prepare a list of dictionaries, each containing details for a module.
    module_data = [
        {
            "id": module.id,
            "name": module.name, # Use 'name' consistent with model
            "outlook": module.outlook,
            "positive_reviews": module.positive_reviews,
            "negative_reviews": module.negative_reviews,
            "category": module.category,
            "teacher_feedback_recommendation": module.teacher_feedback_recommendation,
            # Split comma-separated similar_modules string into a list.
            # TODO: Verify 'similar_modules' attribute and format.
            "similar_modules": module.similar_modules.split(",") if hasattr(module, 'similar_modules') and module.similar_modules else []
        }
        for module in modules # Iterate through the list of found modules
    ]
    # Return the list of module data as JSON with a 200 OK status.
    return jsonify(module_data), 200

# --- User-Specific Module List Routes (Saved, Taught, Selected, Recommended) ---

# --- Saved Modules ---

@module_bp.route('/saved_modules', methods=['GET'])
@login_required # Ensures only logged-in users can access this endpoint.
def get_saved_modules():
    """
    Get the list of saved module names for the currently logged-in user.

    Uses the `get_saved_modules` method defined in the User model.

    Requires:
        User must be logged in.

    Returns:
        JSON response containing a list of saved module names.
        Example: {"saved_modules": ["Module A", "Module B"]}
        Status Codes:
        - 200: Successfully retrieved saved modules.
    """
    # Retrieve the list of saved module names using the User model method.
    saved_modules = current_user.get_saved_modules()

    # Print for debugging purposes (optional).
    print(f"Saved Modules for {current_user.email}: {saved_modules} (Type: {type(saved_modules)})")

    # Return the list within a JSON object.
    return jsonify({"saved_modules": saved_modules}), 200

@module_bp.route('/saved_modules2', methods=['GET'])
@login_required
def get_saved_modules2():
    """
    Get the list of saved modules for the logged-in user (alternative endpoint).

    Identical functionality to /saved_modules but returns the list directly,
    which might not be standard practice for APIs (usually return a JSON object).

    Requires:
        User must be logged in.

    Returns:
        JSON list of saved module names.
        Example: ["Module A", "Module B"]
        Status Codes:
        - 200: Successfully retrieved saved modules.
    """
    saved_modules = current_user.get_saved_modules()
    print(f"Saved Modules (v2) for {current_user.email}: {saved_modules} (Type: {type(saved_modules)})")
    # Return the list directly (Flask will jsonify it).
    return jsonify(saved_modules), 200 # Explicitly jsonify for clarity

@module_bp.route('/saved_modules/add', methods=['POST'])
@login_required
def add_saved_module():
    """
    Add a module name to the logged-in user's saved modules list.

    Expects a JSON payload with {"module_name": "Module Name"}.
    Calls the `add_saved_module` method on the current_user instance.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {"module_name": "The Module Name"}

    Returns:
        JSON response confirming the addition and the updated list of saved modules.
        Status Codes:
        - 200: Module added successfully.
        - 400: Module name not provided in the request.
    """
    # Get JSON data from the request.
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # Extract the module name from the JSON data.
    module_name = data.get("module_name")

    # Check if the module name was provided.
    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    # Call the User model method to add the module to the saved list.
    # This method handles checking for duplicates and committing to the database.
    current_user.add_saved_module(module_name)

    # Return a success message along with the updated list of saved modules.
    return jsonify({
        "message": f"Module '{module_name}' added to saved list",
        "saved_modules": current_user.get_saved_modules()
    }), 200

@module_bp.route('/saved_modules/remove', methods=['DELETE']) # Changed to DELETE as it's removing a resource
@login_required
def remove_saved_module():
    """
    Remove a module name from the logged-in user's saved modules list.

    Expects a JSON payload with {"module_name": "Module Name"}.
    Calls the `remove_saved_module` method on the current_user instance.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {"module_name": "The Module Name"}

    Returns:
        JSON response confirming the removal and the updated list of saved modules.
        Status Codes:
        - 200: Module removed successfully.
        - 400: Module name not provided in the request.
    """
    # Get JSON data from the request.
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # Extract the module name from the JSON data.
    module_name = data.get("module_name")

    # Check if the module name was provided.
    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    # Call the User model method to remove the module from the saved list.
    # This method handles checking if the module exists and committing to the database.
    current_user.remove_saved_module(module_name)

    # Return a success message along with the updated list of saved modules.
    return jsonify({
        "message": f"Module '{module_name}' removed from saved list",
        "saved_modules": current_user.get_saved_modules()
    }), 200

@module_bp.route('/saved_modules/count', methods=['GET'])
@login_required
def get_saved_modules_count():
    """
    Get the number of saved modules for the logged-in user.

    Retrieves the list of saved modules and returns its length.

    Requires:
        User must be logged in.

    Returns:
        Plain text response containing the count of saved modules.
        Status Codes:
        - 200: Count retrieved successfully.
    """
    # Get the list of saved modules.
    saved_modules = current_user.get_saved_modules()

    # Debugging log (optional).
    print(f"Saved Modules Count for {current_user.email}: {len(saved_modules)}")

    # Return the count as a plain text response.
    return Response(str(len(saved_modules)), status=200, mimetype='text/plain')

# --- Taught Modules ---

@module_bp.route('/taught_modules', methods=['GET'])
@login_required
def get_taught_modules():
    """
    Get the list of taught module names for the currently logged-in user.

    Uses the `get_taught_modules` method defined in the User model.

    Requires:
        User must be logged in (presumably a 'teacher' role).

    Returns:
        JSON response containing a list of taught module names.
        Example: {"taught_modules": ["Advanced Calculus", "Linear Algebra"]}
        Status Codes:
        - 200: Successfully retrieved taught modules.
    """
    # Retrieve the list of taught module names using the User model method.
    taught_modules = current_user.get_taught_modules()

    # Print for debugging purposes (optional).
    print(f"Taught Modules for {current_user.email}: {taught_modules} (Type: {type(taught_modules)})")

    # Return the list within a JSON object.
    return jsonify({"taught_modules": taught_modules}), 200

@module_bp.route('/taught_modules/add', methods=['POST'])
@login_required
def add_taught_module():
    """
    Add a module name to the logged-in user's taught modules list.

    Expects a JSON payload with {"module_name": "Module Name"}.
    Calls the `add_taught_module` method on the current_user instance.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {"module_name": "The Module Name"}

    Returns:
        JSON response confirming the addition and the updated list of taught modules.
        Status Codes:
        - 200: Module added successfully.
        - 400: Module name not provided in the request.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    # Call the User model method to add the module to the taught list.
    current_user.add_taught_module(module_name)
    return jsonify({
        "message": f"Module '{module_name}' added to taught list",
        "taught_modules": current_user.get_taught_modules()
    }), 200

@module_bp.route('/taught_modules/remove', methods=['DELETE']) # Changed to DELETE
@login_required
def remove_taught_module():
    """
    Remove a module name from the logged-in user's taught modules list.

    Expects a JSON payload with {"module_name": "Module Name"}.
    Calls the `remove_taught_module` method on the current_user instance.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {"module_name": "The Module Name"}

    Returns:
        JSON response confirming the removal and the updated list of taught modules.
        Status Codes:
        - 200: Module removed successfully.
        - 400: Module name not provided in the request.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    # Call the User model method to remove the module from the taught list.
    current_user.remove_taught_module(module_name)
    return jsonify({
        "message": f"Module '{module_name}' removed from taught list",
        "taught_modules": current_user.get_taught_modules()
    }), 200

@module_bp.route('/taught_modules/count', methods=['GET'])
@login_required
def get_taught_modules_count():
    """
    Get the number of taught modules for the logged-in user.

    Retrieves the list of taught modules and returns its length.

    Requires:
        User must be logged in.

    Returns:
        Plain text response containing the count of taught modules.
        Status Codes:
        - 200: Count retrieved successfully.
    """
    # Get the list of taught modules.
    taught_modules = current_user.get_taught_modules()

    # Debugging log (optional).
    print(f"Taught Modules Count for {current_user.email}: {len(taught_modules)}")

    # Return the count as plain text.
    return Response(str(len(taught_modules)), status=200, mimetype='text/plain')

# --- Selected Modules ---

@module_bp.route('/selected_retrieve', methods=['GET'])
@login_required
def get_selected_modules():
    """
    Get the list of selected module names for the currently logged-in user.

    Retrieves the list stored in the `selected_modules` attribute of the User model.

    Requires:
        User must be logged in.

    Returns:
        JSON response containing a list of selected module names.
        Example: {"selected_modules": ["Module C", "Module D"]}
        Status Codes:
        - 200: Successfully retrieved selected modules.
    """
    # Retrieve the list of selected module names using the User model method.
    selected_modules = current_user.get_selected_modules()

    # Print for debugging purposes (optional).
    print(f"Selected Modules for {current_user.email}: {selected_modules} (Type: {type(selected_modules)})")

    # Return the list within a JSON object.
    return jsonify({"selected_modules": selected_modules}), 200

@module_bp.route('/selected_add', methods=['POST'])
@login_required
def add_selected_module(): # Renamed function to match route intent
    """
    Add a module name to the logged-in user's selected modules list.

    Expects a JSON payload with {"module_name": "Module Name"}.
    Calls the `add_selected_module` method on the current_user instance.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {"module_name": "The Module Name"}

    Returns:
        JSON response confirming the addition and the updated list of selected modules.
        Status Codes:
        - 200: Module added successfully.
        - 400: Module name not provided in the request.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    # Call the User model method to add the module to the selected list.
    current_user.add_selected_module(module_name)
    # Return the updated *selected* modules list
    return jsonify({
        "message": f"Module '{module_name}' added to selected modules",
        "selected_modules": current_user.get_selected_modules()
    }), 200

@module_bp.route('/selected_modules/remove', methods=['DELETE'])
@login_required
def remove_selected_module():
    """
    Remove a module name from the logged-in user's selected modules list.

    Expects a JSON payload with {"module_name": "Module Name"}.
    Calls the `remove_selected_module` method on the current_user instance.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {"module_name": "The Module Name"}

    Returns:
        JSON response confirming the removal and the updated list of selected modules.
        Status Codes:
        - 200: Module removed successfully.
        - 400: Module name not provided in the request.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    # Call the User model method to remove the module from the selected list.
    current_user.remove_selected_module(module_name)
    # Return the updated *selected* modules list
    return jsonify({
        "message": f"Module '{module_name}' removed from selected list",
        "selected_modules": current_user.get_selected_modules()
    }), 200


@module_bp.route('/selected/clear', methods=['DELETE']) # Changed to DELETE
@login_required
def clear_selected_modules():
    """
    Clear all module names from the logged-in user's selected modules list.

    Sets the `selected_modules` attribute to an empty list and commits the change.

    Requires:
        User must be logged in.

    Returns:
        JSON response confirming the action.
        Status Codes:
        - 200: Selected modules cleared successfully.
        - 500: Internal server error during database commit.
    """
    try:
        # Call the User model method to set the selected modules to an empty list.
        current_user.set_selected_modules([])
        # Commit the change to the database.
        db.session.commit()
        print(f"Cleared selected modules for user {current_user.email}.")
        return jsonify({"message": "All selected modules cleared successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing selected modules for {current_user.email}: {e}")
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

# --- Recommended Modules ---

@module_bp.route('/recommended_retrieve', methods=['GET'])
@login_required
def get_recommended_modules():
    """
    Get the list of recommended module names for the currently logged-in user.

    Retrieves the list stored in the `recommended_modules` attribute of the User model.

    Requires:
        User must be logged in.

    Returns:
        JSON response containing a list of recommended module names.
        Example: {"recommended_modules": ["Module E", "Module F"]}
        Status Codes:
        - 200: Successfully retrieved recommended modules.
    """
    # Retrieve the list of recommended module names using the User model method.
    recommended_modules = current_user.get_recommended_modules()

    # Print for debugging purposes (optional).
    print(f"Recommended Modules for {current_user.email}: {recommended_modules} (Type: {type(recommended_modules)})")

    # Return the list within a JSON object.
    return jsonify({"recommended_modules": recommended_modules}), 200

# NOTE: No '/recommended_add' route is defined here, assuming recommendations are added by another process.

@module_bp.route('/recommended_modules/remove', methods=['DELETE'])
@login_required
def remove_recommended_module():
    """
    Remove a module name from the logged-in user's recommended modules list.

    Expects a JSON payload with {"module_name": "Module Name"}.
    Calls the `remove_recommended_module` method on the current_user instance.

    Requires:
        User must be logged in.

    Request Body (JSON):
        {"module_name": "The Module Name"}

    Returns:
        JSON response confirming the removal and the updated list of recommended modules.
        Status Codes:
        - 200: Module removed successfully.
        - 400: Module name not provided in the request.
    """
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    # Call the User model method to remove the module from the recommended list.
    current_user.remove_recommended_module(module_name)
    # Return the updated *recommended* modules list
    return jsonify({
        "message": f"Module '{module_name}' removed from recommended list",
        "recommended_modules": current_user.get_recommended_modules()
    }), 200

@module_bp.route('/recommended/clear', methods=['DELETE']) # Changed to DELETE
@login_required
def clear_recommended_modules():
    """
    Clear all module names from the logged-in user's recommended modules list.

    Sets the `recommended_modules` attribute to an empty list and commits the change.

    Requires:
        User must be logged in.

    Returns:
        JSON response confirming the action.
        Status Codes:
        - 200: Recommended modules cleared successfully.
        - 500: Internal server error during database commit.
    """
    try:
        # Call the User model method to set the recommended modules to an empty list.
        current_user.set_recommended_modules([])
        # Commit the change to the database.
        db.session.commit()
        print(f"Cleared recommended modules for user {current_user.email}.")
        return jsonify({"message": "All recommended modules cleared successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing recommended modules for {current_user.email}: {e}")
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

# --- Utility Routes for Module Data Aggregation ---
# These routes retrieve specific fields from ALL modules.

@module_bp.route('/modules/titles', methods=['GET'])
def get_module_titles():
    """Retrieve a list of all module titles (names)."""
    # Use the get_name() method from the Module model if available, otherwise access 'name'.
    # TODO: Verify Module model has get_name() or adjust to use module.name directly.
    titles = [module.get_name() for module in Module.query.all()]
    return jsonify(titles), 200

@module_bp.route('/modules/outlooks', methods=['GET'])
def get_module_outlooks():
    """Retrieve a list of all module outlooks."""
    # Use get_outlook() or access module.outlook.
    outlooks = [module.get_outlook() for module in Module.query.all()]
    return jsonify(outlooks), 200

@module_bp.route('/modules/positive_reviews', methods=['GET'])
def get_positive_reviews():
    """Retrieve a list of positive review scores/percentages for all modules."""
    # Use get_positive_reviews() or access module.positive_reviews.
    positive_reviews = [module.get_positive_reviews() for module in Module.query.all()]
    return jsonify(positive_reviews), 200

@module_bp.route('/modules/negative_reviews', methods=['GET'])
def get_negative_reviews():
    """Retrieve a list of negative review scores/percentages for all modules."""
    # Use get_negative_reviews() or access module.negative_reviews.
    negative_reviews = [module.get_negative_reviews() for module in Module.query.all()]
    return jsonify(negative_reviews), 200

@module_bp.route('/modules/categories', methods=['GET'])
def get_category(): # Function name is a bit generic, consider get_module_categories
    """Retrieve a list of categories for all modules."""
    # Use get_category() or access module.category.
    categories = [module.get_category() for module in Module.query.all()] # Renamed variable
    return jsonify(categories), 200

@module_bp.route('/modules/teacher_feedback', methods=['GET'])
def get_teacher_feedback():
    """Retrieve a list of teacher feedback recommendations for all modules."""
    # Use get_teacher_feedback_recommendation() or access attribute directly.
    feedback = [module.get_teacher_feedback_recommendation() for module in Module.query.all()]
    return jsonify(feedback), 200

@module_bp.route('/modules/similar_modules', methods=['GET'])
def get_similar_modules():
    """Retrieve a list of similar modules lists for all modules."""
    # Assumes get_similar_modules() returns a list (after parsing stored data).
    # TODO: Verify get_similar_modules() exists and functions as expected.
    similar = [module.get_similar_modules() for module in Module.query.all()]
    return jsonify(similar), 200

@module_bp.route('/modules/topics', methods=['GET'])
def get_topics():
    """Retrieve a list of topic lists for all modules."""
    # Assumes get_topics() returns a list (after parsing stored JSON).
    topics = [module.get_topics() for module in Module.query.all()]
    return jsonify(topics), 200

# --- Route for All Module Details (with Optional Filtering) ---

@module_bp.route('/modules_all', methods=['GET'])
def get_all_modules():
    """
    Retrieve a list of all modules, optionally filtered by name.

    Accepts an optional query parameter `module_name` for case-insensitive
    filtering of module names. Returns details for all modules if no
    filter is provided.

    Query Parameters:
        module_name (str, optional): A substring to filter module names by.

    Returns:
        JSON list of module details.
        Status Codes:
        - 200: Successfully retrieved modules.
    """
    # Get the optional 'module_name' query parameter from the request arguments.
    module_name_filter = request.args.get('module_name', None) # Use None as default

    query = Module.query # Start with a base query

    # If a filter value is provided, apply a case-insensitive 'like' filter.
    if module_name_filter:
        # Use ilike for case-insensitive matching. '%' are wildcards.
        query = query.filter(Module.name.ilike(f'%{module_name_filter}%'))

    # Execute the query (either filtered or unfiltered).
    modules = query.all()

    # Prepare the list of module data for the JSON response.
    modules_list = []
    for module in modules:
        module_data = {
            "id": module.id,
            "name": module.name,
            "outlook": module.outlook,
            # Format review percentages as strings with '%'.
            "positive": f"{module.positive_reviews}%" if module.positive_reviews is not None else "N/A",
            "negative": f"{module.negative_reviews}%" if module.negative_reviews is not None else "N/A",
            "categories": module.category, # Note: Field name mismatch ('categories' vs 'category')
            "summary": module.summary,
            "teacher_feedback_recommendation": module.teacher_feedback_recommendation,
            "teacher_feedback_recommendation_shortform": module.teacher_feedback_recommendation_shortform,
            # Assuming 'topics' is stored as a JSON string, load it. Handle potential errors.
            "topics": json.loads(module.topics) if module.topics else [],
            "analysis_refs": module.analysis_refs,
        }
        modules_list.append(module_data)

    # Return the list of modules as JSON.
    return jsonify(modules_list), 200


# --- Route for Topic Details within a Module ---

@module_bp.route('/topics_modules', methods=['GET'])
def get_topics_by_module():
    """
    Retrieve details for a specific topic within a specific module.

    Requires `name` (module name) and `topic` (topic name) as query parameters.
    Searches the TopicByModule table for a matching entry.

    Query Parameters:
        name (str): The name of the module.
        topic (str): The name of the topic within the module.

    Returns:
        JSON response containing the topic details if found, or an error/message.
        Status Codes:
        - 200: Topic details found and returned.
        - 400: Missing required query parameters (name or topic).
        - 404: No matching topic found for the given module and topic name.
        - 500: Internal server error.
    """
    try:
        # Get required query parameters.
        module_name = request.args.get('name')
        topic_name = request.args.get('topic')

        # Validate that both parameters were provided.
        if not module_name or not topic_name:
            return jsonify({"error": "Both 'name' (module name) and 'topic' query parameters are required"}), 400

        # Query the TopicByModule table for the specific entry.
        topic_entry = TopicByModule.query.filter_by(name=module_name, topic=topic_name).first()

        # If no matching entry is found, return a 404 message.
        if not topic_entry:
            return jsonify({"message": "No matching topic found for the specified module and topic"}), 404

        # Prepare the result dictionary from the found topic entry.
        result = {
            "id": topic_entry.id,
            "name": topic_entry.name,
            "topic": topic_entry.topic,
            "topic_outlook": topic_entry.topic_outlook,
            "topic_summary": topic_entry.topic_summary,
            "positive_reviews_topic": topic_entry.positive_reviews_topic,
            "negative_reviews_topic": topic_entry.negative_reviews_topic,
            "positive_emotions_topic": topic_entry.positive_emotions_topic,
            "negative_emotions_topic": topic_entry.negative_emotions_topic,
            "analysis_ref_topic": topic_entry.analysis_ref_topic
        }

        # Return the topic details as JSON.
        return jsonify(result), 200

    except Exception as e:
        # Handle any unexpected errors during query or processing.
        print(f"Error retrieving topic details: {e}")
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500