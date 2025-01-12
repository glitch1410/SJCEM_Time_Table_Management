import React, { useState, useEffect } from 'react';
import './../css/Timetable.css';

const FacultyTimetable = ({ timetableData, userDetails }) => {
    const [facultyTimetable, setFacultyTimetable] = useState(null);

    useEffect(() => {
        if (timetableData && userDetails) {
            const completeTimetable = {};

            // Loop through departments in the timetable data
            Object.keys(timetableData).forEach((department) => {
                // Loop through all semester-division keys (e.g., 'Semester 3, Division A')
                Object.keys(timetableData[department]).forEach((semesterDivisionKey) => {
                    const semesterDivisionTimetable = timetableData[department][semesterDivisionKey];

                    // Loop through all days in the current semester-division timetable
                    Object.keys(semesterDivisionTimetable).forEach((day) => {
                        // Initialize day array if it doesn't exist in the completeTimetable
                        if (!completeTimetable[day]) {
                            completeTimetable[day] = Array(7).fill('Free Slot'); // Assuming 7 time slots per day
                        }

                        // Loop through each slot in the day's timetable
                        semesterDivisionTimetable[day].forEach((slot, slotIndex) => {
                            // Find the subjects where the faculty is assigned
                            const facultySlots = slot.filter((subject) => subject.faculty === userDetails.username);

                            // If the faculty is assigned to this slot, add the subject details to the timetable
                            if (facultySlots.length > 0) {
                                if (completeTimetable[day][slotIndex] === 'Free Slot') {
                                    completeTimetable[day][slotIndex] = []; // Convert 'Free Slot' to array for storing subjects
                                }

                                facultySlots.forEach((subject) => {
                                    completeTimetable[day][slotIndex].push({
                                        ...subject, // Include all subject details
                                        semester: subject.semester, // Take semester info from subject
                                        division: subject.division, // Take division info from subject
                                        department: department // Include department info for display
                                    });
                                });
                            }
                        });
                    });
                });
            });

            setFacultyTimetable(completeTimetable);
        }
    }, [timetableData, userDetails]);

    return (
        <div className="timetable-container">
            <h2>Timetable for {userDetails.username}</h2>

            {facultyTimetable && Object.keys(facultyTimetable).length > 0 ? (
                <table className="timetable-table">
                    <thead>
                        <tr>
                            <th>Time Slot</th>
                            {Object.keys(facultyTimetable).map((day, index) => (
                                <th key={index}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Assuming each day has the same number of slots */}
                        {facultyTimetable[Object.keys(facultyTimetable)[0]].map((_, slotIndex) => (
                            <tr key={slotIndex}>
                                <td>Slot {slotIndex + 1}</td>
                                {Object.keys(facultyTimetable).map((day, dayIndex) => (
                                    <td key={dayIndex}>
                                        {facultyTimetable[day][slotIndex] !== 'Free Slot'
                                            ? facultyTimetable[day][slotIndex].map((item, idx) => (
                                                <div key={idx}>
                                                    <strong>{item.subject_name}</strong> <br />
                                                    Semester: {item.semester} <br />
                                                    Division: {item.division} <br />
                                                    Department: {item.department}
                                                </div>
                                            ))
                                            : 'Free Slot'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No timetable found for your assigned subjects.</p>
            )}
        </div>
    );
};

export default FacultyTimetable;
