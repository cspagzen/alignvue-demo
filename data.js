// data.js - Board Data with Updated Team Health Dimensions
// New dimensions: Capacity, Skillset, Vision, Support, Teamwork, Autonomy

const boardData = {
    initiatives: [
        { id: 1, title: "App Unification", type: "strategic", validation: "validated", priority: 1, teams: ["Core Platform", "User Experience", "Security"], progress: 75,
            jira: { key: "APP-100", stories: 45, completed: 34, inProgress: 8, blocked: 3, velocity: 12 },
            canvas: { outcome: "Single unified app experience", measures: "80% user adoption, 50% support ticket reduction", keyResult: "Increase monthly active users by 40%", marketSize: "All current users", customer: "Existing multi-app users", problem: "Fragmented user experience across multiple apps", solution: "Consolidated single-app architecture", bigPicture: "Create seamless user experience by unifying disparate applications into cohesive platform.", alternatives: "Salesforce Platform, Microsoft Power Platform" }
        },
        { id: 2, title: "RMC Call Queue", type: "ktlo", validation: "validated", priority: 2, teams: ["Customer Support", "Core Platform"], progress: 60,
            jira: { key: "RMC-150", stories: 28, completed: 17, inProgress: 6, blocked: 5, velocity: 8 },
            canvas: { outcome: "Efficient call routing and queue management", measures: "30% reduction in wait times, 95% call connection rate", keyResult: "Achieve 95% system uptime", marketSize: "All incoming customer calls", customer: "Customer support agents and callers", problem: "Inefficient call routing causing long wait times", solution: "Intelligent call queue with priority routing", bigPicture: "Optimize customer support operations through smart call management and reduced response times.", alternatives: "Zendesk Talk, Five9, Genesys Cloud" }
        },
        { id: 3, title: "Gateway Unification", type: "strategic", validation: "in-validation", priority: 3, teams: ["Core Platform", "Site Reliability", "Security"], progress: 45,
            jira: { key: "GW-200", stories: 52, completed: 23, inProgress: 12, blocked: 17, velocity: 9 },
            canvas: { outcome: "Single API gateway for all services", measures: "99.9% uptime, 200ms response time", keyResult: "Achieve 95% system uptime", marketSize: "All API traffic", customer: "Internal developers and external partners", problem: "Multiple gateways creating complexity and maintenance overhead", solution: "Consolidated API gateway with unified security and monitoring", bigPicture: "Simplify architecture and improve reliability through centralized API management and security.", alternatives: "Kong Gateway, AWS API Gateway, Apigee" }
        },
        { id: 4, title: "Customer Dashboard v3", type: "strategic", validation: "validated", priority: 4, teams: ["User Experience", "Analytics"], progress: 85,
            jira: { key: "DASH-180", stories: 36, completed: 31, inProgress: 4, blocked: 1, velocity: 15 },
            canvas: { outcome: "Intuitive customer self-service portal", measures: "40% increase in self-service usage, 4.5+ user rating", keyResult: "Increase monthly active users by 40%", marketSize: "All customer interactions", customer: "End customers seeking self-service", problem: "Outdated dashboard limiting customer satisfaction and self-service adoption", solution: "Modern, responsive dashboard with personalized insights", bigPicture: "Empower customers with intuitive self-service capabilities reducing support load and improving satisfaction.", alternatives: "Salesforce Experience Cloud, Zendesk Guide, Freshworks Customer Portal" }
        },
        { id: 5, title: "DevOps Pipeline v2", type: "ktlo", validation: "in-validation", priority: 5, teams: ["Site Reliability", "Security"], progress: 30,
            jira: { key: "DEVOPS-240", stories: 44, completed: 13, inProgress: 15, blocked: 16, velocity: 6 },
            canvas: { outcome: "Automated CI/CD with security integration", measures: "90% automated deployments, 50% faster releases", keyResult: "Achieve 95% system uptime", marketSize: "All development workflows", customer: "Development and operations teams", problem: "Manual deployment processes causing delays and errors", solution: "Fully automated CI/CD pipeline with integrated security scanning", bigPicture: "Accelerate development velocity while maintaining security and reliability through automated deployment pipeline.", alternatives: "GitHub Actions, GitLab CI/CD, Jenkins X" }
        },
        { id: 6, title: "Machine Learning Platform", type: "emergent", validation: "not-validated", priority: 6, teams: ["Machine Learning", "Data Engineering"], progress: 15,
            jira: { key: "ML-300", stories: 48, completed: 7, inProgress: 12, blocked: 29, velocity: 3 },
            canvas: { outcome: "Scalable ML model deployment platform", measures: "10+ models in production, 99% uptime", keyResult: "Launch 3 new strategic product capabilities", marketSize: "$50M AI opportunity", customer: "Data scientists and product teams", problem: "No standardized ML infrastructure limiting AI capability deployment", solution: "Enterprise ML platform with model lifecycle management", bigPicture: "Enable organization-wide AI capabilities through standardized, scalable machine learning infrastructure.", alternatives: "AWS SageMaker, Azure ML, Google AI Platform" }
        },
        { id: 7, title: "Social Media Integration", type: "emergent", validation: "not-validated", priority: 7, teams: ["User Experience", "Developer Relations"], progress: 5,
            jira: { key: "SOCIAL-120", stories: 25, completed: 1, inProgress: 4, blocked: 20, velocity: 1 },
            canvas: { outcome: "Social platform connectivity and sharing", measures: "Social engagement +200%, viral coefficient 1.2", keyResult: "Increase monthly active users by 40%", marketSize: "Social media user base", customer: "Users active on social platforms", problem: "No social integration limiting organic growth and user engagement", solution: "Deep social platform integration with sharing and collaboration features", bigPicture: "Leverage social networks to drive organic user growth and increase platform engagement through social sharing.", alternatives: "Hootsuite, Buffer, Sprout Social" }
        },
        { id: 8, title: "Billing System v3", type: "strategic", validation: "validated", priority: 8, teams: ["Business Operations", "Core Platform"], progress: 50,
            jira: { key: "BILL-260", stories: 40, completed: 20, inProgress: 12, blocked: 8, velocity: 10 },
            canvas: { outcome: "Flexible billing and subscription management", measures: "Support 5+ billing models, 99.9% accuracy", keyResult: "Launch 3 new strategic product capabilities", marketSize: "All revenue streams", customer: "Finance and operations teams", problem: "Inflexible billing system limiting product offerings and pricing strategies", solution: "Modern billing platform supporting multiple pricing models and subscription types", bigPicture: "Enable diverse revenue models and pricing strategies through flexible, accurate billing infrastructure.", alternatives: "Stripe, Recurly, Chargebee" }
        },
        { id: 9, title: "Payment Gateway Integration", type: "strategic", validation: "in-validation", priority: 9, teams: ["Core Platform", "Security", "Business Operations"], progress: 25,
            jira: { key: "PAY-140", stories: 34, completed: 8, inProgress: 11, blocked: 15, velocity: 5 },
            canvas: { outcome: "Secure multi-payment provider support", measures: "Support 3+ payment methods, <2s processing", keyResult: "Launch 3 new strategic product capabilities", marketSize: "All customer transactions", customer: "Customers making payments", problem: "Limited payment options reducing conversion and customer satisfaction", solution: "Multi-gateway payment system with fraud protection and mobile payments", bigPicture: "Maximize payment conversion and customer convenience through comprehensive payment method support and security.", alternatives: "Stripe, Square, PayPal" }
        },
        { id: 10, title: "Mobile App MVP", type: "emergent", validation: "not-validated", priority: 10, teams: ["Mobile Development", "User Experience", "Product Management"], progress: 10,
            jira: { key: "MOB-100", stories: 42, completed: 4, inProgress: 8, blocked: 30, velocity: 2 },
            canvas: { outcome: "Native mobile app for key features", measures: "10k downloads, 4+ app store rating", keyResult: "Increase monthly active users by 40%", marketSize: "Mobile-first user segment", customer: "Users preferring mobile experience", problem: "No mobile presence limiting user accessibility", solution: "Native iOS/Android app with core functionality", bigPicture: "Expand market reach by providing mobile-native experience for growing mobile user base.", alternatives: "React Native, Flutter, Progressive Web App" }
        },
        { id: 11, title: "Security Framework", type: "ktlo", validation: "validated", priority: 11, teams: ["Security", "Compliance"], progress: 70,
            jira: { key: "SEC-220", stories: 31, completed: 22, inProgress: 6, blocked: 3, velocity: 11 },
            canvas: { outcome: "Comprehensive security architecture", measures: "Zero security incidents, SOC2 compliance", keyResult: "Achieve 95% system uptime", marketSize: "All company assets", customer: "All users and stakeholders", problem: "Security gaps creating compliance and risk exposure", solution: "Enterprise security framework with monitoring", bigPicture: "Establish robust security posture protecting all assets while enabling business growth and compliance.", alternatives: "CrowdStrike, Okta, Auth0" }
        },
        { id: 12, title: "Analytics v3", type: "strategic", validation: "in-validation", priority: 12, teams: ["Analytics", "Data Engineering"], progress: 35,
            jira: { key: "ANA-280", stories: 39, completed: 14, inProgress: 11, blocked: 14, velocity: 6 },
            canvas: { outcome: "Real-time analytics and reporting", measures: "Sub-second query response, 99% data accuracy", keyResult: "Launch 3 new strategic product capabilities", marketSize: "All business data", customer: "Business users and executives", problem: "Slow analytics preventing timely business decisions", solution: "Real-time analytics platform with interactive dashboards", bigPicture: "Enable instant business insights through real-time data processing and interactive visualization.", alternatives: "Snowflake, BigQuery, Redshift" }
        },
        { id: 13, title: "Backup Strategy", type: "ktlo", validation: "validated", priority: 13, teams: ["Site Reliability"], progress: 55,
            jira: { key: "BAK-160", stories: 24, completed: 13, inProgress: 7, blocked: 4, velocity: 9 },
            canvas: { outcome: "Automated backup and disaster recovery", measures: "RTO 4hrs, RPO 1hr, 99.9% backup success", keyResult: "Achieve 95% system uptime", marketSize: "All critical data", customer: "Operations and compliance teams", problem: "Manual backup processes creating risk and compliance gaps", solution: "Automated backup with point-in-time recovery", bigPicture: "Ensure business continuity through reliable, automated data protection and rapid disaster recovery.", alternatives: "Veeam, Commvault, AWS Backup" }
        },
        { id: 14, title: "Performance Optimization", type: "ktlo", validation: "not-validated", priority: 14, teams: ["Core Platform", "Site Reliability"], progress: 20,
            jira: { key: "PERF-190", stories: 33, completed: 7, inProgress: 10, blocked: 16, velocity: 4 },
            canvas: { outcome: "Improved application performance", measures: "50% faster page loads, 30% better throughput", keyResult: "Achieve 95% system uptime", marketSize: "All user interactions", customer: "All platform users", problem: "Slow application performance affecting user satisfaction", solution: "Comprehensive performance optimization and caching", bigPicture: "Enhance user experience and system efficiency through systematic performance improvements.", alternatives: "New Relic, Dynatrace, AppDynamics" }
        },
        { id: 15, title: "Integration Hub", type: "emergent", validation: "not-validated", priority: 15, teams: ["Core Platform", "Partner Engineering"], progress: 5,
            jira: { key: "INT-120", stories: 28, completed: 1, inProgress: 4, blocked: 23, velocity: 1 },
            canvas: { outcome: "Centralized integration platform", measures: "20+ integrations, 99% uptime", keyResult: "Launch 3 new strategic product capabilities", marketSize: "$5M integration market", customer: "Partners and enterprise clients", problem: "Fragmented integrations creating maintenance overhead", solution: "Unified integration hub with pre-built connectors", bigPicture: "Accelerate partner onboarding and reduce integration complexity through centralized platform.", alternatives: "MuleSoft, Zapier, Dell Boomi" }
        },
        { id: 16, title: "Data Lake v2", type: "strategic", validation: "validated", priority: 16, teams: ["Data Engineering", "Analytics"], progress: 60,
            jira: { key: "LAKE-200", stories: 35, completed: 21, inProgress: 9, blocked: 5, velocity: 12 },
            canvas: { outcome: "Scalable data storage and processing", measures: "Petabyte scale, 99.9% availability", keyResult: "Launch 3 new strategic product capabilities", marketSize: "All organizational data", customer: "Data teams and analysts", problem: "Limited data storage and processing capabilities constraining analytics", solution: "Cloud-native data lake with real-time processing", bigPicture: "Enable advanced analytics and AI through scalable, flexible data infrastructure supporting diverse data types.", alternatives: "AWS Data Lake, Azure Data Lake, Google Cloud Storage" }
        },
        { id: 17, title: "Workflow Automation", type: "ktlo", validation: "not-validated", priority: 17, teams: ["Business Operations", "Core Platform"], progress: 15,
            jira: { key: "FLOW-160", stories: 29, completed: 4, inProgress: 8, blocked: 17, velocity: 3 },
            canvas: { outcome: "Automated business process workflows", measures: "70% process automation, 60% time savings", keyResult: "Achieve 95% system uptime", marketSize: "All manual processes", customer: "Operations and administrative teams", problem: "Manual processes creating inefficiencies and errors", solution: "Intelligent workflow automation with approval chains", bigPicture: "Streamline operations and reduce manual work through intelligent process automation and workflow management.", alternatives: "Zapier, Microsoft Power Automate, UiPath" }
        },
        { id: 18, title: "Customer Portal v2", type: "strategic", validation: "in-validation", priority: 18, teams: ["Customer Support", "User Experience"], progress: 40,
            jira: { key: "PORTAL-220", stories: 32, completed: 13, inProgress: 10, blocked: 9, velocity: 7 },
            canvas: { outcome: "Self-service customer support portal", measures: "60% ticket deflection, 4+ satisfaction rating", keyResult: "Increase monthly active users by 40%", marketSize: "All customer support interactions", customer: "Customers seeking support", problem: "Limited self-service options increasing support load and customer wait times", solution: "Comprehensive portal with knowledge base, ticketing, and live chat", bigPicture: "Reduce support costs while improving customer satisfaction through comprehensive self-service capabilities.", alternatives: "Zendesk, Freshdesk, Salesforce Service Cloud" }
        },
        { id: 19, title: "Fraud Detection", type: "strategic", validation: "in-validation", priority: 19, teams: ["Security", "Machine Learning", "Risk Management"], progress: 40,
            jira: { key: "FRAUD-310", stories: 41, completed: 16, inProgress: 14, blocked: 11, velocity: 7 },
            canvas: { outcome: "Real-time fraud prevention", measures: "95% fraud detection, <1% false positives", keyResult: "Achieve 95% system uptime", marketSize: "$2M fraud exposure", customer: "All users and the business", problem: "Fraudulent activity causing financial and reputation damage", solution: "AI-powered fraud detection with real-time blocking", bigPicture: "Protect users and business from fraud through advanced machine learning detection and prevention.", alternatives: "Sift, Kount, Riskified" }
        },
        { id: 20, title: "Notification System", type: "ktlo", validation: "validated", priority: 20, teams: ["Core Platform", "Mobile Development"], progress: 50,
            jira: { key: "NOTIF-140", stories: 30, completed: 15, inProgress: 9, blocked: 6, velocity: 8 },
            canvas: { outcome: "Multi-channel notification platform", measures: "99% delivery rate, 30sec delivery time", keyResult: "Increase monthly active users by 40%", marketSize: "All user communications", customer: "All platform users", problem: "Unreliable notifications reducing user engagement", solution: "Robust multi-channel notification system", bigPicture: "Improve user engagement through reliable, timely, and personalized notifications across all channels.", alternatives: "SendGrid, Twilio, Firebase Cloud Messaging" }
        },
        { id: 21, title: "Document Management", type: "ktlo", validation: "not-validated", priority: 21, teams: ["Core Platform", "User Experience"], progress: 10,
            jira: { key: "DOC-180", stories: 35, completed: 4, inProgress: 8, blocked: 23, velocity: 2 },
            canvas: { outcome: "Centralized document storage and management", measures: "99.9% availability, 50% faster access", keyResult: "Launch 3 new strategic product capabilities", marketSize: "All business documents", customer: "All employees and external users", problem: "Fragmented document storage causing inefficiency", solution: "Unified document management with search and collaboration", bigPicture: "Streamline document workflows and improve collaboration through centralized, searchable document platform.", alternatives: "SharePoint, Google Drive, Box" }
        },
        { id: 23, title: "Audit Trail System", type: "ktlo", validation: "in-validation", priority: 22, teams: ["Security"], progress: 30,
            jira: { key: "AUDIT-200", stories: 27, completed: 8, inProgress: 9, blocked: 10, velocity: 6 },
            canvas: { outcome: "Comprehensive activity logging and audit trails", measures: "100% activity capture, 5yr retention", keyResult: "Achieve 95% system uptime", marketSize: "All system activities", customer: "Compliance and security teams", problem: "Incomplete audit trails creating compliance gaps", solution: "Comprehensive audit logging with tamper-proof storage", bigPicture: "Ensure regulatory compliance and security through complete, immutable audit trail of all system activities.", alternatives: "Splunk, Elastic Security, Sumo Logic" }
        },
        { id: 24, title: "Onboarding Flow v3", type: "strategic", validation: "not-validated", priority: 23, teams: ["User Experience", "Product Management", "Analytics"], progress: 20,
            jira: { key: "ONBOARD-150", stories: 32, completed: 6, inProgress: 10, blocked: 16, velocity: 4 },
            canvas: { outcome: "Streamlined user onboarding experience", measures: "80% completion rate, 40% faster onboarding", keyResult: "Increase monthly active users by 40%", marketSize: "All new users", customer: "New platform users", problem: "Complex onboarding causing high abandonment rates", solution: "Simplified, guided onboarding with progressive disclosure", bigPicture: "Maximize user activation and time-to-value through intuitive, personalized onboarding experience.", alternatives: "Appcues, WalkMe, Pendo" }
        },
        { id: 25, title: "Pricing Engine v2", type: "strategic", validation: "validated", priority: 24, teams: ["Actuarial", "Machine Learning"], progress: 65,
            jira: { key: "PRICE-260", stories: 38, completed: 25, inProgress: 8, blocked: 5, velocity: 12 },
            canvas: { outcome: "Dynamic, AI-powered pricing optimization", measures: "15% revenue increase, 90% pricing accuracy", keyResult: "Launch 3 new strategic product capabilities", marketSize: "$20M pricing impact", customer: "Sales and actuarial teams", problem: "Static pricing reducing competitiveness and margins", solution: "Machine learning-based dynamic pricing engine", bigPicture: "Optimize revenue and competitiveness through intelligent, data-driven pricing strategies.", alternatives: "Pricefx, Zilliant, PROS" }
        },
        { id: 26, title: "Supply Chain Integration", type: "emergent", validation: "not-validated", priority: 25, teams: ["Business Operations", "Partner Engineering"], progress: 5,
            jira: { key: "SUPPLY-130", stories: 26, completed: 1, inProgress: 5, blocked: 20, velocity: 1 },
            canvas: { outcome: "Real-time supply chain visibility", measures: "End-to-end tracking, 95% on-time delivery", keyResult: "Launch 3 new strategic product capabilities", marketSize: "$10M supply chain efficiency", customer: "Operations and logistics teams", problem: "Limited supply chain visibility causing delays and inefficiencies", solution: "Integrated supply chain platform with real-time tracking", bigPicture: "Optimize supply chain operations through real-time visibility and predictive logistics management.", alternatives: "Oracle SCM, SAP Ariba, Manhattan Associates" }
        },
        { id: 27, title: "Quality Assurance", type: "ktlo", validation: "validated", priority: 26, teams: ["Core Platform", "Site Reliability"], progress: 45,
            jira: { key: "QA-190", stories: 31, completed: 14, inProgress: 10, blocked: 7, velocity: 8 },
            canvas: { outcome: "Automated testing and quality gates", measures: "95% test coverage, 30% faster releases", keyResult: "Achieve 95% system uptime", marketSize: "All software releases", customer: "Development and QA teams", problem: "Manual testing causing delays and quality issues", solution: "Comprehensive automated testing with quality gates", bigPicture: "Improve software quality and development velocity through automated testing and quality assurance processes.", alternatives: "Selenium, TestRail, Katalon" }
        },
        { id: 28, title: "Compliance Automation", type: "ktlo", validation: "not-validated", priority: 27, teams: ["Compliance", "Security"], progress: 20,
            jira: { key: "COMP-210", stories: 24, completed: 5, inProgress: 7, blocked: 12, velocity: 4 },
            canvas: { outcome: "Automated compliance monitoring and reporting", measures: "100% compliance coverage, automated reporting", keyResult: "Achieve 95% system uptime", marketSize: "All regulatory requirements", customer: "Compliance and audit teams", problem: "Manual compliance processes creating risk and inefficiency", solution: "Automated compliance monitoring with real-time reporting", bigPicture: "Reduce compliance risk and overhead through automated monitoring, reporting, and audit trail management.", alternatives: "MetricStream, GRC platforms, ServiceNow GRC" }
        },
        { id: 29, title: "Real-time Dashboard", type: "strategic", validation: "not-validated", priority: 28, teams: ["Analytics", "User Experience", "Data Engineering"], progress: 5,
            jira: { key: "DASH-170", stories: 40, completed: 2, inProgress: 6, blocked: 32, velocity: 1 },
            canvas: { outcome: "Live operational dashboard for executives", measures: "Real-time data updates, 90% executive adoption", keyResult: "Launch 3 new strategic product capabilities", marketSize: "Executive decision making", customer: "Executives and senior leadership", problem: "Delayed insights hindering strategic decision making", solution: "Real-time executive dashboard with key metrics", bigPicture: "Enable data-driven leadership decisions through instant access to critical business metrics and trends.", alternatives: "Tableau, Power BI, Grafana" }
        },
        { id: 22, title: "Claims Processing v2", type: "strategic", validation: "validated", priority: 29, teams: ["Claims Operations", "Customer Support"], progress: 45,
            jira: { key: "CLAIMS-320", stories: 46, completed: 21, inProgress: 13, blocked: 12, velocity: 9 },
            canvas: { outcome: "Automated claims processing workflow", measures: "70% auto-approval, 24hr processing time", keyResult: "Launch 3 new strategic product capabilities", marketSize: "All insurance claims", customer: "Claimants and claims adjusters", problem: "Manual claims processing causing delays and errors", solution: "AI-powered claims automation with fraud detection", bigPicture: "Transform claims experience through intelligent automation reducing processing time and improving accuracy.", alternatives: "Guidewire ClaimCenter, Duck Creek Claims, FINEOS" }
        },
        { id: 31, title: "API v3 Gateway", type: "strategic", validation: "not-validated", priority: 30, teams: ["Core Platform", "Developer Relations", "Security"], progress: 10,
            jira: { key: "APIV3-250", stories: 37, completed: 4, inProgress: 9, blocked: 24, velocity: 2 },
            canvas: { outcome: "Next-generation API platform", measures: "99.99% uptime, 100ms latency, 1000+ developers", keyResult: "Launch 3 new strategic product capabilities", marketSize: "$100M API economy", customer: "Internal and external developers", problem: "Current API platform limiting innovation and partnerships", solution: "Modern API gateway with GraphQL and real-time capabilities", bigPicture: "Enable ecosystem growth and innovation through world-class API platform supporting modern development patterns.", alternatives: "Kong Gateway, AWS API Gateway, Apigee" }
        },
        { id: 30, title: "Disaster Recovery", type: "ktlo", validation: "validated", priority: 31, teams: ["Site Reliability"], progress: 40,
            jira: { key: "DR-180", stories: 22, completed: 9, inProgress: 7, blocked: 6, velocity: 8 },
            canvas: { outcome: "Comprehensive disaster recovery plan", measures: "RTO 2hrs, RPO 30min, 99.9% failover success", keyResult: "Achieve 95% system uptime", marketSize: "Business continuity", customer: "All stakeholders and customers", problem: "Inadequate disaster recovery creating business risk", solution: "Multi-region disaster recovery with automated failover", bigPicture: "Ensure business continuity and customer trust through robust disaster recovery and high availability architecture.", alternatives: "AWS Disaster Recovery, Azure Site Recovery, Zerto" }
        }
    ],

    bullpen: [
        { id: 32, title: "Blockchain Integration", type: "strategic", validation: "not-validated", priority: "bullpen", teams: ["Core Platform", "Security"], progress: 0,
        jira: { key: "BLOCK-400", stories: 35, completed: 0, inProgress: 2, blocked: 33, velocity: 0 },
        canvas: { outcome: "Distributed ledger capabilities", measures: "Smart contract deployment, immutable records", keyResult: "Launch 3 new strategic product capabilities", marketSize: "$500M blockchain opportunity", customer: "Enterprise clients seeking blockchain solutions", problem: "No blockchain capabilities limiting market opportunities in decentralized finance", solution: "Ethereum-compatible blockchain integration with smart contracts", bigPicture: "Enter the decentralized finance market by providing blockchain-based solutions and smart contract capabilities.", alternatives: "Hyperledger, R3 Corda, ConsenSys" }
        },
        { id: 33, title: "Voice AI Assistant", type: "strategic", validation: "in-validation", priority: "bullpen", teams: ["Machine Learning", "User Experience"], progress: 0,
        jira: { key: "VOICE-500", stories: 28, completed: 0, inProgress: 1, blocked: 27, velocity: 0 },
        canvas: { outcome: "Natural language customer service interface", measures: "95% intent accuracy, multi-language support", keyResult: "Increase monthly active users by 40%", marketSize: "Voice interface market", customer: "Customers preferring voice interactions", problem: "No voice interface limiting accessibility and user convenience", solution: "AI-powered voice assistant with natural language processing", bigPicture: "Improve accessibility and user experience through intelligent voice-activated customer service and platform navigation.", alternatives: "Amazon Alexa Skills, Google Assistant Actions, Microsoft Bot Framework" }
        },
        { id: 34, title: "AR/VR Experience", type: "strategic", validation: "not-validated", priority: "bullpen", teams: ["User Experience", "Mobile Development"], progress: 0,
        jira: { key: "AR-700", stories: 40, completed: 0, inProgress: 0, blocked: 40, velocity: 0 },
        canvas: { outcome: "Immersive augmented and virtual reality features", measures: "AR product visualization, VR training modules", keyResult: "Increase monthly active users by 40%", marketSize: "AR/VR adoption curve", customer: "Tech-forward users and enterprise training", problem: "Limited immersive experiences reducing engagement with younger demographics", solution: "AR product visualization and VR training environments", bigPicture: "Pioneer immersive experiences to engage next-generation users and provide innovative training solutions.", alternatives: "Unity, Unreal Engine, ARKit/ARCore" }
        },
        { id: 35, title: "Quantum Computing Research", type: "ktlo", validation: "not-validated", priority: "bullpen", teams: ["Machine Learning", "Security"], progress: 0,
        jira: { key: "QUANTUM-800", stories: 50, completed: 0, inProgress: 0, blocked: 50, velocity: 0 },
        canvas: { outcome: "Quantum-resistant security and computational advantages", measures: "Post-quantum cryptography, optimization algorithms", keyResult: "Launch 3 new strategic product capabilities", marketSize: "Future quantum advantage", customer: "Forward-thinking enterprise clients", problem: "Future quantum threats to current encryption and need for computational advantages", solution: "Quantum-resistant cryptography and quantum optimization algorithms", bigPicture: "Prepare for quantum computing era through post-quantum security and computational research initiatives.", alternatives: "IBM Quantum, Google Quantum AI, Microsoft Azure Quantum" }
        },
        { id: 36, title: "Social Impact Platform", type: "strategic", validation: "validated", priority: "bullpen", teams: ["Product Management", "User Experience"], progress: 0,
        jira: { key: "IMPACT-900", stories: 22, completed: 0, inProgress: 1, blocked: 21, velocity: 0 },
        canvas: { outcome: "Corporate social responsibility and community engagement", measures: "Community participation rates, ESG scoring", keyResult: "Launch 3 new strategic product capabilities", marketSize: "ESG investment focus", customer: "Socially conscious users and investors", problem: "Limited social impact visibility affecting brand perception and ESG ratings", solution: "Platform for tracking and showcasing social impact initiatives", bigPicture: "Strengthen brand reputation and ESG credentials through transparent social impact tracking and community engagement.", alternatives: "Salesforce Nonprofit Cloud, Microsoft Nonprofit Solutions, Benevity" }
        },
        { id: 37, title: "IoT Device Management", type: "emergent", validation: "in-validation", priority: "bullpen", teams: ["Core Platform", "Security", "Partner Engineering"], progress: 0,
        jira: { key: "IOT-600", stories: 30, completed: 0, inProgress: 1, blocked: 29, velocity: 0 },
        canvas: { outcome: "Connected device ecosystem management", measures: "1000+ device connections, 99.5% uptime", keyResult: "Launch 3 new strategic product capabilities", marketSize: "$2B IoT insurance market", customer: "Enterprise clients with IoT devices", problem: "No IoT integration limiting smart device market opportunities", solution: "IoT device management platform with real-time monitoring", bigPicture: "Enter the IoT insurance market by providing comprehensive device management and risk assessment capabilities.", alternatives: "AWS IoT Core, Azure IoT Hub, Google Cloud IoT" }
        }
    ],

    recentlyCompleted: [
        { id: 101, title: "Legacy System Migration", type: "ktlo", validation: "validated", completedDate: "2025-08-01", teams: ["Migration Team", "Data Engineering"], progress: 100,
        jira: { key: "LEG-500", stories: 85, completed: 85, inProgress: 0, blocked: 0, velocity: 15 },
        canvas: { outcome: "Modernized core infrastructure", measures: "Zero downtime migration, 40% performance improvement", keyResult: "Achieve 95% system uptime", marketSize: "All platform operations", customer: "Internal operations team", problem: "Legacy systems causing performance bottlenecks and maintenance issues", solution: "Complete migration to cloud-native architecture", bigPicture: "Modernize infrastructure foundation to enable future growth and improved system reliability.", alternatives: "AWS Migration Hub, Azure Migrate, Google Cloud Migrate" }
        },
        { id: 102, title: "User Authentication v2", type: "strategic", validation: "validated", completedDate: "2025-07-28", teams: ["Security", "User Experience"], progress: 100,
        jira: { key: "AUTH-320", stories: 42, completed: 42, inProgress: 0, blocked: 0, velocity: 18 },
        canvas: { outcome: "Enhanced security with seamless user experience", measures: "99.9% authentication success, 2-factor adoption 80%", keyResult: "Achieve 95% system uptime", marketSize: "All platform users", customer: "All users requiring secure access", problem: "Outdated authentication system with poor user experience", solution: "Modern multi-factor authentication with SSO capabilities", bigPicture: "Provide enterprise-grade security while maintaining user-friendly authentication experience.", alternatives: "Auth0, Okta, Firebase Auth" }
        }
    ],

    teams: {
       // data.js - Board Data with Updated Team Health Dimensions
        "Core Platform": { 
            capacity: "Healthy",      // Green - should work already
            skillset: "At Risk",      // Red - should work already  
        vision: "Critical",       // Dark red with "!" - NEW
        support: null,            // Grey with "?" - NEW
        teamwork: "Healthy",      // Green
        autonomy: "Not Set",      // Grey with "?" - NEW
            jira: { sprint: "Sprint 23", velocity: 24, utilization: 92, stories: 35, bugs: 3, blockers: 1 } 
        },
        
        "User Experience": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "at-risk", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 18, utilization: 85, stories: 28, bugs: 4, blockers: 2 } 
        },
        
        "Security": { 
            capacity: "at-risk", 
            skillset: "at-risk", 
            vision: "healthy", 
            support: "healthy", 
            teamwork: "at-risk", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 20, utilization: 88, stories: 32, bugs: 2, blockers: 3 } 
        },
        
        "Data Engineering": { 
            capacity: "at-risk", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "at-risk", 
            teamwork: "healthy", 
            autonomy: "at-risk", 
            jira: { sprint: "Sprint 23", velocity: 32, utilization: 98, stories: 25, bugs: 5, blockers: 2 } 
        },
        
        "Analytics": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 15, utilization: 85, stories: 18, bugs: 2, blockers: 1 } 
        },
        
        "Site Reliability": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "at-risk", 
            support: "healthy", 
            teamwork: "at-risk", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 12, utilization: 90, stories: 22, bugs: 7, blockers: 4 } 
        },
        
        "Product Management": { 
            capacity: "healthy", 
            skillset: "at-risk", 
            vision: "at-risk", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "at-risk", 
            jira: { sprint: "Sprint 23", velocity: 8, utilization: 85, stories: 30, bugs: 6, blockers: 3 } 
        },
        
        "Customer Support": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 13, utilization: 87, stories: 15, bugs: 1, blockers: 0 } 
        },
        
        "Business Operations": { 
            capacity: "at-risk", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "at-risk", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 16, utilization: 94, stories: 20, bugs: 3, blockers: 2 } 
        },
        
        "Developer Relations": { 
            capacity: "at-risk", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "healthy", 
            teamwork: "at-risk", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 10, utilization: 89, stories: 24, bugs: 4, blockers: 3 } 
        },
        
        "Partner Engineering": { 
            capacity: "healthy", 
            skillset: "at-risk", 
            vision: "at-risk", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "at-risk", 
            jira: { sprint: "Sprint 23", velocity: 14, utilization: 86, stories: 28, bugs: 2, blockers: 1 } 
        },
        
        "Mobile Development": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "at-risk", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 11, utilization: 83, stories: 22, bugs: 5, blockers: 2 } 
        },
        
        "Machine Learning": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "at-risk", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "at-risk", 
            jira: { sprint: "Sprint 23", velocity: 19, utilization: 91, stories: 26, bugs: 3, blockers: 4 } 
        },
        
        "Claims Operations": { 
            capacity: "at-risk", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "healthy", 
            teamwork: "at-risk", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 17, utilization: 95, stories: 31, bugs: 6, blockers: 3 } 
        },
        
        "Risk Management": { 
            capacity: "healthy", 
            skillset: "at-risk", 
            vision: "healthy", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 9, utilization: 82, stories: 19, bugs: 2, blockers: 1 } 
        },
        
        "Actuarial": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "at-risk", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 7, utilization: 78, stories: 16, bugs: 1, blockers: 0 } 
        },
        
        "Compliance": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "at-risk", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "at-risk", 
            jira: { sprint: "Sprint 23", velocity: 6, utilization: 75, stories: 14, bugs: 2, blockers: 1 } 
        },
        
        "Migration Team": { 
            capacity: "healthy", 
            skillset: "healthy", 
            vision: "healthy", 
            support: "healthy", 
            teamwork: "healthy", 
            autonomy: "healthy", 
            jira: { sprint: "Sprint 23", velocity: 15, utilization: 88, stories: 25, bugs: 1, blockers: 0 } 
        }
    }
};