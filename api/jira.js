// api/jira.js - Place this file in an 'api' folder in your project

export default async function handler(req, res) {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { endpoint, method = 'GET', body } = req.body || req.query;
    
    // Your Jira credentials (will be set as environment variables)
    const JIRA_URL = process.env.JIRA_URL; // https://alignvue.atlassian.net
    const JIRA_EMAIL = process.env.JIRA_EMAIL; // your email
    const JIRA_TOKEN = process.env.JIRA_TOKEN; // your API token
    
    if (!JIRA_URL || !JIRA_EMAIL || !JIRA_TOKEN) {
      return res.status(500).json({ 
        error: 'Missing Jira configuration. Please set JIRA_URL, JIRA_EMAIL, and JIRA_TOKEN environment variables.' 
      });
    }
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    // Create authorization header
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
    
    // Make request to Jira
    const jiraResponse = await fetch(`${JIRA_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('Jira API error:', jiraResponse.status, errorText);
      return res.status(jiraResponse.status).json({ 
        error: `Jira API error: ${jiraResponse.status}`,
        details: errorText
      });
    }
    
    const data = await jiraResponse.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
