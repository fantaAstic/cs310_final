"""
Database models for the Flask application.

This module defines the SQLAlchemy ORM models for User, Module, UserModules (association table),
and TopicByModule, along with methods for interacting with user-specific module lists
and authentication.
"""

# Import necessary components from SQLAlchemy for defining relationships.
from sqlalchemy.orm import relationship
# Import the database instance initialized elsewhere (likely in app setup).
from database import db
# Import password hashing utilities from Werkzeug.
from werkzeug.security import generate_password_hash, check_password_hash
# Import json for handling JSON data stored in text columns.
import json
# Import UserMixin for Flask-Login integration.
from flask_login import UserMixin

class User(UserMixin, db.Model):
    """
    Represents a user in the system.

    Inherits from UserMixin to provide default implementations for Flask-Login
    required properties (is_authenticated, is_active, is_anonymous, get_id).
    Inherits from db.Model to integrate with SQLAlchemy ORM.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(10), nullable=False)
    year = db.Column(db.String(10), nullable=True)
    saved_modules = db.Column(db.Text, default="[]")  # Store as JSON string
    taught_modules = db.Column(db.Text, default="[]")  # Store as JSON string
    selected_modules = db.Column(db.Text, default="[]")
    recommended_modules = db.Column(db.Text, default="[]")
    
    def get_selected_modules(self):
        # Convert the JSON string back to a Python list
        return json.loads(self.selected_modules)
    
    def add_selected_module(self, module_name):
        """Add a module to saved_modules and update the database."""
        modules = self.get_selected_modules()
        if module_name not in modules:
            modules.append(module_name)
            self.selected_modules = json.dumps(modules)
            db.session.commit()
    
    def remove_selected_module(self, module_name):
        """Remove a module from selected_modules and update the database."""
        modules = self.get_selected_modules()
        if module_name in modules:
            modules.remove(module_name)
            self.selected_modules = json.dumps(modules)
            db.session.commit()

    def set_selected_modules(self, modules):
        # Convert the Python list to a JSON string
        self.selected_modules = json.dumps(modules)

    def get_recommended_modules(self):
        # Convert the JSON string back to a Python list
        return json.loads(self.recommended_modules)

    def set_recommended_modules(self, modules):
        # Convert the Python list to a JSON string
        self.recommended_modules = json.dumps(modules)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    # Define the 'is_active' property (since Flask-Login requires it)
    @property
    def is_active(self):
        return True  # Assuming the user is always active for now

    # Define the 'is_authenticated' property (this comes from UserMixin)
    # is_authenticated is automatically handled by UserMixin, no need to implement it.

    @property
    def is_anonymous(self):
        return False  # This will depend on your authentication logic

    def get_id(self):
        return str(self.id)

    ## ---------- SAVED MODULES METHODS ----------
    def get_saved_modules(self):
        """Retrieve saved modules as a Python list."""
        return json.loads(self.saved_modules) if self.saved_modules else []

    def add_saved_module(self, module_name):
        """Add a module to saved_modules and update the database."""
        modules = self.get_saved_modules()
        if module_name not in modules:
            modules.append(module_name)
            self.saved_modules = json.dumps(modules)
            db.session.commit()

    def remove_saved_module(self, module_name):
        """Remove a module from saved_modules and update the database."""
        modules = self.get_saved_modules()
        if module_name in modules:
            modules.remove(module_name)
            self.saved_modules = json.dumps(modules)
            db.session.commit()

    ## ---------- TAUGHT MODULES METHODS ----------
    def get_taught_modules(self):
        """Retrieve taught modules as a Python list."""
        return json.loads(self.taught_modules) if self.taught_modules else []

    def add_taught_module(self, module_name):
        """Add a module to taught_modules and update the database."""
        modules = self.get_taught_modules()
        if module_name not in modules:
            modules.append(module_name)
            self.taught_modules = json.dumps(modules)
            db.session.commit()

    def remove_taught_module(self, module_name):
        """Remove a module from taught_modules and update the database."""
        modules = self.get_taught_modules()
        if module_name in modules:
            modules.remove(module_name)
            self.taught_modules = json.dumps(modules)
            db.session.commit()

    def add_recommended_module(self, module_name):
        """Add a module to recommended_modules and update the database."""
        modules = self.get_recommended_modules()
        if module_name not in modules:
            modules.append(module_name)
            self.recommended_modules = json.dumps(modules)
            db.session.commit()

    def remove_recommended_module(self, module_name):
        """Remove a module from recommended_modules and update the database."""
        modules = self.get_recommended_modules()
        if module_name in modules:
            modules.remove(module_name)
            self.recommended_modules = json.dumps(modules)
            db.session.commit()

    # Establishing the relationship with back_populates
    modules = relationship('Module', secondary='user_modules', back_populates='users')

class Module(db.Model):
    """
    Represents an academic module or course.

    Contains details about the module, including aggregated review data,
    summaries, and generated feedback.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    outlook = db.Column(db.String(255))
    summary = db.Column(db.String(700))
    positive_reviews = db.Column(db.Integer)
    negative_reviews = db.Column(db.Integer)
    positive_emotions = db.Column(db.Integer)
    negative_emotions = db.Column(db.Integer)
    category = db.Column(db.String(100))
    teacher_prompt = db.Column(db.String(700))
    teacher_feedback_recommendation = db.Column(db.String(2000))
    teacher_feedback_recommendation_shortform = db.Column(db.String(2000))
    topics = db.Column(db.Text, default="[]")  # JSON string for topics
    analysis_refs = db.Column(db.String(100))

    users = relationship('User', secondary='user_modules', back_populates='modules', overlaps="modules")

    def get_name(self):
        """Retrieve the title of the module."""
        return self.name

    def get_outlook(self):
        """Retrieve the outlook of the module."""
        return self.outlook

    def get_positive_reviews(self):
        """Retrieve the number of positive reviews."""
        return self.positive_reviews

    def get_negative_reviews(self):
        """Retrieve the number of negative reviews."""
        return self.negative_reviews

    def get_category(self):
        """Retrieve the category of the module."""
        return self.category

    def get_teacher_feedback_recommendation(self):
        """Retrieve teacher feedback recommendation."""
        return self.teacher_feedback_recommendation

    def get_similar_modules(self):
        """Retrieve similar modules as a Python list."""
        return json.loads(self.similar_modules) if self.similar_modules else []

    def get_topics(self):
        """Retrieve topics as a Python list."""
        return json.loads(self.topics) if self.topics else []

class TopicByModule(db.Model):
    """
    Represents detailed information about a specific topic within a module.

    This model stores aggregated data (reviews, emotions, summaries) specifically
    related to individual topics, likely derived from analysis of feedback mentioning those topics.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    topic_outlook = db.Column(db.String(255))
    topic_summary = db.Column(db.String(700))
    positive_reviews_topic = db.Column(db.Integer)
    negative_reviews_topic = db.Column(db.Integer)
    positive_emotions_topic = db.Column(db.Integer)
    negative_emotions_topic = db.Column(db.Integer)
    analysis_ref_topic = db.Column(db.String(100))
