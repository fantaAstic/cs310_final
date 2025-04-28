"""
Authentication Routes Blueprint.

This blueprint handles user registration, login, logout, and profile updates.
It uses Flask-Login for session management and interacts with the User model
and the database session.
"""

# Third-party imports
from flask import Blueprint, request, jsonify # Core Flask components for routing, request handling, and JSON responses
from flask_login import login_user, logout_user, current_user # Functions for user session management

# Local application/library specific imports
from models import User         # The User database model
from database import db         # The SQLAlchemy database instance

# Create a Blueprint instance named 'auth'.
# Blueprints help organize routes in a modular way.
# '__name__' helps the blueprint locate its resources.
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Handle user registration requests.

    Expects a JSON payload with 'email', 'password', 'name', and 'role'.
    Optionally accepts 'year' if the role is 'Student'.
    Validates input, checks for existing users, creates a new user,
    hashes the password, saves the user to the database, and logs them in.

    Returns:
        JSON response indicating success or failure, along with user details
        on success, or an error message on failure.
        Status Codes:
        - 200: Registration and login successful.
        - 400: Missing required fields or user already exists.
        - 500: Internal server error during processing.
    """
    try:
        # Extract JSON data from the incoming POST request.
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Request body must be JSON.'}), 400

        # Retrieve required fields from the JSON data.
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role') # e.g., 'Student', 'Teacher'
        # Conditionally get 'year' only if the role is 'Student'.
        year = data.get('year') if role == 'Student' else None

        # --- Input Validation ---
        # Check if all essential fields were provided in the request.
        if not all([email, password, name, role]):
            return jsonify({'success': False, 'message': 'Missing required fields (email, password, name, role).'}), 400

        # --- Check for Existing User ---
        # Query the database to see if a user with this email already exists.
        if User.query.filter_by(email=email).first():
            # If a user exists, return an error response.
            return jsonify({'success': False, 'message': 'User with this email already exists.'}), 400 # 409 Conflict might also be appropriate

        # --- Create New User ---
        # Create an instance of the User model with the provided data.
        new_user = User(name=name, email=email, role=role, year=year)
        # Set the user's password securely using the set_password method (which hashes it).
        new_user.set_password(password)

        # Optional: Log the user creation process for debugging/monitoring.
        print(f"Attempting to create new user: Name={name}, Email={email}, Role={role}, Year={year}")

        # --- Database Interaction ---
        # Add the new User object to the SQLAlchemy session.
        db.session.add(new_user)
        # Commit the session to save the new user to the database.
        db.session.commit()
        print(f"User {email} created successfully with ID: {new_user.id}")

        # --- Automatic Login ---
        # Log the newly registered user in using Flask-Login's login_user function.
        # This establishes a user session.
        login_user(new_user)
        print(f"User {email} logged in automatically after registration.")

        # --- Success Response ---
        # Return a success response containing user details (excluding password hash).
        return jsonify({
            'success': True,
            'message': 'User registered and logged in successfully',
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email,
                'role': new_user.role,
                'year': new_user.year # Will be None if role is not 'Student'
            }
        }), 200 # 201 Created might also be appropriate, but 200 is fine since login also happened.

    except Exception as e:
        # --- Error Handling ---
        # If any unexpected error occurs during the process:
        db.session.rollback() # Roll back the transaction to prevent partial data saving.
        # Log the error for debugging purposes.
        print(f"Error during registration for email {data.get('email', 'N/A')}: {e}")
        # Return a generic server error response.
        return jsonify({'success': False, 'message': f'An internal error occurred: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login_user_endpoint():
    """
    Handle user login requests.

    Expects a JSON payload with 'email' and 'password'.
    Finds the user by email, verifies the password using the stored hash,
    and logs the user in using Flask-Login if credentials are valid.

    Returns:
        JSON response indicating success or failure, along with user details
        on success, or an error message on failure.
        Status Codes:
        - 200: Login successful.
        - 400: Missing email or password in the request.
        - 401: Invalid email or password.
        - 500: Internal server error during processing.
    """
    try:
        # Extract JSON data from the incoming POST request.
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Request body must be JSON.'}), 400

        # Retrieve email and password from the JSON data.
        email = data.get('email')
        password = data.get('password')

        # --- Input Validation ---
        # Check if both email and password were provided.
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

        # --- Find User ---
        # Query the database to find the user by their email address.
        # .first() returns the user object or None if not found.
        user = User.query.filter_by(email=email).first()

        # --- Verify Credentials ---
        # Check if a user with the given email was found AND
        # if the provided password matches the stored hash (using check_password method).
        if user and user.check_password(password):
            # --- Login User ---
            # Credentials are valid, log the user in using Flask-Login.
            # This manages the user session (e.g., sets a session cookie).
            login_user(user)
            print(f"User {email} logged in successfully.")

            # --- Success Response ---
            # Return a success response containing user details.
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'year': user.year if user.role == 'Student' else None # Include year only for students
                }
            }), 200
        else:
            # --- Invalid Credentials ---
            # If user not found or password doesn't match, return an unauthorized error.
            print(f"Login failed for user {email}: Invalid credentials.")
            return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401 # 401 Unauthorized is standard for failed login

    except Exception as e:
        # --- Error Handling ---
        # Log any unexpected errors during the login process.
        print(f"Error during login for email {data.get('email', 'N/A')}: {e}")
        # Return a generic server error response.
        return jsonify({'success': False, 'message': f'An internal error occurred: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
# @login_required # Optionally add this decorator if logout should only be possible for logged-in users
def logout_user_endpoint():
    """
    Handle user logout requests.

    Logs out the currently authenticated user by clearing their session data
    using Flask-Login's logout_user function.

    Returns:
        JSON response indicating successful logout.
        Status Codes:
        - 200: Logout successful.
    """
    # Log out the current user using Flask-Login.
    # This typically clears the user ID from the session.
    user_email = current_user.email if current_user.is_authenticated else "Unknown"
    logout_user()
    print(f"User {user_email} logged out.")
    # Return a simple confirmation message.
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

@auth_bp.route('/update_user', methods=['POST'])
# @login_required # Add this decorator to ensure only logged-in users can update details (often their own)
def update_user():
    """
    Update user details (name, year_of_study).

    Expects a JSON payload containing the 'institution_email' to identify the user
    and optionally 'name' and 'year_of_study' with the new values.

    Returns:
        JSON response indicating success or failure.
        Status Codes:
        - 200: Update successful.
        - 400: Missing institution_email in the request.
        - 404: User with the given email not found.
        - 500: Internal server error during processing.
    """
    try:
        # Extract data from the request JSON payload.
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Request body must be JSON.'}), 400

        email = data.get('institution_email') # Email used to find the user to update.
        name = data.get('name')               # New name (optional).
        year_of_study = data.get('year_of_study') # New year (optional).

        # --- Input Validation ---
        # Email is required to identify the user.
        if not email:
            return jsonify({'success': False, "message": "Institution email is required to identify the user."}), 400

        # --- Find User ---
        # Find the user by the provided email address.
        user = User.query.filter_by(email=email).first()

        # If no user is found with that email, return a 404 error.
        if not user:
            return jsonify({'success': False, "message": "User not found."}), 404

        # --- Update User Details ---
        # Update the user's attributes only if new values were provided in the request.
        if name:
            user.name = name
        if year_of_study:
            # Only update year if the user's role allows it (e.g., Student)
            if user.role == 'Student':
                user.year = year_of_study
            else:
                # Optionally return a message if trying to set year for non-student
                print(f"Attempted to set year for non-student user {email}")
                # Or just ignore the year update for non-students

        # --- Database Interaction ---
        # Commit the changes to the database session.
        # SQLAlchemy tracks the modifications to the 'user' object.
        db.session.commit()
        print(f"User details updated successfully for {email}.")

        # --- Success Response ---
        return jsonify({'success': True, "message": "User details updated successfully."}), 200

    except Exception as e:
        # --- Error Handling ---
        db.session.rollback() # Roll back changes in case of error during commit.
        print(f"Error during user update for email {data.get('institution_email', 'N/A')}: {e}")
        return jsonify({'success': False, 'message': f'An internal error occurred: {str(e)}'}), 500