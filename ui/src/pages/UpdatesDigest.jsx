import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

export default function UpdatesDigest({ pageData }) {
  const [updates, setUpdates] = useState([]);
  const [headerHtml, setHeaderHtml] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!pageData || !pageData.content) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageData.content, 'text/html');
    
    const spoilerElements = doc.querySelectorAll('.su-spoiler');
    const parsedUpdates = Array.from(spoilerElements).map((spoiler, i) => {
      let title = spoiler.querySelector('.su-spoiler-title')?.textContent || `Update ${i + 1}`;
      title = title.replace(/^\+|-/, '').trim();
      const content = spoiler.querySelector('.su-spoiler-content')?.innerHTML || '';
      return { id: i, title, content };
    });
    
    setUpdates(parsedUpdates);
    
    let header = '';
    const container = doc.querySelector('.entry-content > div') || doc.body;
    for (const child of container.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE && child.classList.contains('su-spoiler')) {
        break;
      }
      header += child.outerHTML || child.textContent;
    }
    setHeaderHtml(header);
    
  }, [pageData]);

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="detail-page updates-digest-page">
      <Link to="/" className="back-link">&larr; Back to Catalog</Link>
      
      <div className="digest-header">
        <h1 className="detail-title">{pageData.title}</h1>
        <div 
          className="digest-intro static-html-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(headerHtml) }}
        />
      </div>

      <div className="updates-list">
        {updates.map(update => (
          <div className={`update-item ${openId === update.id ? 'open' : ''}`} key={update.id}>
            <button className="update-header" onClick={() => toggleOpen(update.id)}>
              <span className="update-title">{update.title}</span>
              <span className="update-icon">{openId === update.id ? '−' : '+'}</span>
            </button>
            <div className="update-content-wrapper">
              <div className="update-content-inner">
                <div 
                  className="update-content og-mirrors-container"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(update.content) }}
                />
              </div>
            </div>
          </div>
        ))}
        {updates.length === 0 && (
          <p>No updates found for this digest.</p>
        )}
      </div>
    </div>
  );
}
