import psycopg2
from collections import defaultdict
import random
import json

class TimetableGenerator:
    def __init__(self):
        self.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        self.slots_per_day = 6  # 6 slots per day
        self.valid_lab_start_slots = [0, 2, 4]  # 1st, 3rd, and 5th slots for 2-hour labs
        self.db_conn = None
        self.cursor = None
        self.faculty_schedule = defaultdict(set)  # Track faculty schedules

    def connect_db(self):
        """Establish database connection"""
        try:
            self.db_conn = psycopg2.connect(
                dbname="TTM_ver_5",
                user="postgres",
                password="namaste",
                host="localhost",
                port=5432
            )
            self.cursor = self.db_conn.cursor()
            print("Database connected successfully!")
        except Exception as e:
            print(f"Error connecting to database: {e}")
            raise

    def fetch_departments(self):
        """Fetch CS and IT departments"""
        self.cursor.execute("""
            SELECT id, name FROM Departments 
            WHERE name IN ('Computer Science', 'Information Technology')
        """)
        return self.cursor.fetchall()

    def fetch_subjects_for_semester(self, dept_id, semester):
        """Fetch subjects for a given department and semester"""
        self.cursor.execute("""
            SELECT code, name, is_lab, sessions_per_week, lab_duration 
            FROM Subjects 
            WHERE department_id = %s AND semester = %s
            ORDER BY CASE 
                WHEN is_lab = true AND lab_duration = 2 THEN 1
                WHEN is_lab = true AND lab_duration = 1 THEN 2
                ELSE 3
            END
        """, (dept_id, semester))
        return self.cursor.fetchall()

    def fetch_faculty_for_subject(self, subject_code, semester, division):
        """Fetch faculty assigned to a subject"""
        self.cursor.execute("""
            SELECT DISTINCT faculty_username 
            FROM Faculty_Subjects 
            WHERE subject_code = %s AND semester = %s AND division = %s
        """, (subject_code, semester, division))
        return self.cursor.fetchone()

    def initialize_timetable(self):
        """Initialize empty timetable structure"""
        return {day: [[] for _ in range(self.slots_per_day)] for day in self.days}

    def get_slot_key(self, day, slot):
        """Generate a unique key for a time slot"""
        return f"{day}_{slot}"

    def is_faculty_available(self, faculty, day, slots):
        """Check if faculty is available for given slots"""
        for slot in slots:
            slot_key = self.get_slot_key(day, slot)
            if slot_key in self.faculty_schedule[faculty]:
                return False
        return True

    def mark_faculty_occupied(self, faculty, day, slots):
        """Mark faculty as occupied for given slots"""
        for slot in slots:
            slot_key = self.get_slot_key(day, slot)
            self.faculty_schedule[faculty].add(slot_key)

    def find_available_lab_slot(self, timetable, faculty, duration=2):
        """Find available slots for labs (always scheduled in pairs)"""
        available_slots = []
        
        for day in self.days:
            start_slots = self.valid_lab_start_slots
            
            for start_slot in start_slots:
                if start_slot + duration > self.slots_per_day:
                    continue
                    
                slots_needed = range(start_slot, start_slot + duration)
                
                # Check if slots are free for faculty
                faculty_free = self.is_faculty_available(faculty, day, slots_needed)
                
                # Check if slots are either empty or have capacity for another lab
                slots_available = True
                for slot in slots_needed:
                    current_slots = timetable[day][slot]
                    if len(current_slots) >= 2:  # Maximum 2 labs in parallel
                        slots_available = False
                        break
                    if current_slots and not all('Lab' in s[0] for s in current_slots):
                        slots_available = False
                        break
                
                if slots_available and faculty_free:
                    available_slots.append((day, start_slot))
                    
        return random.choice(available_slots) if available_slots else None

    def find_available_lecture_slot(self, timetable, faculty):
        """Find available slot for regular lectures"""
        available_slots = []
        
        for day in self.days:
            for slot in range(self.slots_per_day):
                # Skip slots that are used by labs
                if timetable[day][slot] and any('Lab' in s[0] for s in timetable[day][slot]):
                    continue
                    
                faculty_free = self.is_faculty_available(faculty, day, [slot])
                slot_empty = len(timetable[day][slot]) == 0
                
                if faculty_free and slot_empty:
                    available_slots.append((day, slot))
                    
        return random.choice(available_slots) if available_slots else None

    def generate_timetables(self):
        """Main function to generate timetables"""
        self.connect_db()
        departments = self.fetch_departments()
        timetables = {}
        
        # Reset faculty schedule for new generation
        self.faculty_schedule.clear()
        
        for dept_id, dept_name in departments:
            divisions = ['A', 'B'] if dept_name == 'Computer Science' else ['A']
            
            for semester in [3, 5, 7]:  # Odd semesters
                for division in divisions:
                    key = f"{dept_name} Sem {semester} Div {division}"
                    timetables[key] = self.initialize_timetable()
                    
                    subjects = self.fetch_subjects_for_semester(dept_id, semester)
                    
                    # Separate one-hour labs for paired scheduling
                    one_hour_labs = []
                    
                    # Process each subject
                    for subject in subjects:
                        code, name, is_lab, sessions_per_week, lab_duration = subject
                        
                        # Collect one-hour labs for paired scheduling
                        if is_lab and lab_duration == 1:
                            one_hour_labs.append((code, name))
                            continue
                            
                        faculty = self.fetch_faculty_for_subject(code, semester, division)
                        if not faculty:
                            continue
                            
                        sessions_remaining = sessions_per_week
                        
                        while sessions_remaining > 0:
                            if is_lab:
                                slot_info = self.find_available_lab_slot(
                                    timetables[key],
                                    faculty[0],
                                    duration=lab_duration
                                )
                            else:
                                slot_info = self.find_available_lecture_slot(
                                    timetables[key],
                                    faculty[0]
                                )
                                
                            if slot_info:
                                day, start_slot = slot_info
                                duration = lab_duration if is_lab else 1
                                
                                # Add subject and faculty to required number of slots
                                for i in range(duration):
                                    timetables[key][day][start_slot + i].append((name, faculty[0]))
                                
                                # Mark faculty as occupied
                                self.mark_faculty_occupied(
                                    faculty[0],
                                    day,
                                    range(start_slot, start_slot + duration)
                                )
                                
                                sessions_remaining -= 1
                            else:
                                print(f"Warning: Could not schedule all sessions for {name}")
                                break
                    
                    # Schedule one-hour lab pairs
                    while len(one_hour_labs) >= 2:
                        lab1, lab2 = one_hour_labs[:2]
                        faculty1 = self.fetch_faculty_for_subject(lab1[0], semester, division)
                        faculty2 = self.fetch_faculty_for_subject(lab2[0], semester, division)
                        
                        if not faculty1 or not faculty2:
                            break
                        
                        slot_info = self.find_available_lab_slot(timetables[key], faculty1[0], duration=1)
                        
                        if slot_info:
                            day, start_slot = slot_info
                            # Schedule both labs together
                            timetables[key][day][start_slot].append((lab1[1], faculty1[0]))
                            timetables[key][day][start_slot + 1].append((lab2[1], faculty2[0]))
                            self.mark_faculty_occupied(faculty1[0], day, [start_slot])
                            self.mark_faculty_occupied(faculty2[0], day, [start_slot + 1])
                        
                        one_hour_labs = one_hour_labs[2:]  # Remove scheduled labs
        
        return timetables

    def generate_html_timetable(self, timetables, filename="timetable.html"):
        """Generate HTML visualization of the timetable"""
        with open(filename, "w") as f:
            f.write("<html><head><style>")
            f.write("table { border-collapse: collapse; width: 100%; }")
            f.write("th, td { border: 1px solid black; padding: 8px; text-align: center; }")
            f.write("</style></head><body>")
            f.write("<h1>Timetables</h1>")
            
            for key, timetable in timetables.items():
                f.write(f"<h2>{key}</h2>")
                f.write("<table><tr><th>Day</th>")
                for i in range(1, self.slots_per_day + 1):
                    f.write(f"<th>Slot {i}</th>")
                f.write("</tr>")
                
                for day in self.days:
                    f.write(f"<tr><td>{day}</td>")
                    for slot in timetable[day]:
                        if slot:
                            # Show both subject and faculty name
                            f.write("<td>")
                            f.write("<br>".join(f"{s[0]}<br>({s[1]})" for s in slot))  # Show subject and faculty
                            f.write("</td>")
                        else:
                            f.write("<td>Free Slot</td>")
                    f.write("</tr>")
                
                f.write("</table>")
            
            f.write("</body></html>")
    
    def save_timetables_to_json(self, timetables, filename="timetables.json"):
        """Save the timetables in JSON format, distinguishing departments."""
        output_data = {
            "Computer Science": {},
            "Information Technology": {}
        }

        # Populate the JSON structure
        for dept_name in output_data.keys():
            for division in ['A', 'B']:
                for semester in [3, 5, 7]:
                    key = f"{dept_name} Sem {semester} Div {division}"
                    if key in timetables:
                        output_data[dept_name][f"Semester {semester}, Division {division}"] = {
                            day: [
                                [
                                    {
                                        "subject_name": subject,
                                        "faculty": faculty,
                                        "division": division,
                                        "semester": semester
                                    }
                                    for subject, faculty in slot
                                ]
                                for slot in timetables[key][day]
                            ]
                            for day in self.days
                        }

        # Write to JSON file
        with open(filename, "w") as json_file:
            json.dump(output_data, json_file, indent=4)

# Example usage:
if __name__ == "__main__":
    generator = TimetableGenerator()
    timetables = generator.generate_timetables()
    generator.generate_html_timetable(timetables)
    generator.save_timetables_to_json(timetables) 
