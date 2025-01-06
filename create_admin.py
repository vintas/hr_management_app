from app import app,db
from werkzeug.security import generate_password_hash
from app import User, Employee
from datetime import datetime, timezone

def create_admin():
    with app.app_context():
        username = input("Enter admin username: ")
        password = input("Enter admin password: ")
        name = input("Enter admin name: ")
        dob_input = input("Enter admin date of birth (YYYY-MM-DD): ")
        education = input("Enter admin education: ")

        try:
            dob = datetime.strptime(dob_input, "%Y-%m-%d").date()
        except ValueError:
            print("Error: Invalid date format. Use YYYY-MM-DD.")
            return

        # Check if username already exists
        if User.query.filter_by(username=username).first():
            print("Error: Username already exists.")
            return

        # Create the admin user
        admin_user = User(
            username=username,
            password=generate_password_hash(password),
            is_hr=True,
            is_approved=True
        )

        # Create the corresponding Employee entry
        admin_employee = Employee(
            name=name,
            dob=dob,
            education=education,
            joining_date=datetime.now(timezone.utc),
            department="HR",
            role="HR Manager",
            salary=100000,  # Default salary for admin
            user=admin_user
        )

        # Save to the database
        db.session.add(admin_user)
        db.session.add(admin_employee)
        db.session.commit()
        print(f"Admin user '{username}' created successfully with associated employee record.")

if __name__ == "__main__":
    create_admin()
