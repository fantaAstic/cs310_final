"""
Recommendation Routes Blueprint.

This blueprint handles routes related to generating module recommendations
for users based on their preferences. It interacts with User, Module,
and TopicByModule models.
"""

from flask import Blueprint, request, jsonify
from models import User, Module, TopicByModule, db  # database and required tables
from flask_login import login_required, current_user
import json


# Create a Blueprint instance named 'recommendation'.
# Routes defined here will be prefixed (e.g., /recommendations) when registered.
rec_bp = Blueprint('recommendation', __name__)

# Add to recommended list of modules
def add_recommended_modules(module_name: str):
    """Add a module to recommended_modules."""
    current_user.add_recommended_module(module_name)
    return jsonify({"message": "Module added to recommended modules ", "recommended_modules": current_user.get_recommended_modules()})

@rec_bp.route('/generate_recommendations_student', methods=['POST'])
@login_required  # Ensure the user is logged in before making this request
def generate_user_recommendations():
    '''
    Process user preferences from the request data and generate recommendations.
    '''
    data = request.json  # Receive JSON data from the frontend

    # Log the incoming request for debugging
    print("Received data:", data)

    # Remove all previously recommended modules for the current user
    existing_modules = current_user.get_recommended_modules()
    for module in existing_modules:
        current_user.remove_recommended_module(module)
    
    # Log the existing modules before removal
    print("Existing modules before removal:", existing_modules)

    # Remove all previously recommended modules for the current user
    for module in existing_modules:
        current_user.remove_recommended_module(module)

    # Log the state of recommended modules after removal
    remaining_modules = current_user.get_recommended_modules()
    print("Remaining modules after removal:", remaining_modules)

    if not remaining_modules:
        print("All old recommendations have been successfully removed.")
    else:
        print(f"There are still {len(remaining_modules)} modules remaining in the recommendations.")

    # Extract user preferences
    priority_order = data.get("user_priority", [])
    print(f"The user's priorities {priority_order}.")
    selected_importance = data.get("selected_importance", 1)
    print(f"Degree to which the user cares about feelings {selected_importance}.")
    selected_categories = data.get("selected_categories", [])
    print(f"subject area the user cares about {selected_categories}.")
    selected_aspects = data.get("selected_aspects", [])
    print(f"topics that the user cares about {selected_aspects}.")

    # Initialize shortlist and retrieve all modules
    shortlist = [module.name for module in Module.query.all()]  # Get all module names

    # Mapping priorities to functions
    priority_mapping = {1: filter_by_feelings, 2: filter_by_subject, 3: filter_by_aspect}
    
    print(f"Initial shortlist (all modules): {shortlist}")

    for priority in priority_order:  # Reverse the priority order for filtering?
        filter_function = priority_mapping.get(priority)
        if filter_function:
            if priority == 1:
                shortlist = filter_by_feelings(shortlist, selected_importance)
            elif priority == 2:
                shortlist = filter_by_subject(shortlist, selected_categories)
            elif priority == 3:
                shortlist = filter_by_aspect(shortlist, selected_aspects)
            print(f"Shortlist after applying {filter_function.__name__}: {shortlist}")  # Debugging output
    if selected_importance <= 2:
        shortlist = filter_by_feelings(shortlist, selected_importance)

    # Ensure that we only add **module names**, not jsonify responses
    for module in shortlist:
        current_user.add_recommended_module(module)  # Add directly to the user's recommended modules

    print("Final shortlist before returning:", shortlist)  # Debugging output

    return jsonify({"recommended_modules": shortlist})  # Ensure it returns a proper JSON object

def filter_by_aspect(shortlist, selected_aspects):
    '''
    Filter modules based on topics from TopicByModule table and selected aspects.
    '''
    filtered_list = shortlist  # Start with the full shortlist

    for module_name in shortlist:
        module_topics = TopicByModule.query.filter_by(name=module_name).all()

        # Check for any matching aspect with positive reviews > 70
        valid_module = False
        for topic in module_topics:
            if topic.topic in selected_aspects and topic.positive_reviews_topic >= 70:
                valid_module = True
                break

        if not valid_module:
            filtered_list.remove(module_name)  # Remove module if it doesn't match

    return filtered_list


def filter_by_feelings(shortlist, selected_importance):
    '''
    Filter modules based on positive reviews and positive emotions.
    '''
    if selected_importance > 2:
        # If the importance is greater than 2, no filtering on feelings is done
        return shortlist
    
    # do filtering by feelings

    filtered_list = shortlist  # Start with the full shortlist

    for module_name in shortlist:
        module_data = Module.query.filter_by(name=module_name).first()

         # Check if the module data exists
        if not module_data:
            print(f"Module {module_name} not found.")
            continue  # Skip this module if it's not found in the database

        # Log the review and emotion values to debug
        print(f"Module {module_name}: Positive Reviews = {module_data.positive_reviews}")

        if selected_importance <= 2:
            if module_data.positive_reviews < 70:
                print(f"Removing {module_name} because it doesn't have positive reviews.")
                filtered_list.remove(module_name)  # Remove if it doesn't meet the criteria
    return filtered_list


def filter_by_subject(shortlist, selected_categories):
    '''
    Filter modules based on the selected categories using the modules_each_cat dictionary.
    '''
    filtered_list = []
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
    for category in selected_categories:
        if category in modules_each_cat:
            # Add modules from the matching category to the filtered list
            filtered_list.extend([module for module in modules_each_cat[category] if module in shortlist])

    return filtered_list

def get_saved_modules2():
    '''
    Retrieve saved modules for the current user.
    '''
    saved_modules = current_user.saved_modules  # Assuming this is a list of module names (strings)

    if isinstance(saved_modules, str):  # If it's a string, convert it back to a list
        saved_modules = json.loads(saved_modules)

    return saved_modules  # Ensure we return a proper list
