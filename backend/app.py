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

# Configuration
app.config['SECRET_KEY'] = 'your_secret_key' # Replace with a secure key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database4.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialise the database
init_db(app)

CORS(app)

# Enable session for Flask-Login to work
# Configure the type of session storage. 'filesystem' stores session data
# in files on the server. Other options include 'redis', 'memcached', 'sqlalchemy'.
app.config['SESSION_TYPE'] = 'filesystem'

# Configure if the session cookie is permanent. False means it's a session cookie
# that typically expires when the browser is closed.
app.config['SESSION_PERMANENT'] = False

# Configure if the session cookie should only be sent over HTTPS.
# Set this to True in production when using HTTPS for security.
app.config['SESSION_COOKIE_SECURE'] = False # Set to True in production with HTTPS


# Initialize the login manager
login_manager = LoginManager(app)

# Make sure the login_manager knows where to redirect unauthorised users
login_manager.login_view = 'auth.login_user_endpoint'

# Flask-Login user_loader
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))  # Retrieve user from database

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(module_bp, url_prefix='/modules')
app.register_blueprint(rec_bp, url_prefix='/recommendations')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)  # Allow external devices to access
