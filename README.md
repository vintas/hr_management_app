# HR Management App

Stack:
* Backend: Python with Flask for REST APIs
* Frontend: React
* Database: SQLite


1. System Design and Architecture
    * Users: Two main types of users - HR (can manage employees) and Employees (can view only their details).
    * Authentication: JWT for secure access to APIs.
    * Role-based Authorization: Ensure that only HR users have the ability to modify employee data.

2. Data Models
    * User (authentication table):
        * id: unique identifier
        * username: login username
        * password: hashed password
        * role: HR or Employee

    * Employee:
        * id: unique identifier
        * name: full name of the employee
        * dob: date of birth
        * joining_date: joining date
        * education: educational background
        * department: assigned department
        * role: employee’s role in the organization
        * salary: salary amount
        * user_id: foreign key linking to User table for login

3. API Endpoints

    * POST /login: Login to receive a JWT token.
    * POST /employees: HR can add a new employee.
    * PUT /employees/<id>: HR can update employee details.
    * GET /employees/<id>: Employee can view their own details or HR can view any employee's details.

## Local Setup

Clone the repository.

Set up virtual environment
```sh
python -m venv venv
source venv/bin/activate  # For Windows use venv\Scripts\activate
```

Get backend dependencies
```sh
pip install -r requirements.txt
```

Initialize database(Only FIRST time):
```sh
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

 run:



```sh
flask run
```
The backend should now be running on http://127.0.0.1:5000.

Create Admin user:

```python
from app import app, db
from app import User  
from werkzeug.security import generate_password_hash
with app.app_context():
    admin_user = User(username="admin", password=generate_password_hash("admin"), role='HR', is_hr=True)
    db.session.add(admin_user)
    db.session.commit()
```

Testing

With postman.
<!-- todo -->