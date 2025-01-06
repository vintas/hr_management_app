from datetime import datetime, timezone

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hr_management.db'
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Constants
DEFAULT_PASSWORD = "password123"

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_hr = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=False)

    # One-to-One relationship
    employee = db.relationship("Employee", uselist=False, back_populates="user")

    def __repr__(self):
        return f"<User {self.username}>"

class Employee(db.Model):
    __tablename__ = 'employee'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    joining_date = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    education = db.Column(db.String(100))
    department = db.Column(db.String(50))
    role = db.Column(db.String(50))
    salary = db.Column(db.Float)

    # Foreign key to link with User table
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # One-to-One relationship
    user = db.relationship("User", back_populates="employee")

    def __repr__(self):
        return f"<Employee {self.name}>"

class LeaveRequest(db.Model):
    __tablename__ = 'leave_request'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default="Pending")  # Pending, Approved, Rejected

    employee = db.relationship("Employee", backref="leave_requests")

    def __repr__(self):
        return f"<LeaveRequest {self.id} - {self.status}>"

# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"message": "Invalid username or password"}), 401

    if not user.is_approved:
        return jsonify({"message": "Account not approved by HR yet"}), 403

    access_token = create_access_token(identity={"id": user.id, "is_hr": user.is_hr})
    return jsonify({"token": access_token, "is_hr": user.is_hr}), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # Validate required fields
    required_fields = ["username", "password", "name", "dob", "education"]
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    # Check if the username already exists
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Username already exists"}), 400

    try:
        # Parse and validate date of birth
        dob = datetime.strptime(data["dob"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Invalid date format for 'dob'. Use YYYY-MM-DD."}), 400

    # Hash the password
    hashed_password = generate_password_hash(data["password"])

    # Create a new User entry
    new_user = User(
        username=data["username"],
        password=hashed_password,
        is_approved=False  # New users require HR approval
    )

    # Create a new Employee entry with partial data
    new_employee = Employee(
        name=data["name"],
        dob=dob,
        education=data["education"],
        joining_date=datetime.now(timezone.utc)  # Default joining date
    )

    # Link the Employee to the User
    new_user.employee = new_employee

    # Save to the database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful. Await HR approval."}), 201

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
    username = name.lower().replace(" ", "")
    password = generate_password_hash(DEFAULT_PASSWORD)

    # Create user and employee records
    new_user = User(username=username, password=password, is_hr=is_hr, is_approved=True)
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

    return jsonify({"message": "Employee added successfully", "username": username, "default_password": DEFAULT_PASSWORD, "role": role})

@app.route('/pending_approvals', methods=['GET'])
@jwt_required()
def pending_approvals():
    # Check if the logged-in user is HR
    current_user = get_jwt_identity()
    if not current_user["is_hr"]:
        return jsonify({"message": "Unauthorized access"}), 403

    # Query for users with is_approved = False
    pending_users = User.query.filter_by(is_approved=False).all()

    pending_users_data = [
        {
            "id": user.id,
            "username": user.username,
            "name": user.employee.name if user.employee else None,
            "dob": user.employee.dob.strftime("%Y-%m-%d") if user.employee and user.employee.dob else None,
            "education": user.employee.education if user.employee else None,
            "department": user.employee.department if user.employee else None,
            "role": user.employee.role if user.employee else None,
            "salary": user.employee.salary if user.employee else None,
            "joining_date": user.employee.joining_date.strftime("%Y-%m-%d") if user.employee and user.employee.joining_date else None,
        }
        for user in pending_users
    ]

    return jsonify(pending_users_data), 200

@app.route('/approve_user/<int:user_id>', methods=['PUT'])
@jwt_required()
def approve_user(user_id):
    current_user = get_jwt_identity()
    if not current_user["is_hr"]:
        return jsonify({"message": "Unauthorized access"}), 403

    data = request.get_json()
    user = User.query.get(user_id)
    if not user or user.is_approved:
        return jsonify({"message": "User not found or already approved"}), 404

    # Update employee details
    if not user.employee:
        user.employee = Employee()  # Create new employee entry if missing

    user.employee.name = data.get("name", user.employee.name)
    user.employee.dob = datetime.strptime(data["dob"], "%Y-%m-%d") if "dob" in data else user.employee.dob
    user.employee.education = data.get("education", user.employee.education)
    user.employee.department = data.get("department", user.employee.department)
    user.employee.role = data.get("role", user.employee.role)
    user.employee.salary = data.get("salary", user.employee.salary)
    user.employee.joining_date = datetime.strptime(data["joining_date"], "%Y-%m-%d") if "joining_date" in data else user.employee.joining_date

    # Approve the user
    user.is_approved = True

    db.session.commit()

    return jsonify({"message": "User approved successfully"}), 200

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
    if not current_user['is_hr'] and current_user['id'] != id:
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
    user = User.query.get(employee.employee_id)

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

@app.route('/leave-request', methods=['POST'])
@jwt_required()
def submit_leave_request():
    data = request.get_json()
    current_user_id = get_jwt_identity()['id']

    # Get employee entry for the user
    employee = Employee.query.filter_by(user_id=current_user_id).first()
    if not employee:
        return jsonify({"message": "Employee record not found"}), 404

    try:
        leave_request = LeaveRequest(
            employee_id=employee.id,
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            reason=data['reason']
        )
        db.session.add(leave_request)
        db.session.commit()
        return jsonify({"message": "Leave request submitted successfully"}), 201
    except Exception as e:
        return jsonify({"message": "Failed to submit leave request", "error": str(e)}), 400

@app.route('/leave-requests', methods=['GET'])
@jwt_required()
def get_leave_requests():
    current_user = get_jwt_identity()
    if not current_user['is_hr']:
        return jsonify({"message": "Access denied"}), 403

    leave_requests = LeaveRequest.query.all()
    result = []
    for leave in leave_requests:
        result.append({
            "id": leave.id,
            "employee_name": leave.employee.name,
            "start_date": leave.start_date.isoformat(),
            "end_date": leave.end_date.isoformat(),
            "reason": leave.reason,
            "status": leave.status
        })
    return jsonify(result), 200

@app.route('/leave-request/<int:leave_id>', methods=['PUT'])
@jwt_required()
def update_leave_request(leave_id):
    current_user = get_jwt_identity()
    if not current_user['is_hr']:
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json()
    leave_request = LeaveRequest.query.get(leave_id)
    if not leave_request:
        return jsonify({"message": "Leave request not found"}), 404

    if data['status'] not in ['Approved', 'Rejected']:
        return jsonify({"message": "Invalid status"}), 400

    leave_request.status = data['status']
    db.session.commit()
    return jsonify({"message": "Leave request updated successfully"}), 200

@app.route('/my-leave-requests', methods=['GET'])
@jwt_required()
def my_leave_requests():
    current_user_id = get_jwt_identity()['id']
    
    # Get employee entry for the user
    employee = Employee.query.filter_by(user_id=current_user_id).first()
    if not employee:
        return jsonify({"message": "Employee record not found"}), 404

    # Fetch leave requests for the employee
    leave_requests = LeaveRequest.query.filter_by(employee_id=employee.id).all()
    result = []
    for leave in leave_requests:
        result.append({
            "id": leave.id,
            "start_date": leave.start_date.isoformat(),
            "end_date": leave.end_date.isoformat(),
            "reason": leave.reason,
            "status": leave.status
        })
    return jsonify(result), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)