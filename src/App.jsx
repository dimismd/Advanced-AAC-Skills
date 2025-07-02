import React, { useState } from 'react';
import './App.css';
import { categories } from './aacSymbols';

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'el-GR';
    utter.rate = 0.95; // slower for clarity
    utter.pitch = 1.1; // slightly higher pitch
    utter.volume = 1; // max volume
    // Prefer a Greek voice if available
    const voices = window.speechSynthesis.getVoices();
    const greekVoice = voices.find(v => v.lang === 'el-GR');
    if (greekVoice) utter.voice = greekVoice;
    window.speechSynthesis.speak(utter);
  }
}

function App() {
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [customCategories, setCustomCategories] = useState(() => JSON.parse(localStorage.getItem('aacCustomCategories') || 'null') || categories);

  // Save custom categories to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('aacCustomCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  const handleSymbolClick = (symbol) => {
    setMessage((prev) => (prev ? prev + ' ' : '') + symbol.text);
    speak(symbol.text);
  };

  const handleClear = () => setMessage('');

  return (
    <div className="aac-app">
      <div className="aac-message-box" aria-label="Πλαίσιο επικοινωνίας" tabIndex={0}>
        {message || <span style={{ color: '#888' }}>Πατήστε εικόνες για να γράψετε μήνυμα...</span>}
        <button className="aac-clear-btn" onClick={handleClear} aria-label="Καθαρισμός μηνύματος">✕</button>
      </div>
      <div className="aac-categories">
        {customCategories.map((cat, idx) => (
          <button
            key={cat.name}
            className={`aac-category-btn${activeCategory === idx ? ' active' : ''}`}
            onClick={() => setActiveCategory(idx)}
            aria-label={cat.name}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <AddWordForm
        onAdd={(img, text, color) => {
          setCustomCategories((prev) => prev.map((cat, idx) => idx === activeCategory
            ? { ...cat, symbols: [...cat.symbols, { img, text, color }] }
            : cat
          ));
        }}
      />
      <div className="aac-board">
        {customCategories[activeCategory].symbols.map((symbol, idx) => {
          // Check if symbol.img looks like an image file
          const isImage =
            typeof symbol.img === 'string' &&
            /\.(png|jpe?g|gif|svg)$/i.test(symbol.img);
          return (
            <button
              key={idx}
              className="aac-symbol"
              style={{ borderColor: symbol.color, background: symbol.color + '22' }}
              onClick={() => handleSymbolClick(symbol)}
              aria-label={symbol.text}
            >
              {isImage ? (
                <img
                  src={symbol.img}
                  alt={symbol.text}
                  className="aac-symbol-img"
                  style={{ width: '2.7rem', height: '2.7rem', objectFit: 'contain' }}
                />
              ) : (
                <span className="aac-symbol-img" role="img" aria-label={symbol.text}>
                  {symbol.img}
                </span>
              )}
              <span className="aac-symbol-text">{symbol.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// AddWordForm component
function AddWordForm({ onAdd }) {
  const [img, setImg] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState('#90caf9');
  return (
    <form className="aac-add-word-form" onSubmit={e => {
      e.preventDefault();
      if (!text.trim()) return;
      onAdd(img, text, color);
      setImg(''); setText(''); setColor('#90caf9');
    }}>
      <input
        type="text"
        placeholder="Emoji ή /εικόνα.png"
        value={img}
        onChange={e => setImg(e.target.value)}
        className="aac-add-word-input"
        aria-label="Εικονίδιο"
        style={{width: '7em'}}
      />
      <input
        type="text"
        placeholder="Λέξη"
        value={text}
        onChange={e => setText(e.target.value)}
        className="aac-add-word-input"
        aria-label="Λέξη"
        style={{width: '10em'}}
      />
      <input
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        className="aac-add-word-input"
        aria-label="Χρώμα"
        style={{width: '3em', padding: 0, border: 'none', background: 'none'}}
      />
      <button type="submit" className="aac-add-word-btn">Προσθήκη</button>
    </form>
  );
}

export default App;
