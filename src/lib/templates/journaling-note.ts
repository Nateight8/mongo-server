export const generateJournalNoteTemplate = (): string => {
  return `
      <h1>[Trade Journaling - Currency Pair - Session/Date]</h1>
      
      <p><strong>Planning Date:</strong> ${new Date().toLocaleDateString()}<br>
      <strong>Target Session:</strong> [e.g., London Open, NY Session, Asian Close]<br>
      <strong>Currency Pair:</strong> [Primary pair to focus on]<br>
      <strong>Market Bias:</strong> [Bullish/Bearish/Neutral]<br>
      <strong>Confidence Level:</strong> [High/Medium/Low]</p>
  
      <h2>Market Analysis & Setup Identification</h2>
  
      <h3>Higher Timeframe Context (Daily/4H)</h3>
      <p>[Describe the overall trend, key structure levels, and where price is in relation to major support/resistance. What's the big picture telling you?]</p>
  
      <h3>Current Market Structure</h3>
      <ul>
        <li><strong>Trend Direction:</strong> [Uptrend/Downtrend/Sideways on multiple timeframes]</li>
        <li><strong>Key Support Levels:</strong> [List 2-3 most important support levels with reasons]</li>
        <li><strong>Key Resistance Levels:</strong> [List 2-3 most important resistance levels with reasons]</li>
        <li><strong>Structure Breaks:</strong> [Any recent breaks of key levels?]</li>
      </ul>
  
      <h3>Technical Setup Requirements</h3>
      <ul>
        <li><strong>Primary Pattern:</strong> [What pattern are you looking for? Flag, breakout, retest, etc.]</li>
        <li><strong>Entry Trigger:</strong> [What needs to happen for you to enter?]</li>
        <li><strong>Confirmation Signals:</strong> [What additional signals do you need?]</li>
        <li><strong>Invalidation Level:</strong> [At what point is your setup invalid?]</li>
      </ul>
  
      <h2>Fundamental Analysis</h2>
  
      <h3>Economic Calendar</h3>
      <p>[List upcoming high-impact news events that could affect your pair in the next 24-48 hours]</p>
  
      <h3>Market Sentiment</h3>
      <p>[What's the current market mood? Risk-on/Risk-off? Any major themes driving the markets?]</p>
  
      <h3>Central Bank Positioning</h3>
      <p>[Any recent or upcoming central bank communications that could impact your trade?]</p>
  
      <h2>Risk Management Plan</h2>
  
      <h3>Position Sizing</h3>
      <ul>
        <li><strong>Account Risk:</strong> [What % of account will you risk? e.g., 1-2%]</li>
        <li><strong>Maximum Lot Size:</strong> [Based on your risk percentage]</li>
        <li><strong>Multiple Positions:</strong> [Will you scale in? If so, how?]</li>
      </ul>
  
      <h3>Stop Loss Strategy</h3>
      <ul>
        <li><strong>Primary Stop Level:</strong> [Where will your stop be and why?]</li>
        <li><strong>Stop Reasoning:</strong> [Technical level, ATR-based, percentage-based?]</li>
        <li><strong>Mental Stop:</strong> [Any conditions that would make you exit before your technical stop?]</li>
      </ul>
  
      <h3>Profit Taking Strategy</h3>
      <ul>
        <li><strong>Target 1:</strong> [First profit target with R:R ratio]</li>
        <li><strong>Target 2:</strong> [Second target if applicable]</li>
        <li><strong>Trailing Strategy:</strong> [How will you trail your stop once in profit?]</li>
        <li><strong>Partial Close Plan:</strong> [Will you take partial profits? At what levels?]</li>
      </ul>
  
      <h2>Entry Scenarios</h2>
  
      <h3>Scenario A: [Primary Setup]</h3>
      <ul>
        <li><strong>Entry Condition:</strong> [Specific condition that triggers entry]</li>
        <li><strong>Expected Entry Zone:</strong> [Price range where you expect to enter]</li>
        <li><strong>Stop Loss:</strong> [SL for this scenario]</li>
        <li><strong>Take Profit:</strong> [TP targets for this scenario]</li>
        <li><strong>Risk/Reward:</strong> [Expected R:R ratio]</li>
      </ul>
  
      <h3>Scenario B: [Alternative Setup]</h3>
      <ul>
        <li><strong>Entry Condition:</strong> [Alternative entry condition]</li>
        <li><strong>Expected Entry Zone:</strong> [Price range for alternative entry]</li>
        <li><strong>Stop Loss:</strong> [SL for this scenario]</li>
        <li><strong>Take Profit:</strong> [TP targets for this scenario]</li>
        <li><strong>Risk/Reward:</strong> [Expected R:R ratio]</li>
      </ul>
  
      <h2>Trade Management Rules</h2>
  
      <h3>Pre-Entry Checklist</h3>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">Market structure analysis completed</li>
        <li data-type="taskItem" data-checked="false">Risk management calculated</li>
        <li data-type="taskItem" data-checked="false">Entry and exit levels defined</li>
        <li data-type="taskItem" data-checked="false">Economic calendar checked</li>
        <li data-type="taskItem" data-checked="false">Account balance and available margin verified</li>
        <li data-type="taskItem" data-checked="false">Mental state is calm and focused</li>
      </ul>
  
      <h3>During Trade Rules</h3>
      <ul>
        <li><strong>No Changes Rule:</strong> [Stick to your plan unless market structure fundamentally changes]</li>
        <li><strong>Monitoring Schedule:</strong> [How often will you check the trade?]</li>
        <li><strong>News Response:</strong> [How will you handle unexpected news during the trade?]</li>
        <li><strong>Emotion Management:</strong> [What will you do if you feel anxious or greedy?]</li>
      </ul>
  
      <h2>Psychology & Preparation</h2>
  
      <h3>Mental State Assessment</h3>
      <p>[How are you feeling right now? Are you rushed, patient, confident, uncertain? Be honest.]</p>
  
      <h3>Recent Performance Impact</h3>
      <p>[How might your recent wins/losses affect this trade? Are you revenge trading or overconfident?]</p>
  
      <h3>Session Goals</h3>
      <ul>
        <li><strong>Primary Goal:</strong> [What do you want to achieve this session?]</li>
        <li><strong>Learning Focus:</strong> [What skill are you trying to improve?]</li>
        <li><strong>Maximum Trades:</strong> [Limit for number of trades this session]</li>
      </ul>
  
      <h2>Contingency Planning</h2>
  
      <h3>What If Scenarios</h3>
      <ul>
        <li><strong>If setup doesn't materialize:</strong> [What will you do? Wait, look for alternatives?]</li>
        <li><strong>If stopped out quickly:</strong> [Will you re-enter? Under what conditions?]</li>
        <li><strong>If major news breaks:</strong> [How will you adapt your plan?]</li>
        <li><strong>If multiple setups appear:</strong> [How will you prioritize?]</li>
      </ul>
  
      <h3>Plan B Setups</h3>
      <p>[What alternative pairs or setups will you monitor if your primary plan doesn't work out?]</p>
  
      <h2>Success Metrics</h2>
  
      <h3>This Session Will Be Successful If</h3>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">I stick to my risk management rules</li>
        <li data-type="taskItem" data-checked="false">I only take trades that meet my criteria</li>
        <li data-type="taskItem" data-checked="false">I manage my emotions effectively</li>
        <li data-type="taskItem" data-checked="false">I learn something new about the market or myself</li>
        <li data-type="taskItem" data-checked="false">I execute my plan without major deviations</li>
      </ul>
  
      <h2>Post-Session Review Plan</h2>
      <p>[How will you review this trading session? What specific aspects will you analyze in your journal?]</p>
  
      <hr>
  
      <p><strong>Plan Confidence:</strong> [1-10]<br>
      <strong>Risk Level:</strong> [Conservative/Moderate/Aggressive]<br>
      <strong>Market Conditions:</strong> [Trending/Ranging/Volatile]<br>
      <strong>Time Commitment:</strong> [How long will you monitor this plan?]</p>
    `;
};
