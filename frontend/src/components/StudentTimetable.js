import React, { useState, useEffect } from 'react';
import './../css/Timetable.css';

const StudentTimetable = ({ timetableData, userDetails }) => {
    const [studentTimetable, setStudentTimetable] = useState({});

    useEffect(() => {
        if (timetableData && userDetails) {
            const { semester, division } = userDetails;
            const selectedTimetable = {};

            // Loop through departments in the timetable data
            Object.keys(timetableData).forEach((department) => {
                const key = `Semester ${semester}, Division ${division}`;
                if (timetableData[department][key]) {
                    selectedTimetable[department] = timetableData[department][key];
                }
            });

            setStudentTimetable(selectedTimetable);
        }
    }, [timetableData, userDetails]);

    return (
        <div className="timetable-container">
            <h2>
                Timetable for Semester {userDetails.semester}, Division {userDetails.division}
            </h2>

            {Object.keys(studentTimetable).length > 0 ? (
                Object.keys(studentTimetable).map((department, deptIndex) => (
                    <div key={deptIndex}>
                        <h3>{department} Timetable</h3>
                        <table className="timetable-table">
                            <thead>
                                <tr>
                                    <th>Time Slot</th>
                                    {Object.keys(studentTimetable[department]).map((day, index) => (
                                        <th key={index}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {studentTimetable[department][Object.keys(studentTimetable[department])[0]].map((_, slotIndex) => (
                                    <tr key={slotIndex}>
                                        <td>Slot {slotIndex + 1}</td>
                                        {Object.keys(studentTimetable[department]).map((day, dayIndex) => (
                                            <td key={dayIndex}>
                                                {studentTimetable[department][day][slotIndex].length > 0
                                                    ? studentTimetable[department][day][slotIndex].map((item, idx) => (
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
                ))
            ) : (
                <p>No timetable found for your semester and division.</p>
            )}
        </div>
    );
};

export default StudentTimetable;
