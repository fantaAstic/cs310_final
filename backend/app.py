"""
Main Flask application setup and entry point.

This module initializes the Flask application, configures extensions
(SQLAlchemy, CORS, LoginManager), sets up database connections,
registers route blueprints, and defines the user loader function for
Flask-Login. It also contains the main execution block to run the
development server.
"""

# Third-party imports
from flask import Flask                 # Core Flask framework
from flask_sqlalchemy import SQLAlchemy # ORM extension (although db instance is imported from database.py)
from flask_cors import CORS             # Extension for handling Cross-Origin Resource Sharing
from flask_login import LoginManager    # Extension for managing user sessions and login

# Local application/library specific imports
from routes.auth_routes import auth_bp          # Blueprint for authentication routes (/auth)
from routes.module_routes import module_bp      # Blueprint for module-related routes (/modules)
from routes.recommendation_routes import rec_bp # Blueprint for recommendation routes (/recommendations)
from database import init_db                    # Function to initialize the database
from models import User                         # User model definition (needed for Flask-Login user loader)

# Create the Flask application instance.
# __name__ tells Flask where to look for resources like templates and static files.
app = Flask(__name__)

# --- Application Configuration ---

# Secret key for session management, CSRF protection, etc.
# IMPORTANT: Change this to a strong, random value in production!
# It's recommended to load this from an environment variable or config file.
app.config['SECRET_KEY'] = 'your_secret_key' # TODO: Replace with a secure key

# Database configuration: URI for connecting to the database.
# This example uses a relative path SQLite database file named 'database4.db'.
# Adjust the URI for other database systems like PostgreSQL or MySQL in production.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database4.db'

# Disable SQLAlchemy's event system notifications.
# This is often turned off as it can consume extra resources and is not always needed.
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Database Initialization ---

# Initialize the database using the function from database.py
# This binds the SQLAlchemy instance (imported implicitly via init_db) to the app
# and creates database tables based on the defined models if they don't exist.
init_db(app)

# --- CORS Configuration ---

# Enable Cross-Origin Resource Sharing (CORS) for the entire app.
# This is necessary to allow frontend applications running on different origins
# (e.g., http://localhost:3000) to send requests to this backend API
# (e.g., http://localhost:5000).
# For production, consider restricting origins to only allowed frontend domains:
# CORS(app, resources={r"/*": {"origins": "https://yourfrontenddomain.com"}})
CORS(app)

# --- Session Configuration (for Flask-Login) ---

# Note: SECRET_KEY is crucial for signing the session cookie. It's set above.
# Ensure it's the same strong, secret value used throughout the app.

# Configure the type of session storage. 'filesystem' stores session data
# in files on the server. Other options include 'redis', 'memcached', 'sqlalchemy'.
app.config['SESSION_TYPE'] = 'filesystem'

# Configure if the session cookie is permanent. False means it's a session cookie
# that typically expires when the browser is closed.
app.config['SESSION_PERMANENT'] = False

# Configure if the session cookie should only be sent over HTTPS.
# Set this to True in production when using HTTPS for security.
app.config['SESSION_COOKIE_SECURE'] = False # TODO: Set to True in production with HTTPS

# --- Flask-Login Initialization ---

# Initialize the LoginManager extension, associating it with the Flask app.
login_manager = LoginManager(app)

# Configure the endpoint (view function name) where Flask-Login should redirect
# users when they try to access a protected page without being logged in.
# 'auth.login_user_endpoint' refers to the 'login_user_endpoint' view function
# within the 'auth_bp' blueprint.
login_manager.login_view = 'auth.login_user_endpoint'

# Define the user loader function required by Flask-Login.
# This function is called to reload the user object from the user ID stored in the session
# on subsequent requests after login.
@login_manager.user_loader
def load_user(user_id):
    """
    Load user by ID. Required callback for Flask-Login.

    Args:
        user_id (str): The ID of the user to load, as stored in the session cookie.

    Returns:
        User or None: The User object corresponding to the user_id if found in the database,
                      otherwise None.
    """
    # Flask-Login stores the user ID as a string in the session,
    # so it needs to be converted back to an integer for database querying.
    # User.query.get() efficiently retrieves a user by primary key.
    return User.query.get(int(user_id))

# --- Register Blueprints ---
# Blueprints help organize the application into distinct components, each handling
# a specific set of routes.

# Register the authentication blueprint. All routes defined in auth_bp
# will be accessible under the '/auth' URL prefix (e.g., /auth/login).
app.register_blueprint(auth_bp, url_prefix='/auth')

# Register the module management blueprint under the '/modules' prefix.
app.register_blueprint(module_bp, url_prefix='/modules')

# Register the recommendations blueprint under the '/recommendations' prefix.
app.register_blueprint(rec_bp, url_prefix='/recommendations')

# --- Main Execution Block ---

# This conditional block ensures that the following code runs only when
# the script is executed directly (e.g., `python app.py`), not when imported
# as a module into another script.
if __name__ == "__main__":
    # Start the Flask development web server.
    # debug=True enables features useful for development like automatic reloading
    # on code changes and detailed error pages. Disable this in production.
    # host='0.0.0.0' makes the server listen on all available network interfaces,
    # allowing connections from other devices on the same network.
    # port=5000 specifies the port number the server will listen on.
    app.run(debug=True, host='0.0.0.0', port=5000)