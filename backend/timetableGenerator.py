import psycopg2
import random

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
SLOTS_PER_DAY = 6  # Assuming there are 6 slots per day

def connect_db():
    try:
        conn = psycopg2.connect(
            dbname="TTM_ver_3", 
            user="postgres",
            password="namaste",
            host="localhost",
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

# Fetch subjects for timetable generation
def get_data_for_timetable():
    conn = connect_db()
    if not conn:
        return None
    
    try:
        with conn.cursor() as cur:
            # Fetch subjects for semesters 3, 5, and 7 in Computer Engineering (department_id = 1)
            cur.execute("""
                SELECT s.code, s.name, s.semester, s.is_lab, fs.faculty_username, u.division
                FROM Subjects s
                LEFT JOIN Faculty_Subjects fs ON s.code = fs.subject_code
                LEFT JOIN Users u ON fs.faculty_username = u.username
                WHERE s.semester IN (3, 5, 7)
                AND s.department_id = 1
                ORDER BY s.semester, u.division;
            """)
            subjects_data = cur.fetchall()
            
            return subjects_data
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None
    finally:	
        conn.close()

# Generate an empty timetable structure
def generate_empty_timetable():
    timetable = {}
    for day in DAYS:
        timetable[day] = [None] * SLOTS_PER_DAY
    return timetable

# Faculty schedule tracking to avoid conflicts
def generate_empty_faculty_schedule():
    faculty_schedule = {}
    for day in DAYS:
        faculty_schedule[day] = [None] * SLOTS_PER_DAY
    return faculty_schedule

import random

# Check if a slot is available for a subject and faculty
def is_slot_available(timetable, faculty_schedule, day, slot, subject_name, faculty_username, is_lab=False):
    if is_lab:
        if slot >= SLOTS_PER_DAY - 1:  # Labs need 2 consecutive slots
            return False
        if timetable[day][slot] is not None or timetable[day][slot + 1] is not None:
            return False
        if faculty_schedule[day][slot] == faculty_username or faculty_schedule[day][slot + 1] == faculty_username:
            return False
    else:
        if timetable[day][slot] is not None or faculty_schedule[day][slot] == faculty_username:
            return False
    
    # Check for conflicts with subjects or faculty in the slot
    for scheduled_subject, scheduled_faculty, _, _ in timetable[day][slot] or []:
        if subject_name == scheduled_subject or faculty_username == scheduled_faculty:
            return False
    return True

# Assign subjects to slots with minimum 3 times for each subject, but ensure full timetable coverage
def assign_subjects_optimized(subjects, timetable, faculty_schedule, division, semester):
    lecture_count = {}  # Track how many slots each lecture has
    lab_count = {}      # Track how many labs have been assigned
    
    all_slots = [(day, slot) for day in DAYS for slot in range(SLOTS_PER_DAY)]
    random.shuffle(all_slots)  # Randomize the order of slots to assign subjects

    # First pass: ensure each subject is assigned at least 3 times for lectures or 3 labs
    for subject in subjects:
        subject_code = subject[0]
        subject_name = subject[1]
        is_lab = subject[3]
        faculty_username = subject[4]
        
        if is_lab:
            lab_count[subject_code] = 0
            # Schedule labs exactly 3 times a week
            available_slots = [(day, slot) for day, slot in all_slots if is_slot_available(timetable, faculty_schedule, day, slot, subject_name, faculty_username, is_lab=True)]
            assigned_slots = 0
            for day, slot in available_slots:
                if assigned_slots >= 2:
                    break
                # Assign lab to two consecutive slots
                timetable[day][slot] = [(subject_name, faculty_username, division, semester)]
                timetable[day][slot + 1] = [(subject_name, faculty_username, division, semester)]
                faculty_schedule[day][slot] = faculty_username
                faculty_schedule[day][slot + 1] = faculty_username
                assigned_slots += 1
        else:
            lecture_count[subject_code] = 0
            # Schedule lectures at least 3 times a week
            available_slots = [(day, slot) for day, slot in all_slots if is_slot_available(timetable, faculty_schedule, day, slot, subject_name, faculty_username)]
            assigned_slots = 0
            for day, slot in available_slots:
                if assigned_slots >= 4:
                    break
                # Assign lecture to the slot
                timetable[day][slot] = [(subject_name, faculty_username, division, semester)]
                faculty_schedule[day][slot] = faculty_username
                assigned_slots += 1

    # Second pass: continue assigning subjects to ensure all slots are filled
    subject_idx = 0
    total_subjects = len(subjects)

    for day, slot in all_slots:
        if timetable[day][slot] is None:  # Only fill empty slots
            subject = subjects[subject_idx % total_subjects]
            subject_code = subject[0]
            subject_name = subject[1]
            is_lab = subject[3]
            faculty_username = subject[4]

            if is_lab:
                if slot < SLOTS_PER_DAY - 1 and is_slot_available(timetable, faculty_schedule, day, slot, subject_name, faculty_username, is_lab=True):
                    timetable[day][slot] = [(subject_name, faculty_username, division, semester)]
                    timetable[day][slot + 1] = [(subject_name, faculty_username, division, semester)]
                    faculty_schedule[day][slot] = faculty_username
                    faculty_schedule[day][slot + 1] = faculty_username
            else:
                if is_slot_available(timetable, faculty_schedule, day, slot, subject_name, faculty_username):
                    timetable[day][slot] = [(subject_name, faculty_username, division, semester)]
                    faculty_schedule[day][slot] = faculty_username

            # Move to the next subject
            subject_idx += 1

    return timetable

# Main function to generate timetables for semester 3, 5, and 7
def generate_timetable(subjects_data):
    timetables = {}
    faculty_schedule = generate_empty_faculty_schedule()  # Shared faculty schedule across all timetables
    
    for semester in [3, 5, 7]:
        semester_subjects = [sub for sub in subjects_data if sub[2] == semester]
        
        # For each division in the semester, generate a timetable
        for division in ["A", "B"]:
            timetable = generate_empty_timetable()
            timetable = assign_subjects_optimized(semester_subjects, timetable, faculty_schedule, division, semester)
            timetables[f"Semester {semester}, Division {division}"] = timetable

    return timetables

# Print the generated timetables
def print_timetable(timetables):
    for semester_div, timetable in timetables.items():
        print(f"\nTimetable for {semester_div}:")
        for day, slots in timetable.items():
            print(f"{day}:")
            for slot, entry in enumerate(slots):
                if entry:
                    subjects = ", ".join([f"{s[0]} ({s[1]}, Sem {s[3]})" for s in entry])
                    print(f"  Slot {slot + 1}: {subjects}")
                else:
                    print(f"  Slot {slot + 1}: Free")

# Run the timetable generation
subjects_data = get_data_for_timetable()
if subjects_data:
    timetables = generate_timetable(subjects_data)
    print_timetable(timetables)

from datetime import datetime

def generate_html_timetable(timetables, filename="timetable.html"):
    # Start of HTML content
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Timetable</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                padding: 0;
                background-color: #f9f9f9;
            }
            h1 {
                text-align: center;
                color: #333;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }
            th {
                background-color: #f2f2f2;
            }
            .day-header {
                background-color: #4CAF50;
                color: white;
                font-weight: bold;
            }
            .subject-cell {
                background-color: #f9f9f9;
            }
        </style>
    </head>
    <body>
        <h1>Generated Timetable</h1>
    """

    for semester_div, timetable in timetables.items():
        html_content += f"<h2>{semester_div}</h2>"
        html_content += """
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Slot 1</th>
                    <th>Slot 2</th>
                    <th>Slot 3</th>
                    <th>Slot 4</th>
                    <th>Slot 5</th>
                    <th>Slot 6</th>
                </tr>
            </thead>
            <tbody>
        """

        # Loop through each day of the week and create rows
        for day, slots in timetable.items():
            html_content += f"<tr><td class='day-header'>{day}</td>"

            # Loop through each slot for that day
            for slot in slots:
                if slot:
                    subjects = "<br>".join([f"{s[0]} ({s[1]}, Sem {s[3]})" for s in slot])
                    html_content += f"<td class='subject-cell'>{subjects}</td>"
                else:
                    html_content += "<td>Free</td>"

            html_content += "</tr>"

        html_content += """
            </tbody>
        </table>
        """

    # Closing HTML tags
    html_content += """
    </body>
    </html>
    """

    # Save the HTML content to a file
    with open(filename, "w") as file:
        file.write(html_content)

    print(f"Timetable saved as {filename}")

# Example usage
generate_html_timetable(timetables, "timetable.html")

import json

# Function to save timetables in JSON format
def save_timetable_as_json(timetables, filename="timetable.json"):
    # Prepare a dictionary to store the data in a JSON-compatible format
    json_data = {}

    for semester_div, timetable in timetables.items():
        json_data[semester_div] = {}
        for day, slots in timetable.items():
            json_data[semester_div][day] = []
            for slot in slots:
                if slot:
                    subjects = [{"subject_name": s[0], "faculty": s[1], "division": s[2], "semester": s[3]} for s in slot]
                    json_data[semester_div][day].append(subjects)
                else:
                    json_data[semester_div][day].append([])  # Empty slot

    # Save the JSON data to a file
    with open(filename, "w") as json_file:
        json.dump(json_data, json_file, indent=4)

    print(f"Timetable saved as {filename}")

# Example usage
save_timetable_as_json(timetables, "timetable.json")
