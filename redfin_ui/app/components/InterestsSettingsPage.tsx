// InterestsSettingsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

// Props for the user interest settings page
interface InterestsSettingsPageProps {
  onBack: () => void;
  user: any;
  onUpdateInterests?: (interests: string[]) => void;
}

// API base URL (Spring Boot backend)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Interest data definitions
const JOB_INTERESTS = [
  { id: "developer", label: "Developer", value: "Developer" },
  { id: "planner", label: "Planner", value: "Planner" },
  { id: "student", label: "Student", value: "Student" },
  { id: "researcher", label: "Researcher/Professor", value: "Researcher/Professor" },
  { id: "policy", label: "Policy Maker", value: "Policy Maker" },
  { id: "general", label: "General Public", value: "General Public" },
];

const AI_COMPANIES = [
  { id: "openai", label: "OPENAI", value: "OPENAI" },
  { id: "xai", label: "xAI", value: "xAI" },
  { id: "google", label: "GOOGLE", value: "GOOGLE" },
  { id: "microsoft", label: "MICROSOFT", value: "MICROSOFT" },
  { id: "meta", label: "META", value: "META" },
  { id: "amazon", label: "AMAZON", value: "AMAZON" },
];

const AI_FIELDS = [
  { id: "deep", label: "Deep Learning", value: "Deep Learning" },
  { id: "ml", label: "Machine Learning", value: "Machine Learning" },
  { id: "llm", label: "LLM", value: "LLM" },
  { id: "finetune", label: "Fine-tuning", value: "Fine-tuning" },
  { id: "data", label: "Data Analysis", value: "Data Analysis" },
  { id: "nlp", label: "Natural Language Processing", value: "Natural Language Processing" },
  { id: "cv", label: "Computer Vision", value: "Computer Vision" },
  { id: "rec", label: "Recommendation System", value: "Recommendation System" },
  { id: "genai", label: "Generative AI", value: "Generative AI" },
  { id: "rl", label: "Reinforcement Learning", value: "Reinforcement Learning" },
];

