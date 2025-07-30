import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

const HeroAdminPanel = () => {
  const { user } = useAuth();

  const [heroData, setHeroData] = useState({
    hero1: { imageUrl: '', h5: '', h1: '', p: '', buttonText: '' },
    hero2: { imageUrl: '', h5: '', h1: '', p: '', buttonText: '' },
    hero3: { imageUrl: '', h5: '', h1: '', p: '', buttonText: '' },
  });

  const handleChange = (key, field, value) => {
    setHeroData(prevData => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    fetch('https://anrfurniture-2.onrender.com/api/hero')
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON - got HTML instead');
        }
        return res.json();
      })
      .then(data => setHeroData(data))
      .catch(err => {
        console.error('Fetch error:', err);
      });
  }, []);

  const token = localStorage.getItem("token");

  const handleSave = (key) => {
    console.log(user);
    fetch(`https://anrfurniture-2.onrender.com/api/hero/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(heroData[key]),
    })
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON - got HTML instead');
        }
        return res.json();
      })
      .then(updated => {
        console.log(`${key} saved!`);
      })
      .catch(err => {
        console.error('Save error:', err);
      });

    if (user.role !== "admin") {
      alert("Access denied, Admin access only!");
    }
  };

  const styles = {
    container: {
      padding: '30px',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb',
    },
    heading: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textTransform: 'capitalize',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      marginBottom: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      resize: 'vertical',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '10px',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'green',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '16px',
    }
  };

  return (
    <div style={styles.container}>
      {Object.entries(heroData).map(([key, data]) => (
        <div key={key} style={styles.card}>
          <h2 style={styles.heading}>{key}</h2>

          <input
            type="text"
            placeholder="Image URL"
            value={data.imageUrl}
            onChange={(e) => handleChange(key, 'imageUrl', e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="H5"
            value={data.h5}
            onChange={(e) => handleChange(key, 'h5', e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="H1"
            value={data.h1}
            onChange={(e) => handleChange(key, 'h1', e.target.value)}
            style={styles.input}
          />
          <textarea
            placeholder="Paragraph"
            value={data.p}
            onChange={(e) => handleChange(key, 'p', e.target.value)}
            style={styles.textarea}
          />
          <input
            type="text"
            placeholder="Button Text"
            value={data.buttonText}
            onChange={(e) => handleChange(key, 'buttonText', e.target.value)}
            style={styles.input}
          />

          <div style={styles.buttonContainer}>
            <button
              style={styles.button}
              onClick={() => handleSave(key)}
            >
              <Save size={20} />
              <span>Save</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroAdminPanel;
