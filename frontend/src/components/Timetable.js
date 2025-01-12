import React, { useState, useEffect } from 'react';
import './../css/Timetable.css';

const Timetable = ({ timetableData }) => {
    const [formData, setFormData] = useState({
        department: '',
        semester: '',
        division: ''
    });
    const [selectedTimetable, setSelectedTimetable] = useState(null);
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableDivisions, setAvailableDivisions] = useState([]);

    // Extract available departments, semesters, and divisions when timetable data is loaded
    useEffect(() => {
        if (timetableData) {
            const departments = Object.keys(timetableData);
            const semesters = new Set();
            const divisions = new Set();

            for (let department of departments) {
                for (let key of Object.keys(timetableData[department])) {
                    const [semester, division] = key.split(', Division ');
                    semesters.add(semester);
                    divisions.add(division);
                }
            }
            setAvailableDepartments(departments);
            setAvailableSemesters([...semesters]);
            setAvailableDivisions([...divisions]);
        }
    }, [timetableData]);

    // Handle form inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const key = `${formData.semester}, Division ${formData.division}`;
        if (timetableData && timetableData[formData.department] && timetableData[formData.department][key]) {
            setSelectedTimetable(timetableData[formData.department][key]);
        } else {
            setSelectedTimetable(null);
        }
    };

    return (
        <div className="timetable-container">
            <h2>View Timetable</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label>Department:</label>
                    <select name="department" value={formData.department} onChange={handleChange} required>
                        <option value="">Select Department</option>
                        {availableDepartments.map((department, index) => (
                            <option key={index} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Semester:</label>
                    <select name="semester" value={formData.semester} onChange={handleChange} required>
                        <option value="">Select Semester</option>
                        {availableSemesters.map((semester, index) => (
                            <option key={index} value={semester}>
                                {semester}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Division:</label>
                    <select name="division" value={formData.division} onChange={handleChange} required>
                        <option value="">Select Division</option>
                        {availableDivisions.map((division, index) => (
                            <option key={index} value={division}>
                                {division}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="submit-btn">Show Timetable</button>
            </form>

            {selectedTimetable && (
                <div>
                    <h2>Timetable for {formData.department} - {formData.semester}, Division {formData.division}</h2>
                    <table className="timetable-table">
                        <thead>
                            <tr>
                                <th>Time Slot</th>
                                {Object.keys(selectedTimetable).map((day, index) => (
                                    <th key={index}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {selectedTimetable[Object.keys(selectedTimetable)[0]].map((_, slotIndex) => (
                                <tr key={slotIndex}>
                                    <td>Slot {slotIndex + 1}</td>
                                    {Object.keys(selectedTimetable).map((day, dayIndex) => (
                                        <td key={dayIndex}>
                                            {selectedTimetable[day][slotIndex].length > 0
                                                ? selectedTimetable[day][slotIndex].map((item, idx) => (
                                                    <div key={idx}>
                                                        <strong>{item.subject_name}</strong> <br />
                                                        Faculty: {item.faculty}
                                                    </div>
                                                ))
                                                : 'Free Slot'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedTimetable === null && formData.semester && (
                <p>No timetable found for the selected options.</p>
            )}
        </div>
    );
};

export default Timetable;
