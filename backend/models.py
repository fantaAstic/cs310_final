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
    # Define the table name explicitly (optional, defaults to class name lowercased).
    # __tablename__ = 'user'

    # Primary key column for uniquely identifying users.
    id = db.Column(db.Integer, primary_key=True)
    # User's full name.
    name = db.Column(db.String(100))
    # User's email address, must be unique and cannot be null.
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Securely stored hash of the user's password, cannot be null.
    password_hash = db.Column(db.String(200), nullable=False)
    # Role of the user (e.g., 'student', 'teacher'), cannot be null.
    role = db.Column(db.String(10), nullable=False)
    # Academic year of the user (primarily for students), can be null.
    year = db.Column(db.String(10), nullable=True)
    # Stores a list of module names saved by the user as a JSON string.
    saved_modules = db.Column(db.Text, default="[]")
    # Stores a list of module names taught by the user (for teachers) as a JSON string.
    taught_modules = db.Column(db.Text, default="[]")
    # Stores a list of module names selected by the user (e.g., for analysis) as a JSON string.
    selected_modules = db.Column(db.Text, default="[]")
    # Stores a list of module names recommended to the user as a JSON string.
    recommended_modules = db.Column(db.Text, default="[]")

    # Define the many-to-many relationship with Module via the UserModules association table.
    # `back_populates` ensures the relationship is bidirectional.
    modules = relationship('Module', secondary='user_modules', back_populates='users')

    def get_selected_modules(self):
        """
        Retrieve the list of selected module names.

        Returns:
            list: A list of module names selected by the user.
                  Returns an empty list if no modules are selected or if the stored value is invalid JSON.
        """
        try:
            # Convert the JSON string stored in the database back to a Python list.
            return json.loads(self.selected_modules) if self.selected_modules else []
        except json.JSONDecodeError:
            # Handle cases where the stored text is not valid JSON.
            return []

    def add_selected_module(self, module_name):
        """
        Add a module name to the user's selected modules list.

        Checks for duplicates before adding. Updates the database immediately.

        Args:
            module_name (str): The name of the module to add.
        """
        modules = self.get_selected_modules()
        if module_name not in modules:
            modules.append(module_name)
            # Convert the updated list back to a JSON string for storage.
            self.selected_modules = json.dumps(modules)
            # Commit the session to save the change to the database.
            db.session.commit()

    def remove_selected_module(self, module_name):
        """
        Remove a module name from the user's selected modules list.

        Updates the database immediately if the module is found and removed.

        Args:
            module_name (str): The name of the module to remove.
        """
        modules = self.get_selected_modules()
        if module_name in modules:
            modules.remove(module_name)
            # Convert the updated list back to a JSON string for storage.
            self.selected_modules = json.dumps(modules)
            # Commit the session to save the change to the database.
            db.session.commit()

    def set_selected_modules(self, modules):
        """
        Set the entire list of selected module names, overwriting the previous list.

        Args:
            modules (list): A list of module names to set as selected.
        """
        # Convert the Python list to a JSON string for storage.
        # Note: This method does NOT commit the session automatically.
        self.selected_modules = json.dumps(modules)

    def get_recommended_modules(self):
        """
        Retrieve the list of recommended module names.

        Returns:
            list: A list of module names recommended to the user.
                  Returns an empty list if no modules are recommended or if the stored value is invalid JSON.
        """
        try:
            # Convert the JSON string back to a Python list.
            return json.loads(self.recommended_modules) if self.recommended_modules else []
        except json.JSONDecodeError:
            return []

    def set_recommended_modules(self, modules):
        """
        Set the entire list of recommended module names, overwriting the previous list.

        Args:
            modules (list): A list of module names to set as recommended.
        """
        # Convert the Python list to a JSON string for storage.
        # Note: This method does NOT commit the session automatically.
        self.recommended_modules = json.dumps(modules)

    def add_recommended_module(self, module_name):
        """
        Add a module name to the user's recommended modules list.

        Checks for duplicates before adding. Updates the database immediately.

        Args:
            module_name (str): The name of the module to add to recommendations.
        """
        modules = self.get_recommended_modules()
        if module_name not in modules:
            modules.append(module_name)
            self.recommended_modules = json.dumps(modules)
            db.session.commit()

    def remove_recommended_module(self, module_name):
        """
        Remove a module name from the user's recommended modules list.

        Updates the database immediately if the module is found and removed.

        Args:
            module_name (str): The name of the recommended module to remove.
        """
        modules = self.get_recommended_modules()
        if module_name in modules:
            modules.remove(module_name)
            self.recommended_modules = json.dumps(modules)
            db.session.commit()

    def set_password(self, password):
        """
        Set the user's password.

        Hashes the provided plain text password using pbkdf2:sha256 and stores the hash.

        Args:
            password (str): The plain text password to set.
        """
        # Generate a secure hash of the password.
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """
        Check if the provided password matches the stored hash.

        Args:
            password (str): The plain text password to check.

        Returns:
            bool: True if the password matches the stored hash, False otherwise.
        """
        # Verify the password against the stored hash.
        return check_password_hash(self.password_hash, password)

    # --- Flask-Login required properties ---

    @property
    def is_active(self):
        """
        Required by Flask-Login. Indicates if the user account is active.

        Returns:
            bool: True for active users (currently always True).
        """
        # For now, assume all registered users are active.
        # This could be linked to an 'is_active' database column in the future.
        return True

    # `is_authenticated` property is provided by UserMixin.
    # It typically returns True for logged-in users.

    @property
    def is_anonymous(self):
        """
        Required by Flask-Login. Indicates if the user is anonymous.

        Returns:
            bool: False for logged-in users.
        """
        # Logged-in users are not anonymous.
        return False

    def get_id(self):
        """
        Required by Flask-Login. Returns the unique ID for the user.

        Returns:
            str: The user's primary key ID as a string.
        """
        # Flask-Login requires the ID to be returned as a string.
        return str(self.id)

    # --- Saved Modules Methods ---

    def get_saved_modules(self):
        """
        Retrieve the list of saved module names.

        Returns:
            list: A list of module names saved by the user.
                  Returns an empty list if no modules are saved or if the stored value is invalid JSON.
        """
        try:
            # Convert the JSON string from the database to a Python list.
            return json.loads(self.saved_modules) if self.saved_modules else []
        except json.JSONDecodeError:
            return []

    def add_saved_module(self, module_name):
        """
        Add a module name to the user's saved modules list.

        Checks for duplicates before adding. Updates the database immediately.

        Args:
            module_name (str): The name of the module to save.
        """
        modules = self.get_saved_modules()
        if module_name not in modules:
            modules.append(module_name)
            self.saved_modules = json.dumps(modules)
            db.session.commit()

    def remove_saved_module(self, module_name):
        """
        Remove a module name from the user's saved modules list.

        Updates the database immediately if the module is found and removed.

        Args:
            module_name (str): The name of the module to remove from saved list.
        """
        modules = self.get_saved_modules()
        if module_name in modules:
            modules.remove(module_name)
            self.saved_modules = json.dumps(modules)
            db.session.commit()

    # --- Taught Modules Methods ---

    def get_taught_modules(self):
        """
        Retrieve the list of taught module names (primarily for teachers).

        Returns:
            list: A list of module names taught by the user.
                  Returns an empty list if no modules are taught or if the stored value is invalid JSON.
        """
        try:
            # Convert the JSON string from the database to a Python list.
            return json.loads(self.taught_modules) if self.taught_modules else []
        except json.JSONDecodeError:
            return []

    def add_taught_module(self, module_name):
        """
        Add a module name to the user's taught modules list.

        Checks for duplicates before adding. Updates the database immediately.

        Args:
            module_name (str): The name of the module taught by the user.
        """
        modules = self.get_taught_modules()
        if module_name not in modules:
            modules.append(module_name)
            self.taught_modules = json.dumps(modules)
            db.session.commit()

    def remove_taught_module(self, module_name):
        """
        Remove a module name from the user's taught modules list.

        Updates the database immediately if the module is found and removed.

        Args:
            module_name (str): The name of the module to remove from the taught list.
        """
        modules = self.get_taught_modules()
        if module_name in modules:
            modules.remove(module_name)
            self.taught_modules = json.dumps(modules)
            db.session.commit()


