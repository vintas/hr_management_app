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
        token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify({'token': token, 'is_hr': user.is_hr}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# HR can add a new employee
@app.route('/employees', methods=['POST'])
@jwt_required()
def add_employee():
    current_user = get_jwt_identity()
    if current_user['role'] != 'HR':
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
    if current_user['role'] != 'HR':
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
    if current_user['role'] != 'HR':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    employee = Employee.query.get_or_404(id)
    for key, value in data.items():
        setattr(employee, key, value)
    db.session.commit()
    return jsonify({'message': 'Employee details updated successfully'}), 200

# Employee can view their own details
@app.route('/employees/<int:id>', methods=['GET'])
@jwt_required()
def get_employee(id):
    current_user = get_jwt_identity()
    employee = Employee.query.get_or_404(id)
    if current_user['role'] != 'HR' and employee.user_id != current_user['id']:
        return jsonify({'message': 'Unauthorized'}), 403
    employee_data = {
        'name': employee.name,
        'dob': employee.dob,
        'joining_date': employee.joining_date,
        'education': employee.education,
        'department': employee.department,
        'role': employee.role,
        'salary': employee.salary
    }
    return jsonify(employee_data), 200

@app.route('/employees/me', methods=['GET'])
@jwt_required()
def get_employee_details():
    current_user_id = get_jwt_identity()
    
    # Fetch the employee associated with the current user's ID
    employee = Employee.query.filter_by(user_id=current_user_id).first()
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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)