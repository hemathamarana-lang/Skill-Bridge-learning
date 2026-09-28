import { StudentSkill } from '../types';

export interface StudentPreset {
  id: string;
  name: string;
  avatarRole: string;
  backgroundDescription: string;
  hoursAvailable: number;
  skills: Record<string, number>; // skillName -> currentLevel (0-5)
  narrativeText: string;
}

export const STUDENT_PRESETS: StudentPreset[] = [
  {
    id: 'cs-sophomore',
    name: 'CS Sophomore (Alex Rivera)',
    avatarRole: 'University Student',
    backgroundDescription: 'Completed CS1 & CS2. Strong in core Java & basic Python, but lacks production frameworks, databases, and deployment.',
    hoursAvailable: 12,
    skills: {
      'TypeScript & JavaScript': 2,
      'Data Structures & Algorithms': 3,
      'Git & Collaborative Workflow': 2,
      'Linux Administration & Shell Scripting': 2,
      'React & Modern Frontend': 1,
      'Backend API Development (Node/Express/Python)': 1,
      'Relational Databases & SQL (PostgreSQL)': 1,
      'Docker & Containerization': 0,
      'Web Security Fundamentals': 1,
      'Automated Testing (Unit & Integration)': 1,
      'Cloud Deployment (AWS/GCP/Vercel)': 0,
      'Technical Communication & PR Writing': 3,
      'Python (NumPy, Pandas, Scipy)': 2,
      'Advanced SQL & Data Modeling': 1,
      'Probability & Applied Statistics': 3,
      'Machine Learning (Scikit-Learn)': 1,
    },
    narrativeText: `Currently a 2nd year Computer Science student. Took Intro to Programming (Python) and Data Structures & Object-Oriented Programming in Java. Completed assignments on binary search trees, hash tables, and sorting algorithms. Used Git for university lab submissions. Made a simple command-line banking system and a terminal tic-tac-toe game. Looking for a summer internship in software engineering or backend development. Have not worked with Docker, Cloud, or full-stack production databases yet.`,
  },
  {
    id: 'self-taught-web',
    name: 'Self-Taught Front-End (Maya Lin)',
    avatarRole: 'Career Switcher',
    backgroundDescription: 'Learned HTML/CSS/JavaScript and built responsive frontend React apps. Needs backend architecture, SQL databases, and data structures.',
    hoursAvailable: 15,
    skills: {
      'TypeScript & JavaScript': 3,
      'React & Modern Frontend': 3,
      'Git & Collaborative Workflow': 3,
      'Frontend Fundamentals (HTML / CSS / Tailwind)': 4,
      'Figma Mastery & Prototyping': 2,
      'Backend API Development (Node/Express/Python)': 2,
      'Relational Databases & SQL (PostgreSQL)': 1,
      'Data Structures & Algorithms': 1,
      'Docker & Containerization': 1,
      'Web Security Fundamentals': 2,
      'Automated Testing (Unit & Integration)': 1,
      'Cloud Deployment (AWS/GCP/Vercel)': 2,
      'Technical Communication & PR Writing': 3,
    },
    narrativeText: `Career switcher with a marketing background. Spent the last 8 months self-studying through online courses. Built several responsive React portfolio projects including an e-commerce product catalog with shopping cart state and a weather forecast dashboard calling third-party REST APIs. Comfortable with Tailwind CSS, Flexbox, Grid, and deploying to Vercel. Now realizing most full-stack job listings demand relational SQL databases, backend API architecture, and technical interview algorithms.`,
  },
  {
    id: 'data-analyst-switcher',
    name: 'Business Analyst to Data Science (Jordan Chen)',
    avatarRole: 'Aspiring Data Scientist',
    backgroundDescription: 'Strong in SQL, Excel, and business reporting. Learning Python, statistical machine learning models, and predictive analytics.',
    hoursAvailable: 10,
    skills: {
      'Advanced SQL & Data Modeling': 4,
      'Probability & Applied Statistics': 3,
      'Data Visualization & Storytelling': 4,
      'Business Acumen & Stakeholder Translation': 4,
      'Python (NumPy, Pandas, Scipy)': 2,
      'Machine Learning (Scikit-Learn)': 1,
      'Deep Learning & Neural Networks': 0,
      'Git & Reproducible Research': 1,
      'Linux Administration & Shell Scripting': 1,
      'Technical Literacy & Architecture Comprehension': 2,
    },
    narrativeText: `Working as a junior business analyst for 18 months. Daily work revolves around writing complex SQL queries with CTEs, window functions, and building executive dashboards in Tableau and Excel. Recently started learning Python through automated scripts and completed introductory Pandas tutorials. Wants to transition into a full Data Scientist or ML Specialist role, but needs hands-on machine learning, scikit-learn, statistical hypothesis testing, and Git version control for code reproducibility.`,
  },
];
