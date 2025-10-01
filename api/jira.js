export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { endpoint, method = 'GET', ...jiraRequestBody } = req.body || {};
    
    const JIRA_URL = process.env.JIRA_URL;
    const JIRA_EMAIL = process.env.JIRA_EMAIL;
    const JIRA_TOKEN = process.env.JIRA_TOKEN;
    
    if (!JIRA_URL || !JIRA_EMAIL || !JIRA_TOKEN) {
      return res.status(500).json({ 
        error: 'Missing Jira configuration. Please set JIRA_URL, JIRA_EMAIL, and JIRA_TOKEN environment variables.' 
      });
    }
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
    
    // Special handling for search/jql endpoint - convert to GET with query params
    let finalUrl = `${JIRA_URL}${endpoint}`;
    let finalMethod = method;
    let finalBody = Object.keys(jiraRequestBody).length > 0 ? JSON.stringify(jiraRequestBody) : undefined;
    
    
    
    const jiraResponse = await fetch(finalUrl, {
      method: finalMethod,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: finalBody
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