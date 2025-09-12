const boardData = {
    teams: {
        "Core Platform": {
            capacity: "Healthy",
            skillset: "Critical",
            vision: "Healthy", 
            support: "Healthy", 
            teamwork: "At Risk",
            autonomy: "Healthy",
            jira: { 
                sprint: "Sprint 23", 
                velocity: 12, 
                utilization: 87, 
                stories: 28, 
                bugs: 4, 
                blockers: 2 
            }
        },

        "Data & Analytics": {
            capacity: "At Risk",
            skillset: "Healthy",
            vision: "Critical",
            support: "Healthy",
            teamwork: "Healthy",
            autonomy: "Critical",
            jira: {
                sprint: "Sprint 23",
                velocity: 8,
                utilization: 92,
                stories: 22,
                bugs: 7,
                blockers: 1
            }
        },

        "Mobile Experience": {
            capacity: "Critical",
            skillset: "Healthy",
            vision: "Healthy",
            support: "At Risk",
            teamwork: "Healthy",
            autonomy: "Healthy",
            jira: {
                sprint: "Sprint 23",
                velocity: 15,
                utilization: 78,
                stories: 31,
                bugs: 3,
                blockers: 0
            }
        },

        "Platform Infrastructure": {
            capacity: "Healthy",
            skillset: "Critical",
            vision: "Healthy",
            support: "Healthy",
            teamwork: "At Risk",
            autonomy: "Critical",
            jira: {
                sprint: "Sprint 23",
                velocity: 10,
                utilization: 95,
                stories: 18,
                bugs: 8,
                blockers: 3
            }
        },

        "Security & Compliance": {
            capacity: "At Risk",
            skillset: "Healthy",
            vision: "Healthy",
            support: "Critical",
            teamwork: "Healthy", 
            autonomy: "Healthy",
            jira: {
                sprint: "Sprint 23",
                velocity: 13,
                utilization: 83,
                stories: 25,
                bugs: 2,
                blockers: 1
            }
        },

        "Customer Success": {
            capacity: "Healthy",
            skillset: "Healthy",
            vision: "At Risk",
            support: "Healthy",
            teamwork: "Critical",
            autonomy: "Healthy",
            jira: {
                sprint: "Sprint 23", 
                velocity: 11,
                utilization: 88,
                stories: 20,
                bugs: 5,
                blockers: 2
            }
        },

        "Product Design": {
            capacity: "Critical",
            skillset: "At Risk",
            vision: "Healthy",
            support: "Healthy",
            teamwork: "Healthy",
            autonomy: "Critical",
            jira: {
                sprint: "Sprint 23",
                velocity: 14,
                utilization: 91,
                stories: 27,
                bugs: 1,
                blockers: 0
            }
        },

        "API & Integrations": {
            capacity: "Healthy",
            skillset: "Healthy", 
            vision: "Critical",
            support: "At Risk",
            teamwork: "Healthy",
            autonomy: "Healthy",
            jira: {
                sprint: "Sprint 23",
                velocity: 9,
                utilization: 86,
                stories: 16,
                bugs: 6,
                blockers: 1
            }
        },

        "QA & Testing": {
            capacity: "At Risk",
            skillset: "Critical",
            vision: "Healthy",
            support: "Healthy",
            teamwork: "At Risk",
            autonomy: "Healthy",
            jira: {
                sprint: "Sprint 23",
                velocity: 7,
                utilization: 94,
                stories: 14,
                bugs: 9,
                blockers: 2
            }
        },

        "DevOps & Release": {
            capacity: "Critical",
            skillset: "Healthy",
            vision: "At Risk",
            support: "Critical",
            teamwork: "Critical",
            autonomy: "At Risk",
            jira: {
                sprint: "Sprint 23",
                velocity: 6,
                utilization: 97,
                stories: 12,
                bugs: 11,
                blockers: 4
            }
        },

        "User Experience": {
            capacity: "Healthy",
            skillset: "At Risk",
            vision: "Healthy",
            support: "Healthy",
            teamwork: "Healthy",
            autonomy: "Critical",
            jira: {
                sprint: "Sprint 23",
                velocity: 16,
                utilization: 81,
                stories: 29,
                bugs: 2,
                blockers: 1
            }
        },

        "Business Intelligence": {
            capacity: "At Risk",
            skillset: "Healthy",
            vision: "Critical",
            support: "At Risk",
            teamwork: "Healthy",
            autonomy: "Healthy",
            jira: {
                sprint: "Sprint 23",
                velocity: 9,
                utilization: 89,
                stories: 19,
                bugs: 4,
                blockers: 2
            }
        }
    },

    okrs: {
        current: [
            {
                title: "Increase team velocity by 17%",
                progress: 68,
                type: "KR1"
            },
            {
                title: "Increase deploy by 32 pts",
                progress: 43,
                type: "KR2"
            },
            {
                title: "Decrease returns by 7pt per month",
                progress: 82,
                type: "KR3"
            }
        ]
    },

    initiatives: {
        "A1": {
            title: "Customer Data Platform",
            teams: ["Core Platform", "Data & Analytics"],
            priority: 1,
            status: "validated",
            type: "strategic"
        },
        "A2": {
            title: "Mobile App Redesign", 
            teams: ["Mobile Experience", "User Experience"],
            priority: 2,
            status: "in-validation",
            type: "strategic"
        },
        "B1": {
            title: "API Gateway Migration",
            teams: ["Platform Infrastructure", "API & Integrations"],
            priority: 3,
            status: "validated",
            type: "strategic"
        },
        "B2": {
            title: "Security Compliance Update",
            teams: ["Security & Compliance", "DevOps & Release"],
            priority: 4,
            status: "not-validated",
            type: "strategic"
        },
        "C1": {
            title: "Customer Success Dashboard",
            teams: ["Customer Success", "Business Intelligence"],
            priority: 5,
            status: "validated",
            type: "strategic"
        },
        "C2": {
            title: "Design System v2",
            teams: ["Product Design", "User Experience"],
            priority: 6,
            status: "in-validation",
            type: "strategic"
        },
        "D1": {
            title: "Testing Automation",
            teams: ["QA & Testing", "DevOps & Release"],
            priority: 7,
            status: "not-validated",
            type: "ktlo"
        },
        "D2": {
            title: "Performance Monitoring",
            teams: ["Platform Infrastructure", "DevOps & Release"],
            priority: 8,
            status: "validated",
            type: "ktlo"
        },
        "E1": {
            title: "Database Optimization",
            teams: ["Data & Analytics", "Platform Infrastructure"],
            priority: 9,
            status: "in-validation",
            type: "ktlo"
        },
        "E2": {
            title: "Mobile App Performance",
            teams: ["Mobile Experience", "QA & Testing"],
            priority: 10,
            status: "not-validated",
            type: "ktlo"
        },
        "F1": {
            title: "Customer Onboarding Flow",
            teams: ["Customer Success", "User Experience"],
            priority: 11,
            status: "validated",
            type: "strategic"
        },
        "F2": {
            title: "Analytics Dashboard v3",
            teams: ["Business Intelligence", "Data & Analytics"],
            priority: 12,
            status: "in-validation",
            type: "strategic"
        },
        "G1": {
            title: "Security Audit Remediation",
            teams: ["Security & Compliance", "Platform Infrastructure"],
            priority: 13,
            status: "not-validated",
            type: "emergent"
        },
        "G2": {
            title: "API Rate Limiting",
            teams: ["API & Integrations", "Platform Infrastructure"],
            priority: 14,
            status: "validated",
            type: "ktlo"
        },
        "H1": {
            title: "Design Token System",
            teams: ["Product Design", "Core Platform"],
            priority: 15,
            status: "in-validation",
            type: "strategic"
        }
    }
};