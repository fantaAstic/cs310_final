"""
Database initialization module.

This module sets up the SQLAlchemy database instance and provides a function
to initialize the database tables within the Flask application context.
"""

# Import the Flask-SQLAlchemy extension.
# Flask-SQLAlchemy simplifies using SQLAlchemy with Flask applications by handling
# session management, configuration, and integration with the Flask app context.

from flask_sqlalchemy import SQLAlchemy
# Create a global SQLAlchemy database instance.
# This instance will be used throughout the application to interact with the database,
# define models, and perform queries. It's initialized without an app here,
# and will be bound to the Flask app later using `init_app`.

db = SQLAlchemy()

def init_db(app):
    """
    Initialize the SQLAlchemy database instance and create database tables.

    This function binds the `db` instance to the provided Flask `app` and then,
    within the application context, creates all tables defined by the SQLAlchemy
    models registered with the `db` instance.

    Args:
        app (Flask): The Flask application instance.
    """
    # Bind the SQLAlchemy object (`db`) to the Flask app instance.
    # This configures SQLAlchemy using the settings found in app.config
    # (like SQLALCHEMY_DATABASE_URI) and manages database sessions
    # tied to the application context.
    db.init_app(app)
    # Create an application context.
    # Operations that interact with the database (like creating tables)
    # often require access to the application's configuration and resources,
    # which are available within an application context.
    with app.app_context():
        # Create all database tables defined in the models.
        # This command inspects all models registered with the `db` instance
        # (subclasses of db.Model) and issues CREATE TABLE statements
        # to the database for any tables that don't already exist.
        # It should typically be run once during setup or when models change.
        db.create_all()