class Module(db.Model):
    """
    Represents an academic module or course.

    Contains details about the module, including aggregated review data,
    summaries, and generated feedback.
    """
    # Define the table name explicitly (optional).
    # __tablename__ = 'module'

    # Primary key column for uniquely identifying modules.
    id = db.Column(db.Integer, primary_key=True)
    # Name or title of the module, cannot be null.
    name = db.Column(db.String(255), nullable=False)
    # General outlook or sentiment score/description for the module.
    outlook = db.Column(db.String(255))
    # A summary description of the module content or feedback.
    summary = db.Column(db.String(700))
    # Count of positive reviews received for the module.
    positive_reviews = db.Column(db.Integer)
    # Count of negative reviews received for the module.
    negative_reviews = db.Column(db.Integer)
    # Aggregated positive emotion score/count from reviews.
    positive_emotions = db.Column(db.Integer)
    # Aggregated negative emotion score/count from reviews.
    negative_emotions = db.Column(db.Integer)
    # Category or department the module belongs to.
    category = db.Column(db.String(100))
    # Prompt used for generating teacher-specific feedback or analysis.
    teacher_prompt = db.Column(db.String(700))
    # Detailed feedback or recommendations generated for teachers based on reviews.
    teacher_feedback_recommendation = db.Column(db.String(2000))
    # A shorter version of the teacher feedback or recommendations.
    teacher_feedback_recommendation_shortform = db.Column(db.String(2000))
    # Stores a list of main topics covered in the module as a JSON string.
    topics = db.Column(db.Text, default="[]")
    # Reference identifier(s) linking to detailed analysis data (e.g., file paths, report IDs).
    analysis_refs = db.Column(db.String(100))

    # Define the many-to-many relationship with User via the UserModules association table.
    # `back_populates` links it back to the 'modules' relationship in the User model.
    # `overlaps="modules"` might be needed if SQLAlchemy detects potential ambiguity,
    # especially if relationships are defined in multiple ways (e.g., via association object pattern).
    users = relationship('User', secondary='user_modules', back_populates='modules', overlaps="modules")

    def get_name(self):
        """Retrieve the name (title) of the module."""
        return self.name

    def get_outlook(self):
        """Retrieve the general outlook description of the module."""
        return self.outlook

    def get_positive_reviews(self):
        """Retrieve the count of positive reviews for the module."""
        return self.positive_reviews

    def get_negative_reviews(self):
        """Retrieve the count of negative reviews for the module."""
        return self.negative_reviews

    def get_category(self):
        """Retrieve the category of the module."""
        return self.category

    def get_teacher_feedback_recommendation(self):
        """Retrieve the detailed teacher feedback recommendation."""
        return self.teacher_feedback_recommendation

    def get_similar_modules(self):
        """
        Retrieve the list of similar module names (if available).

        Note: The `similar_modules` attribute is not defined in the current model.
              This method assumes such an attribute (storing a JSON list) exists or will be added.

        Returns:
            list: A list of names of similar modules. Returns an empty list if none are defined
                  or if the stored value is invalid JSON or the attribute doesn't exist.
        """
        # TODO: Add a 'similar_modules' db.Column(db.Text, default="[]") if this functionality is needed.
        try:
            # Attempt to load from an attribute named 'similar_modules'.
            return json.loads(self.similar_modules) if hasattr(self, 'similar_modules') and self.similar_modules else []
        except (json.JSONDecodeError, AttributeError):
            return []

    def get_topics(self):
        """
        Retrieve the list of topics covered in the module.

        Returns:
            list: A list of topic names associated with the module.
                  Returns an empty list if no topics are defined or if the stored value is invalid JSON.
        """
        try:
            # Convert the JSON string from the 'topics' column to a Python list.
            return json.loads(self.topics) if self.topics else []
        except json.JSONDecodeError:
            return []

