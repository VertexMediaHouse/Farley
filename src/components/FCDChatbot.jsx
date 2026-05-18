import React, { useState, useRef, useEffect } from 'react';

const FCDChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showResizeHint, setShowResizeHint] = useState(false);
  const [chatMode, setChatMode] = useState(null); // null, 'general', 'estimator'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const [position, setPosition] = useState({ right: 30, bottom: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef({ x: 0, y: 0 });
  const resizeRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const windowRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const startDragging = (e) => {
    if (e.target.closest('.fcd-header-controls') || e.target.closest('.fcd-control-btn')) return;
    setIsDragging(true);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialRight: position.right,
      initialBottom: position.bottom
    };
    e.preventDefault();
  };

  const startResizing = (e) => {
    setIsResizing(true);
    resizeRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: dimensions.width,
      h: dimensions.height,
      initialRight: position.right,
      initialBottom: position.bottom
    };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = dragRef.current.x - e.clientX;
        const deltaY = dragRef.current.y - e.clientY;
        setPosition({
          right: dragRef.current.initialRight + deltaX,
          bottom: dragRef.current.initialBottom + deltaY
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeRef.current.x;
        const deltaY = e.clientY - resizeRef.current.y;
        const newWidth = Math.max(320, resizeRef.current.w - deltaX);
        const newHeight = Math.max(400, resizeRef.current.h - deltaY);
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const GENERAL_PROMPT = `You are an AI assistant for Farley Construction & Development (FCD). Provide information about the company and its services.
  
COMPANY OVERVIEW:
FCD is a premium construction and development firm specializing in high-end interior finishes. We pride ourselves on precision, quality materials, and expert craftsmanship.

SERVICES:
1. Drywall: Installation, repairs, and high-level finishing (Orange Peel, Level 4 Smooth, Custom textures).
2. Painting: Full interior painting, professional priming, and trim painting.
3. Trim & Carpentry: Baseboards, crown molding, door casings, and custom millwork.
4. Electrical: Small scale electrical work related to renovations (fans, LED can lights, surface mount fixtures).

TONE & RULES:
Professional, knowledgeable, and inviting. 
If the user asks about pricing, costs, or wants a quote, explain that we have a specialized "Price Estimator" tool built right into this chat that can provide instant preliminary quotes. 
Encourage them to click the "Switch to Estimator" button if they are ready for a quote.`;

  const ESTIMATOR_PROMPT = `You are an AI estimating assistant for Farley Construction & Development (FCD). Guide clients through a project intake and produce detailed estimates.

INTAKE QUESTIONS (ask naturally, 1-2 at a time):
1. Room/area dimensions (walls and ceiling separately)
2. Ceiling height
3. Residential or commercial
4. Age of any water damage
5. drywall:Walls, ceilings, or both?
6. Finish level: Orange Peel, Level 4 Smooth, or Custom?
7. Insulation in walls/ceiling?
8. Popcorn ceiling removal?
9. Demolition or removal required of existing areas or sheetrock, wood trim and insulation?
10. Paint needed or customer painting themselves?
11. Have already enough paints or paint colors and primer?
12. Trim: baseboards, crown molding, door casing, chair rail,any custom trims?
13. Trim demolition needed?
14. Electrical before drywall? (bathroom fan, 4" or 6" can lights)
15. Is the property occupied?
16. Desired start date

PRICING DATABASE:
Labor:
- Ceiling drywall + orange peel: $25/sqft
- Wall drywall + orange peel: $22/sqft
- Ceiling drywall + Level 4: $27/sqft
- Wall drywall + Level 4: $25/sqft
- Popcorn scraping: $2.50/sqft
- Skim coat Level 4: $4.50/sqft
- Drywall install by sheet (orange peel): $704-800
- Demolition = same cost as installation per sqft
- Hole repairs add $3/sqft

Paint:
- Primer & paint: $5/sqft
- Primer only: $5/sqft
- Trim painting: $10/linear ft

Trim install:
- Wood trim/Baseboards/shoe molding/door casing: $5/linear ft
- Crown molding: $7/linear ft

Electrical:
- Bathroom fan: $250
- 4" or 6" LED can lights (includes fixture): $220 each
- Surface mount light (client provides fixture): $150 each

Miscellaneous:
- Haul away: $300
- Store trip charge: $100
- Paint trip charge: $75

Materials:
- R19 Insulation: $100/bundle
- R13 Insulation: $30/roll
- 5/8 Drywall 8ft: $20/sheet
- 1/2 Lightweight Drywall 8ft: $16/sheet
- 1/2 Green Board 8ft: $18.50/sheet
- 2x4x8 Stud: $4.50, 2x4x10 Stud: $7.50
- Drywall Screws 5lb: $25.98, Drywall Screws 25lb: $49.98
- Bullnose Corner Bead: $11
- Joint Compound: $17, Topping Mud: $17, Hot Mud 20: $18, Hot Mud 40: $16
- Corner Bead 8ft: $5, Corner Bead 10ft: $6.50
- Joint Tape: $5, Fiber Tape: $16
- Texture Bucket: $65, Kilz Primer 2 Gal: $35

ESTIMATING RULES:
- Add labor + materials separately
- Add 10% waste to drywall quantities
- Add 15% waste to paint quantities
- Round up all material quantities
- Minimum job charge: $750
- Demolition of existing sheetrock walls same cost as installation of new per sq ft 
- Minimal clean up to wholes from repairs add additional $3 per sq ft
- Always recommend haul away for demolition jobs
- Always recommend primer for new drywall
- Output estimates as a formatted table with line items, subtotals, and total

ESTIMATE OUTPUT FORMAT:
When enough info is collected, output:

FARLEY CONSTRUCTION & DEVELOPMENT
Preliminary Estimate — [Date]

SCOPE OF WORK: [brief description]

LABOR
| Item | Qty | Unit | Total |
...
Subtotal Labor: $X

MATERIALS
| Item | Qty | Unit | Total |
...
Subtotal Materials: $X

ADDITIONAL CHARGES
...
Subtotal: $X

- The $750 Base Service Fee is ALWAYS added on top of everything else.
  Example: Labor $50 + Materials $0 + Base Service Fee $750 = TOTAL $800
  Example: Labor $2000 + Materials $500 + Base Service Fee $750 = TOTAL $3250

ESTIMATE TOTAL: Subtotal Labor + Subtotal Materials + Subtotal Additional Charges + $750 Base Service Fee = [SUM ALL FOUR NUMBERS]
x
CALCULATION RULES (CRITICAL):
- Before outputting the estimate table, first write out every line item calculation
  individually in a hidden scratchpad format: [Item]: [Qty] x [Unit Price] = [Total]
- Double-check every multiplication before placing it in the table
- After computing all line items, sum them one by one:
  Running total: $X + $Y = $Z (repeat for each line)
- Only after verifying the running total, write the final ESTIMATE TOTAL
- ESTIMATE TOTAL = Subtotal Labor + Subtotal Materials + Subtotal Additional Charges + $750 minimum
- Never skip the step-by-step sum — always add line items sequentially, not all at once

FINAL CALCULATION (show this work explicitly before the total line):
  Subtotal Labor:              $____
+ Subtotal Materials:          $____
+ Subtotal Additional Charges: $____
+ Minimum Job Charge:          $750
= ESTIMATE TOTAL:              $____
`;

  const startGeneralChat = () => {
    setChatMode('general');
    setMessages([
      { role: 'assistant', content: "Hello! I'm here to answer any questions you have about Farley Construction & Development and our premium services. What would you like to know?" }
    ]);
  };

  const startEstimatorChat = () => {
    setChatMode('estimator');
    setMessages([
      { role: 'assistant', content: "Hello! I'm your AI estimating assistant. I can help you get a detailed quote for your drywall, paint, and trim projects. To get started, could you tell me the dimensions of the room or area you're looking to work on?" }
    ]);
  };

  const handleBackToSelection = () => {
    setChatMode(null);
    setMessages([]);
    setInputValue('');
  };

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [hasEstimate, setHasEstimate] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' });
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_KEY || import.meta.env.REACT_APP_OPENAI_KEY;
      const prompt = chatMode === 'estimator' ? ESTIMATOR_PROMPT : GENERAL_PROMPT;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: prompt },
            ...messages,
            userMessage
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const assistantMessage = data.choices[0].message;
        setMessages(prev => [...prev, assistantMessage]);

        // Check if this is a final estimate
        if (chatMode === 'estimator' && 
            assistantMessage.content.includes("FARLEY CONSTRUCTION & DEVELOPMENT") && 
            assistantMessage.content.includes("ESTIMATE TOTAL")) {
          setHasEstimate(true);
          setTimeout(() => setShowLeadForm(true), 7000); // 7 seconds delay
        }
      }
    } catch (error) {
      console.error('Error fetching from OpenAI:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again or contact us directly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    // Extract the latest estimate from message history
    const lastEstimate = [...messages].reverse().find(m => 
      m.role === 'assistant' && m.content.includes("FARLEY CONSTRUCTION & DEVELOPMENT")
    );

    const templateParams = {
      user_name: leadData.name,
      user_email: leadData.email,
      user_phone: leadData.phone,
      estimate_details: lastEstimate ? lastEstimate.content : "No estimate found",
      to_email: 'h.kansara106@gmail.com'
    };

    try {
      // NOTE: You need to install @emailjs/browser or use the CDN. 
      // For this single-file component, we'll use a direct fetch to their API
      // which is more reliable than form-submit relays.
      
      // REPLACE THESE WITH YOUR EMAILJS CREDENTIALS
      const SERVICE_ID = 'YOUR_SERVICE_ID';
      const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
      const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: templateParams
        })
      });

      if (response.ok) {
        setIsLeadSubmitted(true);
        setTimeout(() => {
          setShowLeadForm(false);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Thank you, ${leadData.name.split(' ')[0]}! I've sent your information and the estimate to our team. An expert will reach out to you at ${leadData.phone} shortly.` 
          }]);
        }, 1500);
      } else {
        throw new Error("EmailJS Error");
      }
    } catch (error) {
      console.error('Submission Error:', error);
      alert("Submission Error: To fix this, please ensure your EmailJS credentials are set correctly in FCDChatbot.jsx. \n\nCheck the console for more details.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let currentTable = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        if (!currentTable) {
          currentTable = [];
        }
        currentTable.push(trimmedLine);
      } else {
        if (currentTable) {
          elements.push(renderTable(currentTable, `table-${index}`));
          currentTable = null;
        }
        
        if (trimmedLine === '') {
          elements.push(<br key={`br-${index}`} />);
        } else {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const lineElements = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          });
          elements.push(<p key={index}>{lineElements}</p>);
        }
      }
    });

    if (currentTable) {
      elements.push(renderTable(currentTable, 'table-final'));
    }

    return elements;
  };

  const renderTable = (tableLines, key) => {
    const rows = tableLines.filter(line => {
      const content = line.replace(/[|\s-]/g, '');
      return content.length > 0;
    });
    
    if (rows.length === 0) return null;

    return (
      <div className="fcd-table-container" key={key}>
        <table className="fcd-table">
          <thead>
            {rows.slice(0, 1).map((line, rIdx) => (
              <tr key={rIdx}>
                {line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map((cell, cIdx) => (
                  <th key={cIdx}>{cell.trim()}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.slice(1).map((line, rIdx) => (
              <tr key={rIdx}>
                {line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map((cell, cIdx) => (
                  <td key={cIdx}>{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fcd-chatbot-wrapper">
      <style>{`
        .fcd-chatbot-wrapper {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 10000;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .fcd-bubble {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, #3AABF0 0%, #2faeff 50%, #1d88e5 100%);
          box-shadow: 0 10px 25px rgba(47, 174, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.25);
          user-select: none;
          -webkit-user-select: none;
        }

        .fcd-bubble:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 35px rgba(47, 174, 255, 0.45);
        }

        .fcd-bubble:active {
          transform: scale(0.95);
        }

        .fcd-window {
          position: fixed;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 28px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px) scale(0.9);
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          touch-action: none;
        }

        .fcd-window.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .fcd-resize-handle {
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          cursor: nwse-resize;
          z-index: 10001;
          background: rgba(47, 174, 255, 0.08);
          border-bottom-right-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          user-select: none;
          -webkit-user-select: none;
        }

        .fcd-resize-handle:hover {
          background: rgba(47, 174, 255, 0.15);
        }

        .fcd-resize-handle svg {
          color: #2faeff;
          opacity: 0.8;
          animation: fcd-pulse-resize 2s infinite;
        }

        @keyframes fcd-pulse-resize {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .fcd-resize-hint {
          position: absolute;
          top: 40px;
          left: 10px;
          background: #0d2a4d;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          animation: fcd-fade-out 5s forwards;
          z-index: 10003;
        }

        .fcd-resize-hint::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 10px;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 4px solid #0d2a4d;
        }

        @keyframes fcd-fade-out {
          0% { opacity: 0; transform: translateY(5px); }
          10% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-5px); }
        }

        .fcd-header {
          background: linear-gradient(135deg, #071023 0%, #0d2a4d 100%);
          padding: 24px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          cursor: move;
          user-select: none;
          -webkit-user-select: none;
        }

        .fcd-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .fcd-header-titles h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .fcd-header-titles p {
          margin: 4px 0 0;
          font-size: 0.7rem;
          font-weight: 700;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #3AABF0;
        }

        .fcd-header-controls {
          display: flex;
          gap: 8px;
        }

        .fcd-control-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          user-select: none;
          -webkit-user-select: none;
        }

        .fcd-control-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .fcd-selection-screen {
          flex: 1;
          padding: 30px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          justify-content: center;
        }

        .fcd-selection-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          text-align: left;
        }

        .fcd-selection-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
          border-color: #2faeff;
        }

        .fcd-selection-card h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #0d2a4d;
        }

        .fcd-selection-card p {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #666;
        }

        .fcd-selection-card:nth-child(1) .fcd-card-icon {
          background: #e6f4fe;
          color: #1588e8;
        }

        .fcd-selection-card:nth-child(2) .fcd-card-icon {
          background: #eef2ff;
          color: #4f46e5;
        }

        .fcd-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .fcd-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: transparent;
        }

        .fcd-message {
          max-width: 82%;
          padding: 14px 18px;
          border-radius: 20px;
          font-size: 0.95rem;
          line-height: 1.6;
          position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          animation: messageIn 0.4s ease-out forwards;
          transform-origin: bottom;
          user-select: text;
          -webkit-user-select: text;
        }

        @keyframes messageIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .fcd-message.assistant {
          align-self: flex-start;
          background: white;
          color: #1a1a1a;
          border-bottom-left-radius: 5px;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .fcd-message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #1588e8 0%, #0d2a4d 100%);
          color: white;
          border-bottom-right-radius: 5px;
          box-shadow: 0 8px 20px rgba(21, 136, 232, 0.15);
        }

        .fcd-message p { margin: 0 0 12px; }
        .fcd-message p:last-child { margin-bottom: 0; }

        .fcd-table-container {
          margin: 16px 0;
          overflow-x: auto;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 2px;
        }

        .fcd-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.85rem;
        }

        .fcd-table th {
          padding: 12px;
          text-align: left;
          background: rgba(0, 0, 0, 0.02);
          font-weight: 800;
          color: #0d2a4d;
          border-bottom: 2px solid rgba(0, 0, 0, 0.05);
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }

        .fcd-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          color: #444;
        }

        .fcd-input-area {
          padding: 20px 24px 30px;
          background: transparent;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: flex-end;
          gap: 15px;
        }

        .fcd-textarea {
          flex: 1;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          border-radius: 18px;
          padding: 14px 18px;
          font-size: 0.95rem;
          resize: none;
          max-height: 140px;
          outline: none;
          transition: all 0.3s;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .fcd-textarea:focus {
          border-color: #2faeff;
          background: white;
          box-shadow: 0 0 0 4px rgba(47, 174, 255, 0.15);
        }

        .fcd-send-btn {
          background: #2faeff;
          color: white;
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 12px rgba(47, 174, 255, 0.3);
        }

        .fcd-send-btn:hover {
          background: #1d88e5;
          transform: translateY(-3px) scale(1.05);
        }

        .fcd-send-btn:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .fcd-typing { display: flex; gap: 6px; padding: 6px 4px; }
        .fcd-dot {
          width: 8px; height: 8px;
          background: #2faeff; border-radius: 50%;
          opacity: 0.6; animation: fcd-bounce 1.4s infinite ease-in-out both;
        }
        .fcd-dot:nth-child(1) { animation-delay: -0.32s; }
        .fcd-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes fcd-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .fcd-switch-prompt {
          padding: 12px 20px;
          background: #fff;
          border: 1px solid rgba(47, 174, 255, 0.25);
          border-radius: 16px;
          margin: 0 24px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          animation: slideUp 0.4s ease-out forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fcd-switch-prompt p {
          margin: 0;
          font-size: 0.85rem;
          color: #444;
          font-weight: 500;
        }

        .fcd-switch-btn {
          background: #2faeff;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .fcd-switch-btn:hover {
          background: #1d88e5;
          transform: translateY(-1px);
        }

        .fcd-messages::-webkit-scrollbar { width: 6px; }
        .fcd-messages::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }

        .fcd-lead-form-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10002;
          padding: 24px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fcd-lead-form {
          width: 100%;
          background: white;
          padding: 30px;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: center;
        }

        .fcd-lead-form h4 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          color: #0d2a4d;
        }

        .fcd-lead-form p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
        }

        .fcd-lead-inputs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fcd-lead-inputs input {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          border-radius: 14px;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }

        .fcd-lead-inputs input:focus {
          border-color: #2faeff;
          box-shadow: 0 0 0 4px rgba(47, 174, 255, 0.15);
        }

        .fcd-submit-lead {
          background: #2faeff;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 6px;
        }

        .fcd-submit-lead:hover {
          background: #1d88e5;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(47, 174, 255, 0.3);
        }

        .fcd-lead-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #2faeff;
        }

        .fcd-success-icon {
          width: 60px;
          height: 60px;
          background: #e6f4fe;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .fcd-consultation-trigger {
          align-self: center;
          background: #e6f4fe;
          border: 1.5px solid #2faeff;
          color: #1e5a96;
          padding: 12px 24px;
          border-radius: 16px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: messageIn 0.4s ease-out forwards;
        }

        .fcd-consultation-trigger:hover {
          background: #2faeff;
          border-color: #2faeff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(47, 174, 255, 0.25);
        }

        @media (max-width: 480px) {
          .fcd-window { 
            width: calc(100vw - 40px) !important; 
            height: calc(100vh - 120px) !important; 
            bottom: 80px !important; 
            right: 20px !important; 
          }
          .fcd-chatbot-wrapper { bottom: 20px; right: 20px; }
        }
      `}</style>

      <div 
        ref={windowRef}
        className={`fcd-window ${isOpen ? 'open' : ''}`}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          right: `${position.right}px`,
          bottom: `${position.bottom}px`
        }}
      >
        <div className="fcd-resize-handle" onMouseDown={startResizing}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
        </div>
        {showResizeHint && <div className="fcd-resize-hint">Drag to resize</div>}
        <div className="fcd-header" onMouseDown={startDragging}>
          <div className="fcd-header-titles">
            <h3>{chatMode === 'estimator' ? 'Price Estimator' : chatMode === 'general' ? 'General Info' : 'FCD Assistant'}</h3>
            <p>Farley Construction & Development</p>
          </div>
          <div className="fcd-header-controls">
            {chatMode && (
              <button className="fcd-control-btn" onClick={handleBackToSelection} title="Back to Selection">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <button className="fcd-control-btn" onClick={() => setIsOpen(false)} title="Close Chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {!chatMode ? (
          <div className="fcd-selection-screen">
            <div className="fcd-selection-card" onClick={startGeneralChat}>
              <div className="fcd-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <h4>General Info</h4>
              <p>Learn about FCD, our history, and the premium services we offer.</p>
            </div>
            <div className="fcd-selection-card" onClick={startEstimatorChat}>
              <div className="fcd-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h4>Price Estimator</h4>
              <p>Get a detailed preliminary quote for your construction project instantly.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="fcd-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`fcd-message ${msg.role}`}>
                  {msg.role === 'assistant' ? renderMessageContent(msg.content) : <p>{msg.content}</p>}
                </div>
              ))}
              {isTyping && (
                <div className="fcd-message assistant">
                  <div className="fcd-typing">
                    <div className="fcd-dot"></div>
                    <div className="fcd-dot"></div>
                    <div className="fcd-dot"></div>
                  </div>
                </div>
              )}

              {hasEstimate && !isLeadSubmitted && (
                <button 
                  className="fcd-consultation-trigger"
                  onClick={() => setShowLeadForm(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                  Get Expert Consultation
                </button>
              )}
              <div ref={messagesEndRef} />
            </div>

            {chatMode === 'general' && (
              <div className="fcd-switch-prompt">
                <p>Ready for a detailed quote?</p>
                <button className="fcd-switch-btn" onClick={startEstimatorChat}>
                  Switch to Estimator
                </button>
              </div>
            )}

            <div className="fcd-input-area">
              <textarea
                ref={textareaRef}
                className="fcd-textarea"
                placeholder="Type your message..."
                rows="1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className="fcd-send-btn" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </>
        )}

        {showLeadForm && (
          <div className="fcd-lead-form-overlay">
            <div className="fcd-lead-form">
              {!isLeadSubmitted ? (
                <>
                  <div className="fcd-header-titles" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#0d2a4d', fontSize: '1.4rem' }}>Save Your Estimate</h3>
                    <p style={{ color: '#2faeff' }}>Finalize with an Expert</p>
                  </div>
                  <p>To save this estimate and speak with a project manager, please provide your contact details.</p>
                  <form className="fcd-lead-inputs" onSubmit={handleLeadSubmit}>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required 
                      value={leadData.name}
                      onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required 
                      value={leadData.email}
                      onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      required 
                      value={leadData.phone}
                      onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                    />
                    <button type="submit" className="fcd-submit-lead" disabled={isSending}>
                      {isSending ? 'Sending...' : 'Get My Free Consultation'}
                    </button>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => setShowLeadForm(false)}
                    >
                      Maybe Later
                    </button>
                  </form>
                </>
              ) : (
                <div className="fcd-lead-success">
                  <div className="fcd-success-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h4>Details Received!</h4>
                  <p>Our team will reach out to you within 24 hours.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fcd-bubble" onClick={() => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
        if (nextOpen) setShowResizeHint(true);
      }}>
        {isOpen ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </div>
    </div>
  );
};

export default FCDChatbot;