export function InterestsSettingsPage({ onBack, user, onUpdateInterests }: InterestsSettingsPageProps) {
  const [selectedInterest, setSelectedInterest] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    console.log('Selected interests updated:', {
      interest: selectedInterest,
      company: selectedCompany,
      field: selectedField
    });
  }, [selectedInterest, selectedCompany, selectedField]);

  const getUserId = (userObj: any): string | number | null => {
    if (!userObj) return null;
    const priorityFields = ['memberId', 'id', 'userId', 'MEMBER_ID', 'ID'];
    for (const field of priorityFields) {
      if (userObj[field] && (typeof userObj[field] === 'string' || typeof userObj[field] === 'number')) {
        return userObj[field];
      }
    }
    return null;
  };

  const getHeaders = () => {
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
    };
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const validateUserSession = () => {
    if (!user) {
      showMessage("Login required. Please log in again.", "error");
      return false;
    }
    const userId = getUserId(user);
    if (!userId) {
      showMessage("There is a problem with your user information. Please log in again.", "error");
      return false;
    }
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('authToken');
    if (!authToken) {
      showMessage("Authentication has expired. Please log in again.", "error");
      return false;
    }
    return true;
  };

  const loadExistingInterests = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const userId = getUserId(user);
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userIdParam = `?memberId=${userId}`;
      const [jobResponse, companyResponse, fieldResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/job-interest${userIdParam}`, { method: 'GET', headers: getHeaders(), credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/ai-company${userIdParam}`, { method: 'GET', headers: getHeaders(), credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/ai-field${userIdParam}`, { method: 'GET', headers: getHeaders(), credentials: 'include' })
      ]);

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        if (jobData && jobData.interest) setSelectedInterest(jobData.interest);
      }
      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        if (companyData && companyData.aiCompany) setSelectedCompany(companyData.aiCompany);
      }
      if (fieldResponse.ok) {
        const fieldData = await fieldResponse.json();
        if (fieldData && fieldData.aiField) setSelectedField(fieldData.aiField);
      }
    } catch (error) {
      console.error("Error loading existing interests:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showMessage("Could not connect to the server. Please check your network connection.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadExistingInterests();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!(selectedInterest && selectedCompany && selectedField)) {
      showMessage("Please select an option for all categories.", "error");
      return;
    }
    if (!validateUserSession()) return;

    const userId = getUserId(user);
    if (!userId) return;

    setIsSubmitting(true);
    try {
      const responses = await Promise.all([
        fetch(`${API_BASE_URL}/api/job-interest`, { method: 'POST', headers: getHeaders(), credentials: 'include', body: JSON.stringify({ interest: selectedInterest, memberId: userId.toString() }) }),
        fetch(`${API_BASE_URL}/api/ai-company`, { method: 'POST', headers: getHeaders(), credentials: 'include', body: JSON.stringify({ aiCompany: selectedCompany, memberId: userId.toString() }) }),
        fetch(`${API_BASE_URL}/api/ai-field`, { method: 'POST', headers: getHeaders(), credentials: 'include', body: JSON.stringify({ aiField: selectedField, memberId: userId.toString() }) })
      ]);

      if (responses.every(res => res.ok)) {
        if (onUpdateInterests) {
          onUpdateInterests([selectedInterest, selectedCompany, selectedField]);
        }
        showMessage("Your selections have been successfully saved!", "success");
      } else {
        throw new Error("One or more API calls failed.");
      }
    } catch (error) {
      console.error("Save error:", error);
      showMessage("An error occurred while saving. Please check your network connection and try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your interest settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Logged-in User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium text-blue-700 mr-2">MEMBER_ID:</span><span className="text-blue-900 font-mono bg-blue-100 px-2 py-1 rounded">{getUserId(user) || 'Not found'}</span></div>
            <div><span className="font-medium text-blue-700 mr-2">Email:</span><span className="text-blue-900">{user?.email || 'No email'}</span></div>
            <div><span className="font-medium text-blue-700 mr-2">Name:</span><span className="text-blue-900">{user?.name || user?.username || 'No name'}</span></div>
            <div><span className="font-medium text-blue-700 mr-2">Status:</span><span className="text-green-600 font-medium">✓ Logged in</span></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Select Your Job</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {JOB_INTERESTS.map((job) => (
            <div key={job.id} onClick={() => setSelectedInterest(job.value)} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedInterest === job.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}>
              <input type="radio" id={job.id} name="job" value={job.value} checked={selectedInterest === job.value} onChange={() => setSelectedInterest(job.value)} className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
              <label htmlFor={job.id} className="cursor-pointer font-medium text-base">{job.label}</label>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 mt-10">Select AI Companies of Interest</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {AI_COMPANIES.map((company) => (
            <div key={company.id} onClick={() => setSelectedCompany(company.value)} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedCompany === company.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}>
              <input type="radio" id={company.id} name="company" value={company.value} checked={selectedCompany === company.value} onChange={() => setSelectedCompany(company.value)} className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
              <label htmlFor={company.id} className="cursor-pointer font-medium text-base">{company.label}</label>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 mt-10">Select Fields of Interest</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {AI_FIELDS.map((field) => (
            <div key={field.id} onClick={() => setSelectedField(field.value)} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedField === field.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}>
              <input type="radio" id={field.id} name="field" value={field.value} checked={selectedField === field.value} onChange={() => setSelectedField(field.value)} className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
              <label htmlFor={field.id} className="cursor-pointer font-medium text-base">{field.label}</label>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={!selectedInterest || !selectedCompany || !selectedField || isSubmitting} className={`flex-1 py-3 text-base font-bold rounded-lg transition-colors ${(!selectedInterest || !selectedCompany || !selectedField) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isSubmitting ? 'Saving...' : 'Save to Database'}
          </Button>
          <Button onClick={onBack} className="flex-1 py-3 text-base font-bold bg-gray-600 hover:bg-gray-700 rounded-lg">
            Go to Main Page
          </Button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded border text-center ${message.type === 'success' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          💾 Saves to MariaDB in real-time
        </div>
      </div>
    </div>
  );
}