class UserModules(db.Model):
    """
    Association table for the many-to-many relationship between Users and Modules.

    This table links users to the modules they are associated with (e.g., saved, selected, taught -
    though the specific type of association is handled by JSON lists in the User model in this design).
    This table primarily enables querying relationships like "get all users for a module"
    or "get all modules for a user" via SQLAlchemy relationships.
    """
    # Define the table name explicitly (optional).
    # __tablename__ = 'user_modules'

    # Foreign key linking to the User table's primary key. Part of the composite primary key.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    # Foreign key linking to the Module table's primary key. Part of the composite primary key.
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), primary_key=True)

class TopicByModule(db.Model):
    """
    Represents detailed information about a specific topic within a module.

    This model stores aggregated data (reviews, emotions, summaries) specifically
    related to individual topics, likely derived from analysis of feedback mentioning those topics.
    """
    # Define the table name explicitly (optional).
    # __tablename__ = 'topic_by_module'

    # Primary key for uniquely identifying topic entries.
    id = db.Column(db.Integer, primary_key=True)
    # Name of the module this topic belongs to. Can be used for grouping or lookup.
    name = db.Column(db.String(255), nullable=False)
    # Name of the specific topic, cannot be null.
    topic = db.Column(db.String(255), nullable=False)
    # General outlook or sentiment score/description specifically for this topic.
    topic_outlook = db.Column(db.String(255))
    # A summary description specifically related to this topic within the module.
    topic_summary = db.Column(db.String(700))
    # Count of positive reviews specifically mentioning or related to this topic.
    positive_reviews_topic = db.Column(db.Integer)
    # Count of negative reviews specifically mentioning or related to this topic.
    negative_reviews_topic = db.Column(db.Integer)
    # Aggregated positive emotion score/count from reviews related to this topic.
    positive_emotions_topic = db.Column(db.Integer)
    # Aggregated negative emotion score/count from reviews related to this topic.
    negative_emotions_topic = db.Column(db.Integer)
    # Reference identifier linking to detailed analysis data specifically for this topic.
    analysis_ref_topic = db.Column(db.String(100))