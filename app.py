import random
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hr_management.db'
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(10), nullable=False)
    is_hr = db.Column(db.Boolean, default=False)

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    joining_date = db.Column(db.Date, nullable=False)
    education = db.Column(db.String(100))
    department = db.Column(db.String(50))
    role = db.Column(db.String(50))
    salary = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User", backref="employee")

# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        token = create_access_token(identity={'id': user.id, 'is_hr': user.is_hr})
        return jsonify({'token': token, 'is_hr': user.is_hr}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# HR can add a new employee
@app.route('/employees', methods=['POST'])
@jwt_required()
def add_employee():
    current_user = get_jwt_identity()
    if not current_user['is_hr']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    name = data.get('name')
    dob = data.get('dob')
    joining_date = data.get('joining_date')
    education = data.get('education')
    department = data.get('department')
    role = data.get('role')
    salary = data.get('salary')
    is_hr = data.get('is_hr', False)  

    try:
        dob = datetime.strptime(dob, '%Y-%m-%d')
        joining_date = datetime.strptime(joining_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Incorrect date format, should be YYYY-MM-DD"}), 400

    # Generate username and password for the employee
    username = name.lower().replace(" ", "") + str(random.randint(100, 999))
    password = generate_password_hash("password123")  # Use a better password strategy in production

    # Create user and employee records
    new_user = User(username=username, password=password, role=role, is_hr=is_hr)
    db.session.add(new_user)
    db.session.commit()

    new_employee = Employee(
        name=name,
        dob=dob,
        joining_date=joining_date,
        education=education,
        department=department,
        role=role,
        salary=salary,
        user_id=new_user.id  # Link employee to the newly created user
    )
    db.session.add(new_employee)
    db.session.commit()

    return jsonify({"message": "Employee added successfully", "username": username, "default_password": "password123", "role": role})

@app.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    current_user = get_jwt_identity()
    if not current_user['is_hr']:
        return jsonify({'message': 'Unauthorized'}), 403

    # Query all employees
    employees = Employee.query.all()

    # Format employee data
    employees_data = [
        {
            "id": employee.id,
            "name": employee.name,
            "dob": employee.dob,
            "joining_date": employee.joining_date,
            "education": employee.education,
            "department": employee.department,
            "role": employee.role,
            "salary": employee.salary,
        }
        for employee in employees
    ]

    return jsonify(employees_data), 200

# HR can update employee details
@app.route('/employees/<int:id>', methods=['PUT'])
@jwt_required()
def update_employee(id):
    current_user = get_jwt_identity()
    if not current_user['is_hr']:
        return jsonify({'message': 'Unauthorized'}), 403

    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Parse request JSON data
    data = request.get_json()

    try:
        # Update employee fields only if provided in data
        employee.name = data.get('name', employee.name)
        employee.department = data.get('department', employee.department)
        employee.role = data.get('role', employee.role)
        employee.salary = data.get('salary', employee.salary)
        employee.education = data.get('education', employee.education)

        # Parse 'dob' and 'joining_date' only if they are provided and non-empty
        if 'dob' in data and data['dob']:  # Check if 'dob' exists and is non-empty
            employee.dob = datetime.strptime(data['dob'], '%Y-%m-%d')
        if 'joining_date' in data and data['joining_date']:  # Check if 'joining_date' exists and is non-empty
            employee.joining_date = datetime.strptime(data['joining_date'], '%Y-%m-%d')

        # Commit changes to the database
        db.session.commit()
        return jsonify({"message": "Employee updated successfully"}), 200

    except ValueError:
        # Handle invalid date format error
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

@app.route('/employees/<int:id>', methods=['GET'])
@jwt_required()
def get_employee(id):
    current_user = get_jwt_identity()

    # HR users can access any employee's details; others can only view their own
    # current_user['id'] - 1 because User table has the Admin user too. TODO fix the User Employee primary ID issue.
    if not current_user['is_hr'] and current_user['id'] - 1 != id:
        return jsonify({"error": "Permission denied"}), 403

    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Format response with ISO 8601 date format
    response = {
        "id": employee.id,
        "name": employee.name,
        "dob": employee.dob.strftime('%Y-%m-%d') if employee.dob else None,
        "joining_date": employee.joining_date.strftime('%Y-%m-%d') if employee.joining_date else None,
        "education": employee.education,
        "department": employee.department,
        "role": employee.role,
        "salary": employee.salary
    }
    return jsonify(response), 200

@app.route('/employees/me', methods=['GET'])
@jwt_required()
def get_employee_details():
    current_user = get_jwt_identity()
    
    # Fetch the employee associated with the current user's ID
    employee = Employee.query.filter_by(user_id=current_user['id']).first()
    if not employee:
        return jsonify({"message": "Employee details not found"}), 404

    employee_data = {
        "name": employee.name,
        "dob": employee.dob,
        "joining_date": employee.joining_date,
        "education": employee.education,
        "department": employee.department,
        "role": employee.role,
        "salary": employee.salary
    }

    return jsonify(employee_data)

@app.route('/user/is_hr', methods=['GET'])
@jwt_required()
def is_hr_user():
    """
    Returns whether the current user is an HR.
    """
    current_user = get_jwt_identity()

    # Retrieve the is_hr field from the JWT identity payload
    is_hr = current_user.get("is_hr")

    return jsonify({"is_hr": is_hr}), 200

@app.route('/delete_employee/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    current_user_id = get_jwt_identity()["id"]
    is_hr = get_jwt_identity().get("is_hr", False)

    if not is_hr:
        return jsonify({"message": "Unauthorized access"}), 403

    employee = Employee.query.get(employee_id)
    user = User.query.get(employee_id+1)

    if not employee or not user:
        return jsonify({"message": "Employee not found"}), 404

    try:
        db.session.delete(employee)
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Employee deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting employee", "error": str(e)}), 500
    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)