import React, {setStatus, useState} from 'react';
import axios from 'axios';

const GenerateTimetable = ({ onGenerate }) => {
	const [status, setStatus] = useState('');
    // Trigger the backend script and fetch timetable data after it's generated
    const handleGenerateTimetable = async () => {
        try {
            const response = await axios.post('http://localhost:5000/generate-timetable');
            // Call the parent function to fetch the new timetable data
			setStatus(response.data.message);
            onGenerate();
        } catch (error) {
            console.error('Error generating timetable:', error);
        }
    };

    return (
        <div className="generate-container">
            <button onClick={handleGenerateTimetable} className="generate-btn">
                Generate Timetable
            </button>
			{status && <p>{status}</p>}
        </div>
    );
};

export default GenerateTimetable;
