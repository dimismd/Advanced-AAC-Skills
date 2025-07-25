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

  // Edit mode state
  const [editMode, setEditMode] = useState(false);

  // Remove symbol handler
  const handleRemoveSymbol = (symbolIdx) => {
    setCustomCategories((prev) => prev.map((cat, idx) =>
      idx === activeCategory
        ? { ...cat, symbols: cat.symbols.filter((_, i) => i !== symbolIdx) }
        : cat
    ));
  };

  return (
    <div className="aac-app">
      <div className="aac-message-box" aria-label="Πλαίσιο επικοινωνίας" tabIndex={0}>
        {message || <span style={{ color: '#888' }}>Πατήστε εικόνες για να γράψετε μήνυμα...</span>}
        <button className="aac-clear-btn" onClick={handleClear} aria-label="Καθαρισμός μηνύματος">✕</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: '1rem' }}>
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
        <button
          type="button"
          className="aac-edit-mode-btn"
          onClick={() => setEditMode((prev) => !prev)}
          aria-label={editMode ? 'Τέλος επεξεργασίας' : 'Επεξεργασία συμβόλων'}
          style={{
            background: editMode ? '#ffd54f' : '#90caf9',
            color: '#1976d2',
            border: '1.5px solid #1976d2',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            padding: '0.25em 0.7em',
            cursor: 'pointer',
            marginLeft: '0.7em',
            boxShadow: editMode ? '0 1px 4px #ffd54f33' : '0 1px 4px #90caf91a',
            outline: 'none',
          }}
        >
          {editMode ? 'Τέλος επεξεργασίας' : 'Επεξεργασία συμβόλων'}
        </button>
        <button
          type="button"
          className="aac-reset-btn"
          onClick={() => {
            localStorage.removeItem('aacCustomCategories');
            setCustomCategories(categories);
          }}
          aria-label="Επαναφορά προεπιλεγμένων συμβόλων"
          style={{
            background: '#e57373',
            color: '#fff',
            border: '1.5px solid #c62828',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            padding: '0.25em 0.7em',
            cursor: 'pointer',
            marginLeft: '0.7em',
            boxShadow: '0 1px 4px #e573731a',
            outline: 'none',
          }}
        >
          Επαναφορά συμβόλων
        </button>
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
          const isImage =
            typeof symbol.img === 'string' &&
            /\.(png|jpe?g|gif|svg)$/i.test(symbol.img);
          return (
            <div key={idx} className="aac-symbol-wrapper" style={{ position: 'relative' }}>
              <button
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
              {editMode && (
                <button
                  className="aac-remove-symbol-btn"
                  onClick={() => handleRemoveSymbol(idx)}
                  aria-label={`Αφαίρεση συμβόλου: ${symbol.text}`}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: '#e57373',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '1.7rem',
                    height: '1.7rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    zIndex: 2,
                    boxShadow: '0 1px 4px #e573731a',
                  }}
                  tabIndex={0}
                  title={`Αφαίρεση συμβόλου: ${symbol.text}`}
                >
                  ×
                </button>
              )}
            </div>
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
  const [maximized, setMaximized] = useState(false);

  // Example images: emojis, peppa.png, and more
  const exampleImages = [
    '👍', '👎', '🙏', '🤲', '🆘', '❤️', '👩', '👨', '👵', '👴',
    '🍽️', '💧', '🍲', '🥤', '🚽', '🚻', '🛁', '🧥', '🧩', '🚶‍♂️',
    '📚', '🎵', '/aac-app/peppa.png', '😴', '📺', '😊', '😢', '😱',
    '😡', '😩', '🤕', '😃', '😄', '😆', '😅', '😂', '🤣', '😇',
    '😋', '😜', '🤩', '🥳', '😎', '🤓', '🦄', '🐶', '🐱', '🐭',
    '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
    '🐸', '🐵', '🦉', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆',
    '🦅', '🦢', '🦜', '🦚', '🦋', '🐞', '🐌', '🐛', '🐜', '🦟',
    '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑',
    '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈',
    // Sports emojis
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓',
    '🏸', '🥅', '🏒', '🏑', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋',
    '🎽', '🛹', '🛷', '⛸️', '🥌', '🛼', '🛶', '🏂', '⛷️', '🏄‍♂️',
    '🏊‍♂️', '🤽‍♂️', '🚴‍♂️', '🚵‍♂️', '🤸‍♂️', '🤾‍♂️', '🤹‍♂️',
    '/aac-app/vite.svg', '/aac-app/react.svg'
  ];

  return (
    <form className="aac-add-word-form" onSubmit={e => {
      e.preventDefault();
      if (!text.trim()) return;
      onAdd(img, text, color);
      setImg(''); setText(''); setColor('#90caf9');
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '1em' }}>
        <div style={{ width: '100%', marginBottom: '0.5em', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            aria-label={maximized ? 'Απόκρυψη εικόνων' : 'Εμφάνιση περισσότερων εικόνων'}
            onClick={() => setMaximized((prev) => !prev)}
            style={{
              background: maximized ? '#ffd54f' : '#90caf9',
              color: '#1976d2',
              border: '2px solid #1976d2',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1em',
              padding: '0.3em 1em',
              cursor: 'pointer',
              marginBottom: '0.2em',
              boxShadow: maximized ? '0 2px 8px #ffd54f33' : '0 2px 8px #90caf91a',
              outline: 'none',
            }}
          >
            {maximized ? 'Απόκρυψη εικόνων' : 'Εμφάνιση περισσότερων εικόνων'}
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 2.2em)',
            gap: '0.3em',
            marginBottom: '0.5em',
            maxHeight: maximized ? 'none' : '4.8em',
            overflowY: maximized ? 'visible' : 'hidden',
            transition: 'max-height 0.3s',
          }}
          aria-label="Επιλογή εικόνας"
        >
          {exampleImages.map((ex, i) => (
            <button
              key={i}
              type="button"
              style={{
                background: img === ex ? '#90caf9' : '#fff',
                border: img === ex ? '2px solid #1976d2' : '1px solid #90caf9',
                borderRadius: '6px',
                width: '2.2em',
                height: '2.2em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: img === ex ? '0 2px 8px #1976d233' : 'none',
                padding: 0,
              }}
              aria-label={typeof ex === 'string' && ex.startsWith('/') ? 'Εικόνα' : ex}
              onClick={() => setImg(ex)}
            >
              {typeof ex === 'string' && ex.startsWith('/') ? (
                <img src={ex} alt="Εικόνα" style={{ width: '1.7em', height: '1.7em', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '1.5em' }}>{ex}</span>
              )}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Emoji ή /εικόνα.png"
          value={img}
          onChange={e => setImg(e.target.value)}
          className="aac-add-word-input"
          aria-label="Εικονίδιο"
          style={{width: '7em'}}
        />
      </div>
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
