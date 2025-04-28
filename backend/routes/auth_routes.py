"""
Authentication Routes Blueprint.

This blueprint handles user registration, login, logout, and profile updates.
It uses Flask-Login for session management and interacts with the User model
and the database session.
"""

# Third-party imports
from flask import Blueprint, request, jsonify # Core Flask components for routing, request handling, and JSON responses
from flask_login import login_user, logout_user, current_user # Functions for user session management
from models import User # The User database model
from database import db # The SQLAlchemy database instance

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
        # Extract data from the request
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role')
        year = data.get('year') if role == 'Student' else None

        # Validate if the required fields are present
        if not email or not password or not name or not role:
            return jsonify({'success': False, 'message': 'Missing required fields.'}), 400

        # Check if the email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'User already exists.'}), 400

        # Create new user instance
        new_user = User(name=name, email=email, role=role, year=year)
        new_user.set_password(password)

        # Log the user creation process
        print(f"Creating new user: {new_user}")
        
        # Add the new user to the session and commit to the database
        db.session.add(new_user)
        db.session.commit()

        # Automatically log in the new user
        login_user(new_user)  # Log in the user after successful registration

        # Return success response with user data in the response body
        return jsonify({
            'success': True,
            'message': 'User registered and logged in successfully',
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email,
                'role': new_user.role,
                'year': new_user.year
            }
        }), 200

    except Exception as e:
        # Log the error
        print(f"Error during registration: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

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
        # Extract data from the request
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Validate if email and password are provided
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

        # Find the user by email
        user = User.query.filter_by(email=email).first()

        # Check if user exists and password is correct
        if user and user.check_password(password):
            # Log the user in using Flask-Login
            login_user(user)

            # Return success response with user data
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'year': user.year if user.role == 'Student' else None
                }
            }), 200
        else:
            # If credentials are invalid
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    except Exception as e:
        # If there's any error, return an error message
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
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
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/update_user', methods=['POST'])
def update_user():
    """
    Update user details.

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
    email = request.json.get('institution_email')  # Get the email
    name = request.json.get('name')
    year_of_study = request.json.get('year_of_study')

    if not email:
        return jsonify({"message": "Institution email is required."}), 400

    user = User.query.filter_by(email=email).first()  # Query by email

    if not user:
        return jsonify({"message": "User not found."}), 404

    # Update user details with the provided data
    user.name = name if name else user.name
    user.year = year_of_study if year_of_study else user.year

    db.session.commit()

    return jsonify({"message": "User details have been updated successfully."}), 200
