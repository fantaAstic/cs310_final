"""
Module Routes Blueprint.

This blueprint handles routes related to retrieving, adding, and managing
academic modules, as well as user-specific module lists (saved, taught, selected, recommended).
It interacts with the Module, User, and TopicByModule models and the database session.
"""

# Third-party imports
from flask import Blueprint, jsonify, request
from models import Module, User, db, TopicByModule # Database models and the db session instance
from flask_login import login_required, current_user # gives access to the current User instance to use the defined func
import json

# Create a Blueprint instance named 'module'.
# Routes defined with this blueprint will be prefixed (e.g., /modules) when registered in the main app.
module_bp = Blueprint('module', __name__)

# Route to get a specific module by title
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
    module = Module.query.filter_by(title=module_title).first()
    if not module:
        return jsonify({"error": "Module not found"}), 404
    
    return jsonify({
        "id": module.id,
        "title": module.title,
        "outlook": module.outlook,
        "positive_reviews": module.positive_reviews,
        "negative_reviews": module.negative_reviews,
        "category": module.category,
        "teacher_feedback_recommendation": module.teacher_feedback_recommendation,
        "similar_modules": module.similar_modules.split(",")
    }), 200

# Route to save or update a module (if required)
@module_bp.route('/add', methods=['POST'])
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
    data = request.get_json()
    
    # Ensure all necessary fields are provided
    required_fields = ["title", "outlook", "positive_reviews", "negative_reviews", "category", "teacher_feedback_recommendation", "similar_modules"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if module already exists
    existing_module = Module.query.filter_by(title=data['title']).first()
    if existing_module:
        return jsonify({"error": "Module already exists"}), 400
    
    # Create and save the new module
    new_module = Module(
        title=data['title'],
        outlook=data['outlook'],
        positive_reviews=data['positive_reviews'],
        negative_reviews=data['negative_reviews'],
        category=data['category'],
        teacher_feedback_recommendation=data['teacher_feedback_recommendation'],
        similar_modules=",".join(data['similar_modules'])
    )
    
    db.session.add(new_module)
    db.session.commit()
    
    return jsonify({"message": "Module added successfully"}), 201

# Route to get module summary by category
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
    modules = Module.query.filter_by(category=category).all()
    if not modules:
        return jsonify({"error": "No modules found for this category"}), 404
    
    module_data = [
        {
            "id": module.id,
            "title": module.title,
            "outlook": module.outlook,
            "positive_reviews": module.positive_reviews,
            "negative_reviews": module.negative_reviews,
            "category": module.category,
            "teacher_feedback_recommendation": module.teacher_feedback_recommendation,
            "similar_modules": module.similar_modules.split(",")
        }
        for module in modules
    ]
    return jsonify(module_data), 200

@module_bp.route('/saved_modules', methods=['GET'])
@login_required
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
    """Get the list of saved modules for the logged-in user."""
    saved_modules = current_user.get_saved_modules()
    
    # Print for debugging
    print(f"Saved Modules for {current_user.email}: {saved_modules} (Type: {type(saved_modules)})")
    
    return jsonify({"saved_modules": saved_modules})  # Ensure it is a list

@module_bp.route('/saved_modules2', methods=['GET'])
@login_required
def get_saved_modules2():
    """Get the list of saved modules for the logged-in user."""
    saved_modules = current_user.get_saved_modules()
    
    # Print for debugging
    print(f"Saved Modules for {current_user.email}: {saved_modules} (Type: {type(saved_modules)})")
    
    return saved_modules # Ensure it is a list

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
    """Add a module to saved_modules."""
    data = request.json
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    current_user.add_saved_module(module_name)
    return jsonify({"message": "Module added", "saved_modules": current_user.get_saved_modules()})


@module_bp.route('/saved_modules/remove', methods=['DELETE'])
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
    data = request.json
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    current_user.remove_saved_module(module_name)
    return jsonify({"message": "Module removed", "saved_modules": current_user.get_saved_modules()})


@module_bp.route('/taught_modules', methods=['GET'])
@login_required
def get_taught_modules():
    """
    Get the list of taught module names for the currently logged-in user.

    Uses the `get_taught_modules` method defined in the User model.

    Requires:
        User must be logged in.

    Returns:
        JSON response containing a list of taught module names.
        Example: {"taught_modules": ["Advanced Calculus", "Linear Algebra"]}
        Status Codes:
        - 200: Successfully retrieved taught modules.
    """
    taught_modules = json.loads(current_user.taught_modules) if current_user.taught_modules else []

    # Print for debugging
    print(f"Taught Modules for {current_user.email}: {taught_modules} (Type: {type(taught_modules)})")

    return jsonify({"taught_modules": taught_modules})  # Ensure it is a list

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
    """Add a module to taught_modules."""
    data = request.json
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    current_user.add_taught_module(module_name)
    return jsonify({"message": "Module added", "taught_modules": current_user.get_taught_modules()})


@module_bp.route('/taught_modules/remove', methods=['DELETE'])
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
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    current_user.remove_taught_module(module_name)
    return jsonify({"message": "Module removed", "taught_modules": current_user.get_taught_modules()})

from flask import Response

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
    """Get the number of saved modules for the logged-in user."""
    saved_modules = current_user.get_saved_modules()
    
    # Debugging log
    print(f"Saved Modules Count for {current_user.email}: {len(saved_modules)}")

    return Response(str(len(saved_modules)), status=200, mimetype='text/plain')

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
    taught_modules = json.loads(current_user.taught_modules) if current_user.taught_modules else []
    
    # Debugging log
    print(f"Taught Modules Count for {current_user.email}: {len(taught_modules)}")

    return Response(str(len(taught_modules)), status=200, mimetype='text/plain')

# utility funcs for the fetching and displaying of module data
@module_bp.route('/modules/titles', methods=['GET'])
def get_module_titles():
    titles = [module.get_title() for module in Module.query.all()]
    return jsonify(titles), 200

@module_bp.route('/modules/outlooks', methods=['GET'])
def get_module_outlooks():
    outlooks = [module.get_outlook() for module in Module.query.all()]
    return jsonify(outlooks), 200

@module_bp.route('/modules/positive_reviews', methods=['GET'])
def get_positive_reviews():
    positive_reviews = [module.get_positive_reviews() for module in Module.query.all()]
    return jsonify(positive_reviews), 200

@module_bp.route('/modules/negative_reviews', methods=['GET'])
def get_negative_reviews():
    negative_reviews = [module.get_negative_reviews() for module in Module.query.all()]
    return jsonify(negative_reviews), 200

@module_bp.route('/modules/categories', methods=['GET'])
def get_category():
    category = [module.get_category() for module in Module.query.all()]
    return jsonify(category), 200

@module_bp.route('/modules/teacher_feedback', methods=['GET'])
def get_teacher_feedback():
    feedback = [module.get_teacher_feedback_recommendation() for module in Module.query.all()]
    return jsonify(feedback), 200

@module_bp.route('/modules/similar_modules', methods=['GET'])
def get_similar_modules():
    similar = [module.get_similar_modules() for module in Module.query.all()]
    return jsonify(similar), 200

@module_bp.route('/modules/topics', methods=['GET'])
def get_topics():
    topics = [module.get_topics() for module in Module.query.all()]
    return jsonify(topics), 200

@module_bp.route('/selected/clear', methods=['DELETE'])
@login_required  # Ensure the user is logged in before making this request
def clear_selected_modules():
    # Clear the selected modules list
    current_user.set_selected_modules([])  # Set it to an empty list
    db.session.commit()

    return jsonify({"message": "All selected modules cleared successfully!"}), 200

@module_bp.route('/recommended/clear', methods=['DELETE'])
@login_required  # Ensure the user is logged in before making this request
def clear_recommended_modules():
    # Clear the recommended modules list
    current_user.set_recommended_modules([])  # Set it to an empty list
    db.session.commit()

    return jsonify({"message": "All recommended modules cleared successfully!"}), 200

@module_bp.route('/selected_retrieve', methods=['GET'])
@login_required  # Ensure the user is logged in before making this request
def get_selected_modules():
    """Get the list of selected modules for the logged-in user."""
    selected_modules = json.loads(current_user.selected_modules) if current_user.selected_modules else []

    # Print for debugging
    print(f"Selected Modules for {current_user.email}: {selected_modules} (Type: {type(selected_modules)})")

    return jsonify({"selected_modules": selected_modules})  # Ensure it is a list

@module_bp.route('/recommended_retrieve', methods=['GET'])
@login_required  # Ensure the user is logged in before making this request
def get_recommended_modules():
    """Get the list of recommended modules for the logged-in user."""
    recommended_modules = json.loads(current_user.recommended_modules) if current_user.recommended_modules else []

    # Print for debugging
    print(f"Recommended Modules for {current_user.email}: {recommended_modules} (Type: {type(recommended_modules)})")

    return jsonify({"recommended_modules": recommended_modules})  # Ensure it is a list

# add to selected list of modules
@module_bp.route('/selected_add', methods=['POST'])
@login_required
def add_selected_modules():
    """Add a module to selected_modules."""
    data = request.json
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    current_user.add_selected_module(module_name)
    return jsonify({"message": "Module added to selected modules ", "saved_modules": current_user.get_selected_modules()})

@module_bp.route('/selected_modules/remove', methods=['DELETE'])
@login_required
def remove_selected_module():
    """Remove a module from taught_modules."""
    data = request.json
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    current_user.remove_selected_module(module_name)
    return jsonify({"message": "Module removed", "taught_modules": current_user.get_selected_modules()})

@module_bp.route('/recommended_modules/remove', methods=['DELETE'])
@login_required
def remove_recommended_module():
    """Remove a module from recommended_modules."""
    data = request.json
    module_name = data.get("module_name")

    if not module_name:
        return jsonify({"error": "Module name is required"}), 400

    current_user.remove_recommended_module(module_name)
    return jsonify({"message": "Module removed", "taught_modules": current_user.get_recommended_modules()})


@module_bp.route('/modules_all', methods=['GET'])
def get_all_modules():
    module_name = request.args.get('module_name', '')  # Get the module_name query parameter
    
    if module_name:
        modules = Module.query.filter(Module.name.ilike(f'%{module_name}%')).all()  # Filter modules by name
    else:
        modules = Module.query.all()  # Return all modules if no filter is provided
    
    modules_list = []
    for module in modules:
        module_data = {
            "id": module.id,
            "name": module.name,
            "outlook": module.outlook,
            "positive": f"{module.positive_reviews}%",
            "negative": f"{module.negative_reviews}%",
            "categories": module.category,
            "summary": module.summary,
            "teacher_feedback_recommendation": module.teacher_feedback_recommendation,
            "teacher_feedback_recommendation_shortform": module.teacher_feedback_recommendation_shortform,
            "topics": module.topics,
            "analysis_refs": module.analysis_refs,
        }
        modules_list.append(module_data)
    
    return jsonify(modules_list)

@module_bp.route('/topics_modules', methods=['GET'])
def get_topics_by_module():
    try:
        module_name = request.args.get('name')  # Get module name from query params
        topic_name = request.args.get('topic')  # Get topic from query params

        if not module_name or not topic_name:
            return jsonify({"error": "Module name and topic are required"}), 400

        topic_entry = TopicByModule.query.filter_by(name=module_name, topic=topic_name).first()

        if not topic_entry:
            return jsonify({"message": "No matching topic found"}), 404

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

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
